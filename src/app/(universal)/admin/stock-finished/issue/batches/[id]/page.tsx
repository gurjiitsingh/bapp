import { getProductionBatchById } from "@/app/(universal)/action/production/getProductionBatchById";
import BatchDetails from "./BatchDetails";
 

export default async function Page({ params }: any) {
  const resolvedParams = await params;

  

  const res = await getProductionBatchById(resolvedParams.id);

  if (!res.success) {
    return <div>Error loading batch</div>;
  }

  return (
    <div className="p-6">
      <BatchDetails batch={res.data} />
    </div>
  );
}