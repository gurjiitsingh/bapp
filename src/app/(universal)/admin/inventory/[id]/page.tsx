
import { fetchInventoryItemById, getInventoryItemById } from "@/app/(universal)/action/inventory/dbOperation";
import InventoryEditForm from "../components/InventoryEditForm";
import { fetchSuppliers } from "@/app/(universal)/action/inventorySupplier/fetchSuppliers";
import { fetchInventoryCategories } from "@/app/(universal)/action/inventoryCategory/fetchInventoryCategories";



export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  console.log("id-----------",id)
  const item =
    await getInventoryItemById(id);

     const categories =
        await fetchInventoryCategories();
  const suppliers = await fetchSuppliers();
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
    />
  );
}