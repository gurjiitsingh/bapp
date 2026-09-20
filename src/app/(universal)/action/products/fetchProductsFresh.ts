'use server' 

import { adminDb } from "@/lib/firebaseAdmin";
import { ProductType } from "@/lib/types/productType";

export async function fetchProductsFresh(): Promise<ProductType[]> {
  try {
    const snapshot = await adminDb
      .collection("products")
      .get();

    if (snapshot.empty) return [];

    return snapshot.docs.map((doc) => {
      const data = doc.data() as Partial<ProductType> & {
        updatedAt?: any;
      };

      let updatedAt: string | null = null;

      if (data.updatedAt) {
        if (
          typeof data.updatedAt.toDate === "function"
        ) {
          updatedAt = data.updatedAt
            .toDate()
            .toISOString();
        } else if (
          typeof data.updatedAt === "string"
        ) {
          updatedAt = data.updatedAt;
        }
      }

      return {
        id: doc.id,

        name: data.name ?? "",

        price: data.price ?? 0,

        currentStock: data.currentStock ?? 0,

        discountPrice: data.discountPrice ?? 0,

        // ⭐ Fresh discount eligibility
        discountEligible:
          data.discountEligible ?? false,

        categoryId: data.categoryId ?? "",

        masterCategoryId:
          data.masterCategoryId ?? "",

        masterCategoryName:
          data.masterCategoryName ?? "",

        parentId: data.parentId ?? "",

        hasVariants: data.hasVariants ?? false,

        hasModifier: data.hasModifier ?? false,

        type: data.type ?? "parent",

        productCat: data.productCat ?? "",

        flavors: data.flavors ?? false,

        publishStatus:
          data.publishStatus ?? "published",

        stockStatus:
          data.stockStatus ?? "out_of_stock",

        baseProductId:
          data.baseProductId ?? "",

        productDesc: data.productDesc ?? "",

        sortOrder: data.sortOrder ?? 0,

        image: data.image ?? "",

        isFeatured: data.isFeatured ?? false,

        favorite: data.favorite ?? false,

        purchaseSession:
          data.purchaseSession ?? null,

        quantity:
          data.currentStock ?? null,

        updatedAt,

        searchCode:
          data.searchCode ?? "",

        taxRate:
          data.taxRate ?? undefined,

        taxType: data.taxType,
      };
    });
  } catch (error) {
    console.error(
      "Failed to fetch products:",
      error
    );

    return [];
  }
}