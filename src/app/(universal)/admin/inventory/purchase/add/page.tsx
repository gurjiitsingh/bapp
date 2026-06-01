// app/admin/inventory/adjust-stock/page.tsx

import { fetchInventoryItems } from "@/app/(universal)/action/inventory/dbOperation";
import StockPurchaseForm from "../../components/StockPurchaseForm";


import { SupplierType } from "@/lib/types/SupplierType";
import { fetchInventoryItemSuppliersAll } from "@/app/(universal)/action/inventoryItemSupplier/fetchInventoryItemSuppliersAll";

type SupplierMap = Record<string, SupplierType[]>;

export default async function Page() {
  // SERVER FETCH
  const inventoryItems = await fetchInventoryItems();

  const inventoryItemSuppliers = await fetchInventoryItemSuppliersAll();

  // BUILD MAP
  const supplierMap: SupplierMap = {};

  for (const item of inventoryItemSuppliers) {
    const inventoryId = item.inventoryItemId;

    if (!supplierMap[inventoryId]) {
      supplierMap[inventoryId] = [];
    }

    if (item.supplier) {
      supplierMap[inventoryId].push(item.supplier);
    }
  }

  return (
    <StockPurchaseForm
      inventoryItems={inventoryItems}
       supplierMap={supplierMap}
    />
  );
}