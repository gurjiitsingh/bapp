import { getProductionBatchById } from "@/app/(universal)/action/production/batch/getProductionBatchById";
import BatchDetails from "./BatchDetails";
 

export default async function Page({ params }: any) {
  const resolvedParams = await params;

  

  const res = await getProductionBatchById(resolvedParams.id);

  //console.log("batch view-----------", res.data)


  return (
    <div className="p-6">
      <BatchDetails batch={res} />
    </div>
  );
}