import React from "react";
import { fetchInventoryItems } from "@/app/(universal)/action/inventory/fetchInventoryItems";
import StockValueList from "./StockValueList";

export default async function Page() {
  const inventoryItems = await fetchInventoryItems();

  return (
    <StockValueList inventoryItems={inventoryItems} />
  );
}