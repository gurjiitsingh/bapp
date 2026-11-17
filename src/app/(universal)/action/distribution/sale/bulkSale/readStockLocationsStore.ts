
"use server";

import { getStockLocation } from "./getStockLocationTx";
import { StorageType } from "@/lib/types/distribution/StorageType";

type deliveryTruckSaleItem = {
  productId: string;
  quantity: number;
  wholesalePrice: number;
};

export async function readStockLocationsStore({
  tx,
  items,
  fromLocationType,
  fromLocationRef,
  toLocationType,
  toLocationRef,
}: {
  tx: FirebaseFirestore.Transaction;

  items: deliveryTruckSaleItem[];

  fromLocationType: StorageType;
  fromLocationRef: string;

  toLocationType?: StorageType;
  toLocationRef?: string;
}) {
  const stocks = [];

  for (const item of items) {
    // =========================
    // READ SOURCE STOCK
    // =========================
    const sourceStock = await getStockLocation({
      tx,
      productId: item.productId,
      locationType: fromLocationType,
      locationRef: fromLocationRef,
    });

    if (!sourceStock) {
      throw new Error(
        `Stock not found for product ${item.productId}.`
      );
    }

    // =========================
    // VALIDATE SOURCE QUANTITY
    // =========================
    if (sourceStock.quantity < item.quantity) {
      throw new Error(
        `Insufficient stock for product ${sourceStock.productName}. ` +
        `Available: ${sourceStock.quantity}, Required: ${item.quantity}.`
      );
    }

    // =========================
    // READ DESTINATION STOCK
    // =========================
    let destinationStock = null;

    if (toLocationType && toLocationRef) {
      destinationStock = await getStockLocation({
        tx,
        productId: item.productId,
        locationType: toLocationType,
        locationRef: toLocationRef,
      });
    }

    stocks.push({
      item,
      sourceStock,
      destinationStock,
    });
  }

  return stocks;
}
