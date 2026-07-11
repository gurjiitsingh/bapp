import { getDepartments } from "@/app/(universal)/action/department/getDepartments";
import { fetchInventoryItems } from "@/app/(universal)/action/inventory/fetchInventoryItems";
import StockIssueForm from "./StockIssueForm";
 
 
export default async function Page() {
  const departmentsRaw = await getDepartments();
  const inventoryItemsRaw = await fetchInventoryItems();
console.log("departmentsRaw-------------------------",departmentsRaw)
console.log("inventoryItemsRaw-------------------------",inventoryItemsRaw)
 
  // ✅ SAFE mapping (VERY IMPORTANT)
  const departments = (departmentsRaw || []).map((d: any) => ({
    id: d.id,
    name: d.name,
  }));

const inventoryItems = (inventoryItemsRaw || []).map((i: any) => ({
  id: i.id,
  name: i.name || "",

  sku: i.sku || "",
  barcode: i.barcode || "",

  consumptionUnit: i.consumptionUnit || "pcs",
  purchaseMappings: i.purchaseMappings || [],

  currentStock: Number(i.currentStock) || 0,
  minStock: Number(i.minStock) || 0,

  averageCost: Number(i.averageCost) || 0,
  stockValue: Number(i.stockValue) || 0,

  sellingPrice: Number(i.sellingPrice) || 0,

  categoryId: i.categoryId || "",
  supplierId: i.supplierId || "",
  supplierIds: i.supplierIds || [],

  isActive: i.isActive ?? true,

  createdAt: i.createdAt || null,
  updatedAt: i.updatedAt || null,
}));

  return (
    <StockIssueForm
      departments={departments}
      inventoryItems={inventoryItems}
    />
  );
}