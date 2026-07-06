export type StockMovementType = {
  id: string;

  movementType: "TRANSFER";

  productId: string;
  productName: string;
  productMode: "raw_stock" | "finished_stock" | "simple";
locationCode:string;
responsiblePerson:string;
  quantity: number;
name: string;
  fromLocationType: string;
  fromLocationRef: string;
  fromLocationName: string;

  toLocationType: string;
  toLocationRef: string;
  toLocationName: string;

  remarks: string;

  createdBy: string;

  createdAt: number;
};