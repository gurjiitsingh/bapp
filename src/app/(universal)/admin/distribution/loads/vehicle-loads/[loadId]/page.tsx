import { notFound } from "next/navigation";

import { getVehicleLoadDetail } from "@/app/(universal)/action/distribution/reports/load/getVehicleLoadDetail";
import VehicleLoadDetail from "./VehicleLoadDetail.tsx";
 

type Props = {
  params: Promise<{
    loadId: string;
  }>;
};

export default async function VehicleLoadDetailPage({
  params,
}: Props) {
  const { loadId } = await params;

  const result = await getVehicleLoadDetail(
    decodeURIComponent(loadId)
  );

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="w-full p-6">
      <VehicleLoadDetail data={result.data} />
    </div>
  );
}