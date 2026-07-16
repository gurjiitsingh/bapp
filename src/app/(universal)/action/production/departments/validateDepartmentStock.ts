import { DepartmentStockUpdate } from "@/lib/types/department/DepartmentStockUpdate";

 




export function validateDepartmentStock(
  updates: DepartmentStockUpdate[]
) {
  for (const update of updates) {
    if (!update.exists) {
      throw new Error(
        `${update.inventoryItemName} does not exist in the department stock.`
      );
    }

    if (
      update.currentQuantity! < 
      update.quantityChange!
    ) {
      throw new Error(
        `Insufficient stock for "${update.inventoryItemName}". Available: ${update.currentQuantity}, Requested: ${update.quantityChange!}.`
      );
    }
  }
}