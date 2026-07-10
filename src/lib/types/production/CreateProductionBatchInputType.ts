export type CreateProductionBatchInputType = {
  departmentId: string;
  departmentName: string;

  items: {
    inventoryItemId: string;
    inventoryItemName: string;
    quantity: number;
    unit: string;
    costPerUnit: number;
  }[];

  note?: string;
};