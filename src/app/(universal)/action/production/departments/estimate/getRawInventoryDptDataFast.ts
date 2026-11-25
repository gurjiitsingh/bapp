
"use server";

import { adminDb } from "@/lib/firebaseAdmin";

type GetRawInventoryDataParams = {
  tx: FirebaseFirestore.Transaction;
  productId: string;
  quantity: number;
  departmentId: string;
};

export async function getRawInventoryDptDataFast({
  tx,
  productId,
  quantity,
  departmentId,
}: GetRawInventoryDataParams) {
  const updates: any[] = [];

  // ============================================
  // PRODUCTION QUANTITY
  // ============================================

  console.log("📦 RAW quantity received:", quantity);
  console.log("📦 typeof quantity:", typeof quantity);

  const producedQty = Number(quantity);

  console.log("📦 producedQty after Number():", producedQty);
  console.log(
    "📦 Number.isNaN(producedQty):",
    Number.isNaN(producedQty)
  );

  if (!productId) {
    throw new Error("Product ID is required.");
  }

  if (!Number.isFinite(producedQty) || producedQty <= 0) {
    throw new Error(
      `Production quantity must be greater than 0. Received: ${quantity}`
    );
  }

  if (!departmentId) {
    throw new Error("Department ID is required.");
  }

  // ============================================
  // PRODUCT
  // ============================================

  console.log("🔎 Searching product:", productId);

  const productRef = adminDb
    .collection("productStock")
    .doc(productId);

  const productSnap = await tx.get(productRef);

  console.log("📦 Product exists:", productSnap.exists);

  if (!productSnap.exists) {
    throw new Error(`Product not found: ${productId}`);
  }

  // ============================================
  // RECIPES - NEW ARRAY STRUCTURE
  // DOCUMENT ID = PRODUCT ID
  // ============================================

  console.log("🔎 Fetching recipe document:", productId);

  const recipeRef = adminDb
    .collection("productRecipesF")
    .doc(productId);

  const recipeSnap = await tx.get(recipeRef);

  if (!recipeSnap.exists) {
    console.warn(
      "⚠️ NO RECIPES FOUND FOR PRODUCT:",
      productId
    );

    return [];
  }

  const recipeData = recipeSnap.data();

  const recipes = Array.isArray(recipeData?.recipes)
    ? recipeData.recipes
    : [];

  console.log("🍳 Recipe count:", recipes.length);

  if (recipes.length === 0) {
    console.warn(
      "⚠️ EMPTY RECIPES ARRAY FOR PRODUCT:",
      productId
    );

    return [];
  }

  // ============================================
  // LOOP THROUGH RECIPE ARRAY
  // ============================================

  for (const recipe of recipes) {
    const inventoryItemId = recipe.inventoryItemId;

    if (!inventoryItemId) {
      throw new Error(
        `Recipe for product ${productId} has no inventoryItemId.`
      );
    }

    // ==========================================
    // INVENTORY MASTER
    // ==========================================

    const inventoryRef = adminDb
      .collection("inventoryItems")
      .doc(inventoryItemId);

    const inventorySnap = await tx.get(inventoryRef);

    if (!inventorySnap.exists) {
      throw new Error(
        `Inventory item not found: ${inventoryItemId}`
      );
    }

    const inventoryData = inventorySnap.data()!;

    // ==========================================
    // DEPARTMENT STOCK
    // ==========================================

    const departmentStockSnapshot =
      await adminDb
        .collection("departmentStock")
        .where("departmentId", "==", departmentId)
        .where("inventoryItemId", "==", inventoryItemId)
        .limit(1)
        .get();

    // ==========================================
    // REQUIRED QUANTITY
    // ==========================================

    const recipeQuantity = Number(recipe.quantity);

    if (
      !Number.isFinite(recipeQuantity) ||
      recipeQuantity < 0
    ) {
      throw new Error(
        `Invalid recipe quantity for inventory item ${inventoryItemId}: ${recipe.quantity}`
      );
    }

    const requiredQty = recipeQuantity * producedQty;

    // ==========================================
    // NO DEPARTMENT STOCK
    // ==========================================

    if (departmentStockSnapshot.empty) {
      const inventoryAverageCost =
        Number(inventoryData.averageCost) || 0;

      const inventoryConversionFactor =
        Number(inventoryData.conversionFactor) || 1;

      const productionCostInv =
        (requiredQty * inventoryAverageCost) /
        inventoryConversionFactor;

      updates.push({
        inventoryItemId,

        itemName: inventoryData.name || "",

        recipeQuantity,

        requiredQty,

        availableQty: 0,

        shortageQty: requiredQty,

        hasShortage: requiredQty > 0,

        purchaseUnit:
          inventoryData.purchaseUnit ||
          inventoryData.consumptionUnit ||
          "pcs",

        consumptionUnit:
          inventoryData.consumptionUnit || "pcs",

        transactionUnit:
          inventoryData.consumptionUnit || "pcs",

        conversionFactor: inventoryConversionFactor,

        averageCost: inventoryAverageCost,

        unitCost: inventoryAverageCost,

        purchaseUnitCost:
          Number(inventoryData.purchaseUnitCost) || 0,

        stockValue: 0,

        productionCostDpt: 0,
        productionCostInv,

        departmentId,

        departmentStockId: null,
      });

      continue;
    }

    // ==========================================
    // DEPARTMENT STOCK FOUND
    // ==========================================

    const departmentStockDoc =
      departmentStockSnapshot.docs[0];

    const departmentStock = departmentStockDoc.data();

    // ==========================================
    // DEPARTMENT STOCK VALUES
    // ==========================================

    const departmentAverageCost =
      Number(departmentStock.averageCost) || 0;

    const departmentConversionFactor =
      Number(departmentStock.conversionFactor) || 1;

    // ==========================================
    // INVENTORY MASTER VALUES
    // ==========================================

    const inventoryAverageCost =
      Number(inventoryData.averageCost) || 0;

    const inventoryConversionFactor =
      Number(inventoryData.conversionFactor) || 1;

    // ==========================================
    // AVAILABLE QUANTITY
    // ==========================================

    const availableQty =
      Number(departmentStock.currentStock);

    if (!Number.isFinite(availableQty)) {
      throw new Error(
        `Invalid department stock quantity for ${inventoryItemId}: ${departmentStock.currentStock}`
      );
    }

    // ==========================================
    // SHORTAGE
    // ==========================================

    const shortageQty = Math.max(
      requiredQty - availableQty,
      0
    );

    // ==========================================
    // PRODUCTION COST
    // ==========================================

    const productionCostDpt =
      (requiredQty * departmentAverageCost) /
      departmentConversionFactor;

    const productionCostInv =
      (requiredQty * inventoryAverageCost) /
      inventoryConversionFactor;

    // ==========================================
    // FINAL RESULT
    // ==========================================

    const result = {
      inventoryItemId,

      itemName:
        departmentStock.inventoryItemName ||
        inventoryData.name ||
        "",

      recipeQuantity,

      requiredQty,

      availableQty,

      shortageQty,

      hasShortage: shortageQty > 0,

      // ========================================
      // UNITS
      // ========================================

      purchaseUnit:
        departmentStock.purchaseUnit ||
        inventoryData.purchaseUnit ||
        departmentStock.consumptionUnit ||
        inventoryData.consumptionUnit ||
        "pcs",

      consumptionUnit:
        departmentStock.consumptionUnit ||
        inventoryData.consumptionUnit ||
        "pcs",

      transactionUnit:
        departmentStock.consumptionUnit ||
        inventoryData.consumptionUnit ||
        "pcs",

      conversionFactor: departmentConversionFactor,

      // ========================================
      // COST
      // ========================================

      averageCostDptItem: departmentAverageCost,

      averageCostInvItem: productionCostInv,

      unitCost: departmentAverageCost,

      purchaseUnitCost:
        Number(departmentStock.purchaseUnitCost) || 0,

      stockValue:
        Number(departmentStock.stockValue) || 0,

      // ========================================
      // PRODUCTION COST
      // ========================================

      productionCostDpt,

      productionCostInv,

      // ========================================
      // DEPARTMENT
      // ========================================

      departmentId,

      departmentStockId: departmentStockDoc.id,
    };

    updates.push(result);
  }

  return updates;
}
