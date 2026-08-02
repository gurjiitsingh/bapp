import { getDepartmentStockItemByDocId } from "@/app/(universal)/action/production/departments/getDepartmentStockItemByDocId";
import { notFound } from "next/navigation";
import EditDepartmentStockForm from "./EditDepartmentStockForm";
import { getInventoryStockByInventoryItem } from "@/app/(universal)/action/production/departments/fetchdata/getInventoryStockByInventoryItem";
import { getInventoryPurchaseMappings } from "@/app/(universal)/action/production/departments/fetchdata/getInventoryPurchaseMappings";



type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({
  params,
}: Props) {
  const { id } = await params;

  const stock = await getDepartmentStockItemByDocId(id);
     

    const inventoryResult =
      await getInventoryPurchaseMappings(stock!.inventoryItemId);
 console.log("inventoryResult------------------", inventoryResult)
    

  if (!stock) {
    notFound();
  }

  

  return (
    <div className="p-6">
      <EditDepartmentStockForm
        stock={stock}
        purchaseMappings={inventoryResult.data ?? []}
      />
    </div>
  );
}