
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { InventoryUnit } from "@/lib/types/InventoryItemType";
import { getRawInventoryDptDataFast } from "./getRawInventoryDptDataFast";

type EstimateProductionType = {
  id: string;
  quantity: number;
  transactionUnit: InventoryUnit;
  departmentId: string;
};

export async function estimateProductionDptFast({
  id,
  quantity,
  departmentId,
}: EstimateProductionType) {
  if (!id) {
    return {
      success: false,
      message: "Product ID is required",
      items: [],
      expenses: [],
      rawMaterialCost: 0,
      expenseCostPerUnit: 0,
      additionalExpenseCost: 0,
      totalEstimatedCost: 0,
      hasShortage: false,
    };
  }

  if (!quantity || quantity <= 0) {
    return {
      success: false,
      message: "Quantity must be greater than 0",
      items: [],
      expenses: [],
      rawMaterialCost: 0,
      expenseCostPerUnit: 0,
      additionalExpenseCost: 0,
      totalEstimatedCost: 0,
      hasShortage: false,
    };
  }

  try {
    const result = await adminDb.runTransaction(async (tx) => {

      // ----------------------------------------
      // 1. READ RAW MATERIAL RECIPE COST
      // ----------------------------------------

      const rawUpdates = await getRawInventoryDptDataFast({
        tx,
        productId: id,
        quantity,
        departmentId,
      });

   console.log("raw cost------------------",rawUpdates)

    const items = rawUpdates.map((u) => {
          const requiredQty = Number(u.requiredQty) || 0;
          const availableQty = Number(u.availableQty) || 0;

          const shortageQty = Math.max(
            requiredQty - availableQty,
            0
          );

          const unitCost = Number(u.unitCost) || 0;

         // const totalCost = requiredQty * u.averageCostDptItem;
         // const totalCostInv = requiredQty * u.u.averageCostInvItem;
const totalCost = Number(u.productionCostDpt) || 0;
          return {
            inventoryItemId: u.inventoryItemId,
            itemName: u.itemName,
            requiredQty,
            availableQty,
            shortageQty,
            unit: u.transactionUnit,
            consumptionUnit: u.transactionUnit,
            purchaseUnit: u.purchaseUnit,
            conversionFactor: u.conversionFactor,
            unitCost,
            averageCostDptItem:u.averageCostDptItem,
            // averageCostInvItem:u.averageCostInvItem,
            totalCost,
            // totalCostInv,
          };
        });

        console.log("items---------------",items)

        const rawMaterialCost = items.reduce(
          (sum, item) => sum + item.totalCost,
          0
        );

 

      // ----------------------------------------
      // 2. READ PRODUCT ADDITIONAL EXPENSES
      // Document ID = product ID
      // ----------------------------------------

      const productExpenseRef = adminDb
        .collection("productExpenseRecipes")
        .doc(id);

      const productExpenseSnap = await tx.get(
        productExpenseRef
      );

      const productExpenseData = productExpenseSnap.exists
        ? productExpenseSnap.data()
        : null;

      const savedExpenses = Array.isArray(
        productExpenseData?.expenses
      )
        ? productExpenseData.expenses
        : [];

      // Individual expense details
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

          // Calculated for requested production quantity
          estimatedQuantity: expenseQuantity * quantity,
          estimatedTotalCost: totalCostPerUnit * quantity,
        };
      });

      // Expense cost for one finished-product unit
      const calculatedExpenseCost = expenses.reduce(
        (sum: number, expense: any) =>
          sum + expense.totalCostPerUnit,
        0
      );

      const savedTotalExpenseCost =
        productExpenseData?.totalExpenseCost;

      const expenseCostPerUnit =
        savedTotalExpenseCost != null
          ? Number(savedTotalExpenseCost) || 0
          : calculatedExpenseCost;

      // Expense cost for the complete production quantity
      const additionalExpenseCost =
        expenseCostPerUnit * quantity;

      // ----------------------------------------
      // 3. COMBINE BOTH COSTS
      // ----------------------------------------

console.log("toatalcost--------------------",rawMaterialCost,",",additionalExpenseCost)

      const totalEstimatedCost =
        rawMaterialCost + additionalExpenseCost;

      const hasShortage = items.some(
        (item) => item.shortageQty > 0
      );

      return {
        success: true,
        message: "Estimate generated",

        // Recipe/raw material data
        items,
        rawMaterialCost,

        // Additional expense data
        expenses,
        expenseCostPerUnit,
        additionalExpenseCost,

        // Combined estimate
        totalEstimatedCost,

        hasShortage,
      };
    });

    return result;

  } catch (error: any) {
    console.error("estimateProductionDptFast:", error);

    return {
      success: false,
      message:
        error.message || "Failed to estimate production",
      items: [],
      expenses: [],
      rawMaterialCost: 0,
      expenseCostPerUnit: 0,
      additionalExpenseCost: 0,
      totalEstimatedCost: 0,
      hasShortage: false,
    };
  }
}


// "use server";

// import { adminDb } from "@/lib/firebaseAdmin";


// import { InventoryUnit } from "@/lib/types/InventoryItemType";
// import { getRawInventoryData } from "../../../inventory/rawInventory/getRawInventoryData";
// import { getRawInventoryDptData } from "./getRawInventoryDptData";
// import { getRawInventoryDptDataFast } from "./getRawInventoryDptDataFast";


// type EstimateProductionType = {
//   id: string;
//   quantity: number;
//   transactionUnit: InventoryUnit;
//   departmentId: string;
// };

// export async function estimateProductionDptFast({
//   id,
//   quantity,
//   departmentId,
// }: EstimateProductionType) {
//   if (!id) {
//     return {
//       success: false,
//       message: "Product ID is required",
//       items: [],
//       totalEstimatedCost: 0,
//       hasShortage: false,
//     };
//   }

//   if (!quantity || quantity <= 0) {
//     return {
//       success: false,
//       message: "Quantity must be greater than 0",
//       items: [],
//       totalEstimatedCost: 0,
//       hasShortage: false,
//     };
//   }

//   try {
//     const result = await adminDb.runTransaction(
//       async (tx) => {
//         const rawUpdates =
//           await getRawInventoryDptDataFast(
//             {
//               tx,
//               productId: id,
//               quantity,
//               departmentId: departmentId,
//             },
//           );

//         const items = rawUpdates.map((u) => {
//           const requiredQty = Number(u.requiredQty) || 0;
//           const availableQty = Number(u.availableQty) || 0;

//           const shortageQty = Math.max(
//             requiredQty - availableQty,
//             0
//           );

//           const unitCost = Number(u.unitCost) || 0;

//           const totalCost = requiredQty * u.averageCostDptItem;
//          // const totalCostInv = requiredQty * u.u.averageCostInvItem;

//           return {
//             inventoryItemId: u.inventoryItemId,
//             itemName: u.itemName,
//             requiredQty,
//             availableQty,
//             shortageQty,
//             unit: u.transactionUnit,
//             consumptionUnit: u.transactionUnit,
//             purchaseUnit: u.purchaseUnit,
//             conversionFactor: u.conversionFactor,
//             unitCost,
//             averageCostDptItem:u.averageCostDptItem,
//             // averageCostInvItem:u.averageCostInvItem,
//             totalCost,
//             // totalCostInv,
//           };
//         });

//         const totalEstimatedCost = items.reduce(
//           (sum, item) => sum + item.totalCost,
//           0
//         );

//         const hasShortage = items.some(
//           (item) => item.shortageQty > 0
//         );
      
//         return {
//           success: true,
//           message: "Estimate generated",
//           items,
//           totalEstimatedCost,
//           hasShortage,
//         };
//       }
//     );


//     return result;
//   } catch (error: any) {
//     console.error("estimateProduction:", error);

//     return {
//       success: false,
//       message:
//         error.message || "Failed to estimate production",
//       items: [],
//       totalEstimatedCost: 0,
//       hasShortage: false,
//     };
//   }
// }