import React from 'react'
import SupplierInventoryrReturnForm from '../components/SupplierInventoryrReturnForm'
import { fetchInventoryItems } from "@/app/(universal)/action/inventory/dbOperation";



import { SupplierType } from "@/lib/types/SupplierType";
import { fetchInventoryItemSuppliersAll } from "@/app/(universal)/action/inventoryItemSupplier/fetchInventoryItemSuppliersAll";



type SupplierMap = Record<
  string,
  SupplierType[]
>;

export default async function Page() {
  const inventoryItems =
    await fetchInventoryItems();

  const inventoryItemSuppliers =
    await fetchInventoryItemSuppliersAll();

  const supplierMap: SupplierMap = {};

  for (const item of inventoryItemSuppliers) {
    const inventoryId =
      item.inventoryItemId;

    if (!supplierMap[inventoryId]) {
      supplierMap[inventoryId] = [];
    }

    if (item.supplier) {
      supplierMap[inventoryId].push(
        item.supplier
      );
    }
  }
 

  return (
   <SupplierInventoryrReturnForm
  inventoryItems={inventoryItems}
  supplierMap={supplierMap}
/>
  );
}
