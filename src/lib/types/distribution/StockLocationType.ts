import { StorageType } from "./StorageType";

export type StockLocationType = {
  id: string; // `${productId}_${locationType}_${locationRef}`

  productId: string;
  productMode?: string;
  // Snapshot
  productName: string;
  categoryId?: string;
  categoryName?: string;

  locationType: StorageType; 
  locationRef: string; // MAIN, VAN01, WH01

  quantity: number;

   updatedAt: number;
};