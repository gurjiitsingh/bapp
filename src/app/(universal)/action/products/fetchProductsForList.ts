"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { ProductType } from "@/lib/types/productType";

type FetchProductsForListParams = {
  categoryId?: string;
  search?: string;
};

export async function fetchProductsForList({
  categoryId = "",
  search = "",
}: FetchProductsForListParams): Promise<ProductType[]> {
  try {
    const category = categoryId.trim();
    const q = search.trim().toLowerCase();

    // =====================================================
    // 1. NO CATEGORY + NO SEARCH
    // Do not read products at all
    // =====================================================
    if (!category && !q) {
      return [];
    }

    let query: FirebaseFirestore.Query = adminDb
      .collection("products")
      .where("type", "==", "parent");

    // =====================================================
    // 2. CATEGORY FILTER
    // =====================================================
    if (category) {
      query = query.where("categoryId", "==", category);
    }





// =====================================================
// 3. SEARCH
// Minimum 3 characters
// Prefix search on existing product name
// =====================================================

if (q.length >= 3) {
  query = query
    .orderBy("name")
    .startAt(q)
    .endAt(q + "\uf8ff")
    .limit(20);
} else {
  query = query.orderBy("sortOrder");
}


    const snapshot = await query.get();

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,

        name: data.name ?? "",
        price: data.price ?? 0,
        currentStock: data.currentStock ?? 0,
        discountPrice: data.discountPrice ?? 0,

        categoryId: data.categoryId ?? "",
        masterCategoryId: data.masterCategoryId ?? "",
        masterCategoryName: data.masterCategoryName ?? "",

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

        productDesc:
          data.productDesc ?? "",

        sortOrder:
          data.sortOrder ?? 0,

        image:
          data.image ?? "",

        isFeatured:
          data.isFeatured ?? false,

        favorite:
          data.favorite ?? false,

        purchaseSession:
          data.purchaseSession ?? null,

        quantity:
          data.currentStock ?? 0,

        searchCode:
          data.searchCode ?? "",

        taxRate:
          data.taxRate,

        taxType:
          data.taxType,

        sku:
          data.sku,

        barcode:
          data.barcode,

        minStock:
          data.minStock,

        productMode:
          data.productMode,

        inventoryItemId:
          data.inventoryItemId,

        trackInventory:
          data.trackInventory,

        allowNegativeStock:
          data.allowNegativeStock,
      } as ProductType;
    });
  } catch (error) {
    console.error(
      "Failed to fetch products for ListView:",
      error
    );

    return [];
  }
}