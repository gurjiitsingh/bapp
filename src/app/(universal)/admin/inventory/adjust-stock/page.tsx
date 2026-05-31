// app/admin/inventory/adjust-stock/page.tsx


import {
  fetchInventoryItems,
} from "@/app/(universal)/action/inventory/dbOperation";
import StockAdjustmentForm from "../components/StockAdjustmentForm";

export default async function Page() {

  // SERVER FETCH
  const inventoryItems =
    await fetchInventoryItems();

    console.log("inventoryItems----------", inventoryItems)

  return (
    <StockAdjustmentForm
      inventoryItems={inventoryItems}
    />
  );
}