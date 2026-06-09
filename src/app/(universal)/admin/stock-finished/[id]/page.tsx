
import { fetchInventoryItemById, getInventoryItemById } from "@/app/(universal)/action/stock-finished/dbOperation";




export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  console.log("id-----------",id)
  const item =
    await getInventoryItemById(id);

  //    const categories =
  //       await fetchInventoryCategories();
  // const suppliers = await fetchSuppliers();

  if (!item) {
    return (
      <div>
        Inventory item not found
      </div>
    );
  }

  return (<>
    {/* <InventoryEditForm
      
      inventoryItem={item}
      
       suppliers={suppliers}
    /> */}
    </>
  );
}