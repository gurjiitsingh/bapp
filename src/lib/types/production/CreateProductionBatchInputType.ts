export type CreateProductionBatchInputType = {
  departmentId: string;
  departmentName: string;
employeeCount: number;
  items: {
    inventoryItemId: string;
    inventoryItemName: string;

    quantity: number;

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