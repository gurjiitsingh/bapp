import { getProductionBatchById } from "@/app/(universal)/action/production/batch/getProductionBatchById";
import BatchDetails from "./BatchDetails";
import { getProductionBatchItems } from "@/app/(universal)/action/production/batch/getProductionBatchItems";

export default async function Page({ params }: any) {
  const resolvedParams = await params;

  const batchRes = await getProductionBatchById(resolvedParams.id);
  const itemsRes = await getProductionBatchItems(resolvedParams.id);

  console.log("batchRes--------------------------", batchRes)


  return (
    <div className="p-6">
      <BatchDetails
        batch={batchRes}
        items={itemsRes}
      />
    </div>
  );
}