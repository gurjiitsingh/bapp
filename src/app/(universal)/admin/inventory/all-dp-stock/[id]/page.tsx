import { getDepartmentStockByInventoryItem } from '@/app/(universal)/action/production/departments/fetchdata/getDepartmentStockByInventoryItem';
 
import DepartmentItemStockTable from './DepartmentItemStockTable';
import { getInventoryStockByInventoryItem } from '@/app/(universal)/action/production/departments/fetchdata/getInventoryStockByInventoryItem';
import { auditDepartmentStockAgainstBenchmark } from '@/app/(universal)/action/production/departments/fetchdata/auditDepartmentStockAgainstBenchmark';

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({
  params,
}: Props) {

  const { id } = await params;

  // Department stock
  const result =
    await getDepartmentStockByInventoryItem(id);
    

  // Main store stock
  const inventoryResult =
    await getInventoryStockByInventoryItem(id);

  if (!result.success) {
    return (
      <div className="p-6 text-red-600">
        {result.message}
      </div>
    );
  }

  if (!result.data.length) {
    return (
      <div className="p-6 text-gray-600">
        No department stock found for this item.
      </div>
    );
  }

  const itemName =   
    result.data[0]?.inventoryItemName ||
    inventoryResult.data?.name ||
    'Inventory Item';

//     const result1 =
//   await auditDepartmentStockAgainstBenchmark({
//     benchmarkId: '7EvaQ9DKySeuiqYx3wbD',
//     thresholdPercent: 30,
//   });

// console.log("conparision----------------------",result1.data);

 //   console.log("inventoryResult.data---------------",inventoryResult)

  return (
    <div className="p-6">
      <DepartmentItemStockTable
        itemName={itemName}
        data={result.data}
        mainStore={
          inventoryResult.success
            ? inventoryResult.data
            : null
        }
      />
    </div>
  );
}