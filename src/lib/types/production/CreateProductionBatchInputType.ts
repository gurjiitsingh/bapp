export type CreateProductionBatchInputType = {
  departmentId: string;
  departmentName: string;
   managerName?: string;
employeeCount?: number;
  items: {
    inventoryItemId: string;
    inventoryItemName: string;

    quantity: number;
purchaseUnitCost: number;
// purchaseUnitCostInv: number;
    purchaseUnit: string;
    consumptionUnit: string;

    conversionFactor: number;

    averageCost: number;
    costPerUnit: number;

    purchaseMappings?: {
      purchaseUnit: string;
      consumptionUnit: string;
      factor: number;
    }[];
  }[];

  note?: string;
};