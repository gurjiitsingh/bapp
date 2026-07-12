 

export interface DepartmentStockUpdate {
  ref: FirebaseFirestore.DocumentReference | null;
  exists: boolean;

  departmentId: string;

  inventoryItemId: string;
  inventoryItemName: string;

  currentQuantity: number;
  transferQuantity: number;

  averageCost: number;

  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;
}


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
      update.currentQuantity <
      update.transferQuantity
    ) {
      throw new Error(
        `Insufficient stock for "${update.inventoryItemName}". Available: ${update.currentQuantity}, Requested: ${update.transferQuantity}.`
      );
    }
  }
}