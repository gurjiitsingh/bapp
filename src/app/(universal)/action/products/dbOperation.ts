"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { ProductType } from "@/lib/types/productType";

import { newProductSchema, editProductSchema } from "@/lib/types/productType";
import { revalidatePath, revalidateTag } from "next/cache";
import { deleteImage, upload } from "@/lib/cloudinary";
import { fetchCategories } from "@/app/(universal)/action/category/dbOperations";
import { cache } from "react";

import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

//  Cached version — reduces Firestore reads massively
export const fetchProducts = cache(async (): Promise<ProductType[]> => {
  try {
    const snapshot = await adminDb.collection("products").get();

    if (snapshot.empty) return [];

    return snapshot.docs.map((doc) => {
      const data = doc.data() as Partial<ProductType> & { updatedAt?: any };

      let updatedAt: string | null = null;
      if (data.updatedAt) {
        if (typeof data.updatedAt.toDate === "function") {
          updatedAt = data.updatedAt.toDate().toISOString();
        } else if (typeof data.updatedAt === "string") {
          updatedAt = data.updatedAt;
        }
      }

      return {
        id: doc.id,
        name: data.name ?? "",
        price: data.price ?? 0,
        stockQty: data.stockQty ?? 0,
        discountPrice: data.discountPrice ?? 0,
        categoryId: data.categoryId ?? "",
        parentId: data.parentId ?? "",
        hasVariants: data.hasVariants ?? false,
        type: data.type ?? "parent",
        productCat: data.productCat ?? "",
        flavors: data.flavors ?? false,

        publishStatus: data.publishStatus ?? "published",
        stockStatus: data.stockStatus ?? "out_of_stock",

        baseProductId: data.baseProductId ?? "",
        productDesc: data.productDesc ?? "",
        sortOrder: data.sortOrder ?? 0,
        image: data.image ?? "",
        isFeatured: data.isFeatured ?? false,
        purchaseSession: data.purchaseSession ?? null,
        quantity: data.quantity ?? null,
        updatedAt,
        searchCode: data.searchCode ?? "",
        // tax fields
        taxRate: data.taxRate ?? undefined,
        taxType: data.taxType,
      };
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw new Error("Error retrieving product list");
  }
});

export async function addNewProduct(formData: FormData) {
  try {
    const rawHasVariants = formData.get("hasVariants");

    // FINAL, SAFE conversion
    const hasVariants = rawHasVariants === "true";
    const type = formData.get("type") as string;
    const parentId = formData.get("parentId") as string;
    const featured_img = formData.get("isFeatured") === "true";
    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const discountPrice = formData.get("discountPrice") as string;
    const sortOrder = formData.get("sortOrder") as string;
    const categoryId = formData.get("categoryId") as string;

    const productDesc = formData.get("productDesc") as string;
    const image = formData.get("image");
    const status = formData.get("status") as
      | "published"
      | "draft"
      | "out_of_stock";
    const stockQtyRaw = formData.get("stockQty") as string | null;

    //  New tax fields
    const taxRateRaw = formData.get("taxRate") as string | null;
    const taxType = formData.get("taxType") as string | null;
    const searchCode = formData.get("searchCode") as string | null;
    const stockQty = stockQtyRaw ? parseInt(stockQtyRaw, 10) : null;
    const priceF = parseFloat(price.replace(/,/g, ".")) || 0;
    const discountPriceF = parseFloat(discountPrice.replace(/,/g, ".")) || 0;
    const sortOrderN = parseInt(sortOrder || "0", 10);
    const taxRate = taxRateRaw ? parseFloat(taxRateRaw) : null;

    const receivedData = {
      name,
      searchCode,
      price: priceF,
      discountPrice: discountPriceF,
      stockQty,
      sortOrder: sortOrderN,
      categoryId,
      productDesc,
      image,
      isFeatured: featured_img,
      status,
      taxRate,
      taxType,
    };

    const result = newProductSchema.safeParse(receivedData);
    if (!result.success) {
      const zodErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] = issue.message;
      });
      return { errors: zodErrors };
    }

    //  Upload image
    let imageUrl = "/com.jpg";
    if (image && image !== "0") {
      try {
        imageUrl = await upload(image);
      } catch (error) {
        return { errors: { image: "Image upload failed" } };
      }
    }

    //  Fetch category name
    let productCat = "Uncategorized";
    try {
      const categories = await fetchCategories();
      const matchedCategory = categories.find((cat) => cat.id === categoryId);
      if (matchedCategory) productCat = matchedCategory.name;
    } catch (error) {
      console.error("Error fetching categories:", error);
    }

    //  Prepare Firestore document
    const data = {
      name,
      searchCode,
      price: priceF,
      discountPrice: discountPriceF,
      stockQty,
      sortOrder: sortOrderN,
      categoryId,
      parentId,
      hasVariants,
      type,
      productCat,
      productDesc,
      image: image ? imageUrl : null,
      isFeatured: featured_img,
      flavors: false,
      status,
      baseProductId: "",
      purchaseSession: null,
      quantity: null,
      taxRate,
      taxType,
      createdAt: new Date().toISOString(),
    };

    //  Save to Firestore

    const docRef = await adminDb.collection("products").add(data);

    revalidateTag("products", "max");
    revalidateTag("featured-products", "max");

    //    REVALIDATE ALL PRODUCT PAGES
    revalidatePath("/"); // storefront home
    revalidatePath("/products"); // storefront products page
    revalidatePath("/admin/products"); // admin product list

    if (type == "variant") {
      updateProductType(parentId, "parent", true);
    }

    return {
      success: true,
      message: "Product saved successfully",
      id: docRef.id,
    };
  } catch (error) {
    console.error("❌ Firestore add failed:", error);
    return { errors: { general: "Could not save product" } };
  }
}

export async function editProduct(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name");
  const priceRaw = formData.get("price") as string;
  const discountPriceRaw = formData.get("discountPrice") as string;
  const stockQtyS = formData.get("stockQty") as string;
  const sortOrderRaw = formData.get("sortOrder") as string;
  let categoryId = formData.get("categoryId") as string;
  const productDesc = formData.get("productDesc");
  const oldImageUrl = formData.get("oldImageUrl") as string;
  const image = formData.get("image");
  const status = formData.get("status") || "published";
  const searchCode = formData.get("searchCode") as string | null;
  //  isFeatured now correctly handled
  const isFeaturedRaw = formData.get("isFeatured");
  const isFeatured =
    isFeaturedRaw === null
      ? undefined // means: not sent → don’t overwrite
      : isFeaturedRaw === "true";

  //  GST / tax fields
  const taxRateRaw = formData.get("taxRate") as string | null;
  const taxType = (formData.get("taxType") as string | null) ?? null;

  //  Validate received data
  const receivedData = {
    name,
    searchCode,
    price: priceRaw,
    discountPrice: discountPriceRaw,
    stockQty: stockQtyS,
    sortOrder: sortOrderRaw,
    categoryId,
    productDesc,
    image,
    status,
  };

  const result = editProductSchema.safeParse(receivedData);
  if (!result.success) {
    const zodErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      zodErrors[issue.path[0]] = issue.message;
    });
    return { errors: zodErrors };
  }

  // 🔹 Fetch existing product

  const productRef = adminDb.collection("products").doc(id);
  const productSnap = await productRef.get();
  if (!productSnap.exists) {
    return { errors: "Product not found" };
  }

  const existingProduct = productSnap.data();

  // 🔸 Handle image upload
  // let imageUrl = oldImageUrl;
  // if (image && image !== "undefined") {
  //   try {
  //     imageUrl = await upload(image);
  //   } catch (error) {
  //     console.error("Image upload failed:", error);
  //     return { errors: "Image could not be uploaded" };
  //   }
  // } else {
  //   imageUrl = existingProduct?.image || oldImageUrl;
  // }

  // 🔸 Handle image upload + delete old image
  let imageUrl = oldImageUrl;

  if (image && image !== "undefined") {
    try {
      //  Upload new image
      imageUrl = await upload(image);

      //  Delete old Cloudinary image (skip if default image)
      if (oldImageUrl && !oldImageUrl.includes("/com.jpg")) {
        const oldParts = oldImageUrl.split("/");
        const publicId = oldParts.slice(-2).join("/").split(".")[0];
        // ex: anjana-bhog/xyz123

        try {
          await deleteImage(publicId);
          console.log(" Old Cloudinary image deleted:", publicId);
        } catch (err) {
          console.error("❌ Failed to delete old image:", err);
        }
      }
    } catch (error) {
      console.error("Image upload failed:", error);
      return { errors: "Image could not be uploaded" };
    }
  } else {
    //  Keep old image if no new image uploaded
    imageUrl = existingProduct?.image || oldImageUrl;
  }

  // 🔸 Handle category (keep same if not changed)
  if (categoryId === "0" || !categoryId) {
    categoryId = existingProduct?.categoryId || "";
  }

  // 🔹 Fetch category name
  let productCat = "Uncategorized";
  try {
    const categories = await fetchCategories();
    const matchedCategory = categories.find((cat) => cat.id === categoryId);
    if (matchedCategory) productCat = matchedCategory.name;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  // 🔸 Format numbers
  const formatPrice = (val: string): string =>
    Number(parseFloat(val.replace(/,/g, ".")).toFixed(2)).toFixed(2);

  const price = formatPrice(priceRaw);
  const discountPrice = discountPriceRaw
    ? formatPrice(discountPriceRaw)
    : "0.00";
  const sortOrder = parseInt(sortOrderRaw);

  //  Convert taxRate safely
  const taxRate = taxRateRaw ? parseFloat(taxRateRaw) || null : null;

  //  Build update data
  const productData: Record<string, any> = {
    name,
    searchCode,
    price,
    discountPrice,
    stockQty: Number(stockQtyS),
    flavors: existingProduct?.flavors ?? false,
    sortOrder,
    categoryId,
    productCat,
    productDesc,
    image: imageUrl,
    status,
    updatedAt: new Date().toISOString(),
    taxRate,
    taxType: taxType ?? existingProduct?.taxType ?? null,
  };

  //  Only overwrite isFeatured if explicitly sent
  if (typeof isFeatured !== "undefined") {
    productData.isFeatured = isFeatured;
  } else {
    productData.isFeatured = existingProduct?.isFeatured ?? false;
  }

  try {
    await productRef.update(productData);
    revalidateTag("products", "max");
    revalidateTag("featured-products", "max");
    return { message: " Product updated successfully" };
  } catch (error) {
    console.error("❌ Failed to update product:", error);
    return { errors: "Failed to update product" };
  }
}

export async function deleteProduct(id: string, oldImageUrl: string) {
  const docRef = adminDb.collection("products").doc(id);

  try {
    //  Delete Firestore product
    await docRef.delete();
    console.log("Product deleted from Firestore:", id);

    //  Delete image if not default
    if (oldImageUrl !== "/com.jpg") {
      const imagePublicId = oldImageUrl
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];

      try {
        await deleteImage(imagePublicId);
        console.log("Image deleted");
      } catch (error) {
        console.error("Error deleting image:", error);
        // ⚠️ Still revalidate, but return warning
        revalidateTag("products", "max");
        return { errors: "Product deleted, but failed to delete image." };
      }
    }

    //  NOW revalidate cache
    revalidateTag("products", "max");
    revalidateTag("featured-products", "max");

    return { message: "Product and image deleted successfully." };
  } catch (error) {
    console.error("Error deleting product from Firestore:", error);
    return { errors: "Failed to delete product." };
  }
}

//* addition */
export async function fetchAllProducts(): Promise<ProductType[]> {
  const snapshot = await adminDb.collection("products").get();
  const data: ProductType[] = [];

  snapshot.forEach((doc) => {
    const product = { id: doc.id, ...doc.data() } as ProductType;
    data.push(product);
  });

  return data;
}

export async function uploadImage(formData: FormData) {
  console.log("formdata-----", formData);

  let featured_img: boolean = false;
  if (formData.get("isFeatured") === "ture") {
    featured_img = true;
  }

  const name = formData.get("name");
  const price = formData.get("price");
  const discountPrice = formData.get("discountPrice");
  const sortOrder = formData.get("sortOrder") as string;
  const categoryId = formData.get("categoryId");
  const productDesc = formData.get("productDesc");
  const image = formData.get("image"); // type: File or string
  const isFeatured = featured_img;

  let imageUrl: string | null = null;

  if (image && typeof image !== "string") {
    const file = image as File;

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = path.extname(file.name) || ".jpg";
      const fileName = `${Date.now()}-${randomUUID()}${ext}`;
      const tempDir = path.join(process.cwd(), "public", "temp");
      const savePath = path.join(tempDir, fileName);

      // Ensure /public/temp exists
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      fs.writeFileSync(savePath, buffer);
      imageUrl = `/temp/${fileName}`;
      console.log("Image saved to:", imageUrl);
    } catch (err) {
      console.error("Failed to save image:", err);
      return { error: "Image upload failed" };
    }
  } else if (image === "0") {
    imageUrl = "/com.jpg"; // default fallback
  }

  // You can now use `imageUrl` to save in Firestore or return it
  return {
    message: "Image processed successfully",
    imageUrl,
    name,
    price,
    discountPrice,
    sortOrder,
    categoryId,
    productDesc,
    isFeatured,
  };
}

export async function addNewProduct_without_revalidate(formData: FormData) {
  try {
    const featured_img = formData.get("isFeatured") === "true";
    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const discountPrice = formData.get("discountPrice") as string;
    const sortOrder = formData.get("sortOrder") as string;
    const categoryId = formData.get("categoryId") as string;
    const productDesc = formData.get("productDesc") as string;
    const image = formData.get("image");
    const status = formData.get("status") as
      | "published"
      | "draft"
      | "out_of_stock";
    const stockQtyRaw = formData.get("stockQty") as string | null;

    //  New tax fields
    const taxRateRaw = formData.get("taxRate") as string | null; // e.g. "5", "12", "18"
    const taxType = (formData.get("taxType") as string | null) || "GST"; // default to GST if empty

    const stockQty = stockQtyRaw ? parseInt(stockQtyRaw, 10) : null;
    const priceF = parseFloat(price.replace(/,/g, ".")) || 0;
    const discountPriceF = parseFloat(discountPrice.replace(/,/g, ".")) || 0;
    const sortOrderN = parseInt(sortOrder || "0", 10);
    const taxRate = taxRateRaw ? parseFloat(taxRateRaw) : null;

    const receivedData = {
      name,
      price: priceF,
      discountPrice: discountPriceF,
      stockQty,
      sortOrder: sortOrderN,
      categoryId,
      productDesc,
      image,
      isFeatured: featured_img,
      status,
      taxRate,
      taxType,
    };

    //  Validate with Zod schema
    const result = newProductSchema.safeParse(receivedData);
    if (!result.success) {
      const zodErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        zodErrors[issue.path[0]] = issue.message;
      });
      return { errors: zodErrors };
    }

    //  Upload image if exists
    let imageUrl = "/com.jpg";
    if (image && image !== "0") {
      try {
        imageUrl = await upload(image);
      } catch (error) {
        console.error("❌ Image upload failed:", error);
        return { errors: { image: "Image upload failed" } };
      }
    }

    // 🔹 Fetch category name for productCat
    let productCat = "Uncategorized";
    try {
      const categories = await fetchCategories();
      const matchedCategory = categories.find((cat) => cat.id === categoryId);
      if (matchedCategory) {
        productCat = matchedCategory.name;
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
    //  Prepare Firestore document data
    const data = {
      name,
      price: priceF,
      discountPrice: discountPriceF,
      stockQty,
      sortOrder: sortOrderN,
      categoryId,
      productCat,
      productDesc,
      image: image ? imageUrl : null,
      isFeatured: featured_img,
      flavors: false,
      status,
      baseProductId: "",
      purchaseSession: null,
      quantity: null,
      taxRate: taxRate ?? null, //  Save tax rate
      taxType: taxType ?? "GST", //  Save tax type
      createdAt: new Date().toISOString(),
    };

    console.log("data---------------", data);

    //  Save to Firestore
    const docRef = await adminDb.collection("products").add(data);
    return {
      success: true,
      message: "Product saved successfully",
      id: docRef.id,
    };
  } catch (error) {
    console.error("❌ Firestore add failed:", error);
    return { errors: { general: "Could not save product" } };
  }
}

export async function fetchProductById(
  id: string
): Promise<ProductType | null> {
  try {
    const docSnap = await adminDb.collection("products").doc(id).get();

    if (!docSnap.exists) {
      console.warn(`No product found with ID: ${id}`);
      return null;
    }

    const data = docSnap.data();


    const product: ProductType = {
      id: docSnap.id,
      name: data?.name ?? "",
      price: data?.price ?? 0,
      stockQty: data?.stockQty ?? 0,
      discountPrice: data?.discountPrice ?? undefined,
      categoryId: data?.categoryId ?? "",
      productCat: data?.productCat ?? undefined,
      baseProductId: data?.baseProductId ?? "",
      productDesc: data?.productDesc ?? "",
      sortOrder: data?.sortOrder ?? 0,
      image: data?.image ?? "",
      isFeatured: data?.isFeatured ?? false,
      purchaseSession: data?.purchaseSession ?? null,
      quantity: data?.quantity ?? null,
      flavors: data?.flavors ?? false,
      publishStatus: data?.publishStatus ?? "draft",
      stockStatus: data?.stockStatus ?? "out_of_stock",
      searchCode: data?.searchCode ?? "",
      //  New GST / Tax Fields (safe fallbacks)
      taxRate: data?.taxRate ?? null,
      taxType: data?.taxType ?? null,
    };

    return product;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    throw new Error("Error fetching product");
  }
}

export async function fetchProductByCategoryId(
  id: string
): Promise<ProductType[]> {
  console.log("by id ---------------");
  try {
    const querySnapshot = await adminDb
      .collection("products")
      .where("categoryId", "==", id)
      .get();

    if (querySnapshot.empty) {
      console.warn(`No products found for categoryId: ${id}`);
      return [];
    }

    const products: ProductType[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as ProductType[];

    return products;
  } catch (error) {
    console.error("Error fetching products by category ID:", error);
    throw new Error("Failed to retrieve products for this category");
  }
}

export async function fetchProductsForExport(): Promise<ProductType[]> {
  const snapshot = await adminDb.collection("product").get();

  const data: ProductType[] = snapshot.docs.map((doc) => {
    return { id: doc.id, ...doc.data() } as ProductType;
  });

  return data;
}

export async function fetchProductsForBestOfMonth(): Promise<ProductType[]> {
  const snapshot = await adminDb.collection("product").get();

  const data: ProductType[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ProductType[];

  return data.filter((p) => p.isFeatured === true);
}

/**
 * Toggle the 'isFeatured' field on a product document.
 * Works with Firebase Admin SDK for secure, server-side updates.
 */
export async function toggleFeatured(productId: string, isFeatured: boolean) {
  try {
    const productRef = adminDb.collection("products").doc(productId);
    await productRef.update({ isFeatured });

    revalidateTag("featured-products", "max");
    return {
      success: true,
      message: `Product ${isFeatured ? "featured" : "unfeatured"
        } successfully.`,
    };
  } catch (error) {
    console.error("Error toggling featured status:", error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Upload a product to Firestore from CSV data
 */
export async function uploadProductFromCSV(data: Partial<ProductType>) {
  if (!data.name || data.price === undefined) {
    throw new Error("Missing required fields: name or price");
  }



  const productData: Omit<ProductType, "id"> = {
    name: data.name,
    price: Number(data.price),
    discountPrice:
      data.discountPrice !== undefined ? Number(data.discountPrice) : 0,
    stockQty: data.stockQty ?? 0,
    categoryId: data.categoryId ?? "",
    productCat: data.productCat ?? "",
    baseProductId: data.baseProductId ?? "",
    productDesc: data.productDesc ?? "",
    sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : 0,
    image: data.image ?? "",
    isFeatured: String(data.isFeatured).toLowerCase() === "true" ? true : false,
    purchaseSession: data.purchaseSession ?? null,
    quantity:
      data.quantity !== undefined && data.quantity !== null
        ? Number(data.quantity)
        : null,
    flavors: String(data.flavors).toLowerCase() === "true" ? true : false,
    publishStatus: data?.publishStatus ?? "draft",
    stockStatus: data.stockStatus ?? "out_of_stock",
    searchCode: data?.searchCode ?? "",
    // status:
    //   data.publishStatus === "published" ||
    //   data.publishStatus === "draft" ||
    //   data.publishStatus === "out_of_stock"
    //     ? data.publishStatus
    //     : undefined,
    taxRate: data.taxRate ?? 0,
    taxType: data.taxType ?? "inclusive",
  };

  await adminDb.collection("products").add(productData);
}

type TypeT = "parent" | "variant";

export async function updateProductType(
  id: string,
  type: TypeT,
  hasVariants: boolean
) {
  try {
    const productRef = adminDb.collection("products").doc(id);
    const productSnap = await productRef.get();

    if (!productSnap.exists) {
      return { errors: "Product not found" };
    }

    await productRef.update({
      type,
      hasVariants,
      updatedAt: new Date(),
    });

    return { message: " Product updated successfully" };
  } catch (error) {
    console.error("❌ Failed to update product:", error);
    return { errors: "Failed to update product" };
  }
}
