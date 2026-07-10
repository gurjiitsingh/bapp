import { getDepartments } from "@/app/(universal)/action/department/getDepartments";
import ProductionBatchForm from "./ProductionBatchForm";
import { fetchInventoryItems } from "@/app/(universal)/action/inventory/fetchInventoryItems";
 
 
export default async function Page() {
  const departmentsRaw = await getDepartments();
  const inventoryItemsRaw = await fetchInventoryItems();

 
  // ✅ SAFE mapping (VERY IMPORTANT)
  const departments = (departmentsRaw || []).map((d: any) => ({
    id: d.id,
    name: d.name,
  }));

  const inventoryItems = (inventoryItemsRaw || []).map((i: any) => ({
    id: i.id,
    name: i.name,
    unit: i.unit || "",
    costPrice: i.costPrice || 0,
  }));

  return (
    <ProductionBatchForm
      departments={departments}
      inventoryItems={inventoryItems}
    />
  );
}