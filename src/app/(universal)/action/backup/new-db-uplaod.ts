// app/backup/serverActions.ts
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { categoryType } from "@/lib/types/categoryType";
import { ProductType } from "@/lib/types/productType";
import { writeFile } from "fs/promises";
import path from "path";

// EXPORT FUNCTION
export async function downloadProductsJSON() {
  const snapshot = await adminDb.collection("products").get();

  const products: ProductType[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as ProductType[];

  // convert undefined -> null
  const cleaned = products.map((p) =>
    JSON.parse(JSON.stringify(p))
  );

  const filePath = path.join(process.cwd(), "public", "products-backup.json");

  await writeFile(filePath, JSON.stringify(cleaned, null, 2));

  return;
}

// IMPORT FUNCTION
export async function uploadProductsJSON(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) throw new Error("No file uploaded");

  const text = await file.text();
  const products: ProductType[] = JSON.parse(text);

  const batch = adminDb.batch();

  products.forEach((product) => {
    const ref = adminDb.collection("products").doc(product.id);

    const { id, ...data } = product;

    batch.set(ref, data);
  });

  await batch.commit();

  return;
}



export async function uploadCategoriesJSON(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) throw new Error("No file uploaded");

  const text = await file.text();
  const categories: categoryType[] = JSON.parse(text);

  const batch = adminDb.batch();

  categories.forEach((category) => {
    if (!category.id) return;

    const ref = adminDb.collection("category").doc(category.id);

    const { id, ...data } = category;

    batch.set(ref, data);
  });

  await batch.commit();
}


import { FieldValue } from "firebase-admin/firestore";

// IMPORT FUNCTION 
export async function uploadProductsJSONSys(formData: FormData) {
  const file = formData.get("file") as File;

  if (!file) throw new Error("No file uploaded");

  const text = await file.text();
  const products: ProductType[] = JSON.parse(text);

  const batch = adminDb.batch();

  products.forEach((product) => {
    // ✅ Auto-generate document ID
    const ref = adminDb.collection("products").doc();

    const { id, ...data } = product;

    batch.set(ref, {
      ...data,
      id: ref.id, // ✅ store generated ID inside document
      createdAt: FieldValue.serverTimestamp(), // ✅ Firestore timestamp
    });
  });

  await batch.commit();

  return;
}







// ========================================================
// CSV PARSER
// Supports quoted values and commas inside quoted fields.
// ========================================================

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === '"') {
      if (inQuotes && text[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(field.trim());
      field = "";
    } else if (
      (char === "\n" || char === "\r") &&
      !inQuotes
    ) {
      if (char === "\r" && text[i + 1] === "\n") {
        i++;
      }

      row.push(field.trim());

      if (row.some((value) => value !== "")) {
        rows.push(row);
      }

      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (inQuotes) {
    throw new Error("Invalid CSV: unclosed quoted field.");
  }

  if (field !== "" || row.length > 0) {
    row.push(field.trim());

    if (row.some((value) => value !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

// ========================================================
// UPLOAD PRODUCTS CSV
// ========================================================


export async function uploadProductsCSV(formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please select a CSV file.");
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new Error("Please upload a .csv file.");
  }

  const text = (await file.text()).replace(/^\uFEFF/, "");
  const rows = parseCSV(text);

  if (rows.length < 2) {
    throw new Error(
      "CSV must contain a header and at least one product."
    );
  }

  // ========================================================
  // 1. READ CSV HEADERS
  // ========================================================

  const headers = rows[0].map((header) =>
    header.trim().toLowerCase()
  );

  const nameIndex = headers.indexOf("name");
  const categoryIndex = headers.findIndex(
  (header) =>
    header === "categoryname" ||
    header === "category"
);
  const priceIndex = headers.indexOf("price");

const missingColumns: string[] = [];

if (nameIndex === -1) {
  missingColumns.push("name");
}

if (categoryIndex === -1) {
  missingColumns.push("categoryName");
}

if (priceIndex === -1) {
  missingColumns.push("price");
}

if (missingColumns.length > 0) {
  throw new Error(
    `Missing required CSV column(s): ${missingColumns.join(", ")}. ` +
    `Expected headers: name, categoryName, price.`
  );
}

  // ========================================================
  // 2. VALIDATE CSV PRODUCTS
  // ========================================================

  const products = rows.slice(1).map((row, index) => {
    const rowNumber = index + 2;

    const name = row[nameIndex]?.trim();
    const category = row[categoryIndex]?.trim();
    const priceText = row[priceIndex]?.trim();
    const price = Number(priceText);

    if (!name || !category || priceText === "") {
      throw new Error(
        `Row ${rowNumber}: name, category and price are required.`
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      throw new Error(
        `Row ${rowNumber}: invalid price "${priceText}".`
      );
    }

    return {
      name,
      category,
      price,
    };
  });

  // ========================================================
  // 3. FETCH CATEGORIES FROM FIRESTORE
  // ========================================================

  const categorySnapshot = await adminDb
    .collection("category")
    .get();

  // Map category name -> Firestore document ID.
  // Case-insensitive matching; ignores surrounding spaces.
  const categoryIdMap = new Map<string, string>();

  for (const doc of categorySnapshot.docs) {
    const data = doc.data();
    const categoryName = data.name;

    if (typeof categoryName !== "string" || !categoryName.trim()) {
      continue;
    }

    const key = categoryName.trim().toLowerCase();

    if (categoryIdMap.has(key)) {
      throw new Error(
        `Duplicate category name "${categoryName}" exists in Firestore. ` +
        "Please resolve duplicate categories before uploading."
      );
    }

    categoryIdMap.set(key, doc.id);
  }

  // ========================================================
  // 4. MATCH EVERY PRODUCT TO ITS CATEGORY ID
  // ========================================================

  const productsWithCategoryId = products.map(
    (product, index) => {
      const key = product.category.trim().toLowerCase();
      const categoryId = categoryIdMap.get(key);

      if (!categoryId) {
        throw new Error(
          `Row ${index + 2}: category "${product.category}" ` +
          'was not found in the Firestore "category" collection. ' +
          "Upload the category first or correct its name."
        );
      }

      return {
        ...product,
        categoryId,
      };
    }
  );

  // ========================================================
  // 5. UPLOAD PRODUCTS IN BATCHES
  // ========================================================

  const collection = adminDb.collection("products");

  let uploadedCount = 0;

  for (
    let start = 0;
    start < productsWithCategoryId.length;
    start += 500
  ) {
    const chunk = productsWithCategoryId.slice(
      start,
      start + 500
    );

    const batch = adminDb.batch();

    chunk.forEach((product, index) => {
      const ref = collection.doc();
      const id = ref.id;

      const data: Omit<ProductType, "id"> = {
        name: product.name,
        price: product.price,

        quantity: null,

        discountEligible: true,
        discountPrice: 0,
        type: "parent",
        // Actual Firestore category document ID.
        categoryId: product.categoryId,

        // Keep the category name.
        productCat: product.category,

        baseProductId: id,
        productDesc: "",
        sortOrder: start + index,

        image: "/com.jpg",

        isFeatured: false,
        favorite: false,

        publishStatus: "published",
        stockStatus: "in_stock",

        taxRate: 0,
        taxType: "exclusive",

        purchaseSession: null,
      };

      batch.set(ref, data);
    });

    await batch.commit();
    uploadedCount += chunk.length;
  }

  console.log(
    `${uploadedCount} products uploaded successfully.`
  );

  return;
}


export async function uploadProductsCSV_(formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please select a CSV file.");
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new Error("Please upload a .csv file.");
  }

  const text = (await file.text()).replace(/^\uFEFF/, "");

  const rows = parseCSV(text);

  if (rows.length < 2) {
    throw new Error(
      "CSV must contain a header and at least one product."
    );
  }

// Normalize headers
const headers = rows[0].map((header) =>
  header
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
);

console.log("CSV headers detected:", headers);

const nameIndex = headers.indexOf("name");
const categoryIndex = headers.findIndex(
  (header) =>
    header === "categoryname" ||
    header === "category"
);
const priceIndex = headers.indexOf("price");

const missingColumns: string[] = [];

if (nameIndex === -1) {
  missingColumns.push("name");
}

if (categoryIndex === -1) {
  missingColumns.push("categoryName");
}

if (priceIndex === -1) {
  missingColumns.push("price");
}

if (missingColumns.length > 0) {
  throw new Error(
    `Missing CSV column(s): ${missingColumns.join(", ")}. ` +
    `Detected headers: ${headers.join(", ")}. ` +
    `Expected: name, categoryName, price.`
  );
}

  // Validate and prepare products before writing anything.
  const products = rows.slice(1).map((row, index) => {
    const rowNumber = index + 2;

    const name = row[nameIndex]?.trim();
    const category = row[categoryIndex]?.trim();
    const priceText = row[priceIndex]?.trim();
    const price = Number(priceText);

    if (!name || !category || priceText === "") {
      throw new Error(
        `Row ${rowNumber}: name, category and price are required.`
      );
    }

    if (!Number.isFinite(price) || price < 0) {
      throw new Error(
        `Row ${rowNumber}: invalid price "${priceText}".`
      );
    }

    return {
      name,
      category,
      price,
    };
  });

  const collection = adminDb.collection("products");

  let uploadedCount = 0;

  // Firestore permits at most 500 writes per batch.
  for (let start = 0; start < products.length; start += 500) {
    const chunk = products.slice(start, start + 500);
    const batch = adminDb.batch();

    for (const product of chunk) {
      // Generate a new unique Firestore document ID.
      const ref = collection.doc();
      const id = ref.id;

      const data: Omit<ProductType, "id"> = {
        name: product.name,
        price: product.price,

        quantity: null,
         type: "parent",
        discountEligible: true,
        discountPrice: 0,

        categoryId: "",
        productCat: product.category,

        baseProductId: id,
        productDesc: "",
        sortOrder: start + chunk.indexOf(product),

        image: "/com.jpg",

        isFeatured: false,
        favorite: false,

        publishStatus: "published",
        stockStatus: "in_stock",

        // Defaults for the required tax fields.
        taxRate: 0,
        taxType: "exclusive",

        purchaseSession: null,
      };

      batch.set(ref, data);
    }

    await batch.commit();
    uploadedCount += chunk.length;
  }

  console.log(
    `${uploadedCount} products uploaded successfully.`
  );

  return;
}




// ========================================================
// UPLOAD CATEGORIES FROM PRODUCT CSV
// Reads unique category names from the "category" column.
// ========================================================

export async function uploadCategoriesCSV(formData: FormData) {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please select a CSV file.");
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    throw new Error("Please upload a .csv file.");
  }

  const text = (await file.text()).replace(/^\uFEFF/, "");
  const rows = parseCSV(text);

  if (rows.length < 2) {
    throw new Error(
      "CSV must contain a header and at least one product."
    );
  }

  const headers = rows[0].map((header) =>
    header.trim().toLowerCase()
  );

  const categoryIndex = headers.findIndex(
  (header) =>
    header === "categoryname" ||
    header === "category"
);

  if (categoryIndex === -1) {
    throw new Error(
      'CSV must contain a "category" column.'
    );
  }

  // Extract unique category names, ignoring case differences.
  const uniqueCategories = new Map<string, string>();

  for (const row of rows.slice(1)) {
    const categoryName = row[categoryIndex]?.trim();

    if (!categoryName) continue;

    const key = categoryName.toLowerCase();

    if (!uniqueCategories.has(key)) {
      uniqueCategories.set(key, categoryName);
    }
  }

  if (uniqueCategories.size === 0) {
    throw new Error("No category names found in the CSV.");
  }

  const categoryCollection = adminDb.collection("category");
  const categories = [...uniqueCategories.values()];

  // Firestore allows at most 500 writes per batch.
  for (let start = 0; start < categories.length; start += 500) {
    const batch = adminDb.batch();

    const chunk = categories.slice(start, start + 500);

    for (let i = 0; i < chunk.length; i++) {
      const name = chunk[i];

      // Generate a unique category document ID.
      const ref = categoryCollection.doc();
      const id = ref.id;

      const data: Omit<categoryType, "id"> = {
        name,
        desc: "",
        image: "/com.jpg",
        taxType: "exclusive",
        sortOrder: start + i,
      };

      batch.set(ref, data);
    }

    await batch.commit();
  }

  console.log(
    `${categories.length} categories uploaded successfully.`
  );
}