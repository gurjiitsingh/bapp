
import { fetchInventoryItemById, getInventoryItemById } from "@/app/(universal)/action/inventory/dbOperation";
import InventoryEditForm from "../components/InventoryEditForm";



export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  console.log("id-----------",id)
  const item =
    await getInventoryItemById(id);

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
    />
  );
}