"use server";

type RecipeItemInput = {
  inventoryItemId: string;
  inventoryItemName?: string;
  quantity: number;

  purchaseUnit?: string;
  consumptionUnit?: string;

  conversionFactor?: number;

  averageCost?: number;
  costPerUnit?: number;
};

type RecipesEstimatorInput = {
  productId: string;
  productName: string;
  finishedProductQuantity: number;
  items: RecipeItemInput[];
  note?: string;
};

export async function newRecipesEstimatorAction(
  input: RecipesEstimatorInput
) {
  try {
    console.log(
      "================ RECIPE ESTIMATOR ================"
    );

    console.log(
      "Finished product amount:",
      input.finishedProductQuantity
    );

    const recipe = input.items.map((item) => {
      const qtyInGrams =
        Number(item.quantity || 0) *
        Number(item.conversionFactor || 1);

      const requiredInventoryItemAmount =
        qtyInGrams /
        Number(input.finishedProductQuantity);

      console.log(
        "Inventory Used:",
        qtyInGrams
      );

      console.log(
        "Inventory Used per kg finished product:",
        requiredInventoryItemAmount
      );

      return {
        inventoryItemId: item.inventoryItemId,

        inventoryItemName:
          item.inventoryItemName || "",

        quantity: qtyInGrams,

        requiedInvetroyItemAmount:
          requiredInventoryItemAmount,

        purchaseUnit:
          item.purchaseUnit || "",

        consumptionUnit:
          item.consumptionUnit || "",
      };
    });

    console.log(
      "Recipe:",
      recipe
    );

    console.log(
      "===================================================="
    );

    return {
      success: true,
      message: "Recipe calculated successfully",
      recipe,
    };

  } catch (error) {
    console.error(
      "recipesEstimatorAction error:",
      error
    );

    return {
      success: false,
      message: "Failed to calculate recipe",
      recipe: [],
    };
  }
}