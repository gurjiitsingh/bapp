export interface DepartmentStockUpdate {
  ref: FirebaseFirestore.DocumentReference | null;
  exists: boolean;

  departmentId: string;

  inventoryItemId: string;
  inventoryItemName: string;

  averageCost?: number;
 newPurchaseUnitCost: number,
  quantity?: number;

  quantityChange?: number;
  currentQuantity?: number;
  newQuantity?: number;

  newAverageCost?: number;
  newStockValue?: number;

  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;

  purchaseMappings?: {
    purchaseUnit: string;
    consumptionUnit: string;
    factor: number;
  }[];
}