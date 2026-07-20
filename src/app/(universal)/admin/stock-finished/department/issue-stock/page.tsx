import { getProductionBatches } from "@/app/(universal)/action/production/batch/getProductionBatches";
import ProductionBatchTable from "./ProductionBatchTable";
 

export default async function Page() {
  const res = await getProductionBatches();

  if (!res.success) {
    return <div>Error loading batches</div>;
  }

  return (
    <div className="p-6">
      <ProductionBatchTable batches={res.data} />
    </div>
  );
}