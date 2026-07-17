export type DepartmentStockType = {
  inventoryItemId: string;
  inventoryItemName: string;

  quantity: number;
stockValue:number;
  averageCost: number;

  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;

  updatedAt: number;
};