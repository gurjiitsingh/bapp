"use server";

import { adminDb } from "@/lib/firebaseAdmin";

type EstimateProductionType = {
  id: string;
  quantity: number;
};

export async function estimateProductionCost({
  id,
  quantity,
}: EstimateProductionType) {

  

  const emptyResult = {
    success: false,
    message: "",
    items: [] as any[],
    expenses: [] as any[],
    rawMaterialCost: 0,
    expenseCostPerUnit: 0,
    additionalExpenseCost: 0,
    totalEstimatedCost: 0,
  };

  if (!id) {
    return {
      ...emptyResult,
      message: "Product ID is required",
    };
  }

  if (!Number.isFinite(Number(quantity)) || quantity <= 0) {
    return {
      ...emptyResult,
      message: "Quantity must be greater than 0",
    };
  }

  try {
    const result = await adminDb.runTransaction(async (tx) => {
      const producedQty = Number(quantity);

      // ==========================================
      // 1. READ PRODUCT RECIPE
      // ==========================================

      const recipeRef = adminDb
        .collection("productRecipesF")
        .doc(id);

      const recipeSnap = await tx.get(recipeRef);

      const recipeData = recipeSnap.exists
        ? recipeSnap.data()
        : null;

      const recipes = Array.isArray(recipeData?.recipes)
        ? recipeData.recipes
        : [];

      // ==========================================
      // 2. READ ADDITIONAL EXPENSES
      // ==========================================

      const expenseRef = adminDb
        .collection("productExpenseRecipes")
        .doc(id);

      const expenseSnap = await tx.get(expenseRef);

      const expenseData = expenseSnap.exists
        ? expenseSnap.data()
        : null;

      const savedExpenses = Array.isArray(expenseData?.expenses)
        ? expenseData.expenses
        : [];

      // ==========================================
      // 3. READ INVENTORY MASTER DATA
      // No department stock involved
      // ==========================================

      const inventoryResults = await Promise.all(
        recipes.map(async (recipe: any) => {
          const inventoryItemId = recipe.inventoryItemId;

          if (!inventoryItemId) {
            throw new Error(
              "A product recipe is missing its inventory item ID."
            );
          }

          const inventoryRef = adminDb
            .collection("inventoryItems")
            .doc(inventoryItemId);

          const inventorySnap = await tx.get(inventoryRef);

          if (!inventorySnap.exists) {
            throw new Error(
              `Inventory item not found: ${inventoryItemId}`
            );
          }

          return {
            recipe,
            inventory: inventorySnap.data(),
          };
        })
      );

      // ==========================================
      // 4. CALCULATE RAW MATERIAL COST
      // ==========================================

      const items = inventoryResults.map(
        ({ recipe, inventory }: any) => {
          const recipeQuantity = Number(recipe.quantity) || 0;

          if (
            !Number.isFinite(recipeQuantity) ||
            recipeQuantity < 0
          ) {
            throw new Error(
              `Invalid recipe quantity for ${inventory.name || recipe.inventoryItemId}`
            );
          }

          const requiredQty = recipeQuantity * producedQty;

          const averageCost =
            Number(inventory.averageCost) || 0;

          const conversionFactor =
            Number(inventory.conversionFactor) || 1;

          if (
            !Number.isFinite(conversionFactor) ||
            conversionFactor <= 0
          ) {
            throw new Error(
              `Invalid conversion factor for ${inventory.name || recipe.inventoryItemId}`
            );
          }

          // Same inventory-master cost calculation
          // previously used for productionCostInv.

          const totalCost =
            (requiredQty * averageCost) / conversionFactor;
 
          return {
            inventoryItemId: recipe.inventoryItemId,

            itemName:
              recipe.inventoryItemName ||
              inventory.name ||
              "",

            recipeQuantity,
            requiredQty,

            unit:
              recipe.unit ||
              inventory.consumptionUnit ||
              "pcs",

            purchaseUnit:
              inventory.purchaseUnit || "",

            consumptionUnit:
              inventory.consumptionUnit || "pcs",

            conversionFactor,

            unitCost: averageCost,
            averageCost,

            totalCost,
          };
        }
      );

      const rawMaterialCost = items.reduce(
        (sum, item) => sum + item.totalCost,
        0
      );

      // ==========================================
      // 5. CALCULATE ADDITIONAL EXPENSES
      // ==========================================

      const expenses = savedExpenses.map((expense: any) => {
        const expenseQuantity =
          Number(expense.quantity) || 0;

        const cost = Number(expense.cost) || 0;

        const totalCostPerUnit =
          Number(expense.totalCost) || 0;

        return {
          expenseMasterId: expense.expenseMasterId ?? "",
          expenseName: expense.expenseName ?? "",
          quantity: expenseQuantity,
          unit: expense.unit ?? "",
          cost,
          totalCostPerUnit,

          estimatedQuantity:
            expenseQuantity * producedQty,

          estimatedTotalCost:
            totalCostPerUnit * producedQty,
        };
      });

      const calculatedExpenseCost = expenses.reduce(
        (sum: number, expense: any) =>
          sum + expense.totalCostPerUnit,
        0
      );

      const savedTotalExpenseCost =
        expenseData?.totalExpenseCost;

      const expenseCostPerUnit =
        savedTotalExpenseCost != null
          ? Number(savedTotalExpenseCost) || 0
          : calculatedExpenseCost;

      const additionalExpenseCost =
        expenseCostPerUnit * producedQty;

      // ==========================================
      // 6. COMBINE COSTS
      // ==========================================

      const totalEstimatedCost =
        rawMaterialCost + additionalExpenseCost;

      
      return {
        success: true,
        message: "Product cost estimate generated",

        items,
        rawMaterialCost,

        expenses,
        expenseCostPerUnit,
        additionalExpenseCost,

        totalEstimatedCost,
      };
    });

    return result;

  } catch (error: any) {
    console.error("estimateProductionCost:", error);

    return {
      ...emptyResult,
      message:
        error.message || "Failed to estimate product cost",
    };
  }
}