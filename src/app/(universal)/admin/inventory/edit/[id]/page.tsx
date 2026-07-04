import { getInventoryItemById } from "@/app/(universal)/action/inventory/dbOperation";
import InventoryEditForm from "../../components/InventoryEditForm";
import { fetchSuppliers } from "@/app/(universal)/action/inventorySupplier/fetchSuppliers";
import { fetchInventoryCategories } from "@/app/(universal)/action/inventoryCategory/fetchInventoryCategories";
import { getUnitConversions } from "@/app/(universal)/action/inventory/init/unit-conversion/getUnitConversions";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {

 
 
  const { id } = await params;

  const [
    item,
    categories,
    suppliers,
    unitConversions,
  ] = await Promise.all([
    getInventoryItemById(id),
    fetchInventoryCategories(),
    fetchSuppliers(),
    getUnitConversions(),
  ]);

  if (!item) {
    return (
      <div>
        Inventory item not found
      </div>
    );
  }

  return (
    <InventoryEditForm
      inventoryItem={item}
      categories={categories}
      suppliers={suppliers}
      unitConversions={unitConversions}
    />
  );
}