import { getVehicles } from "@/app/(universal)/action/distribution/getVehicles";
import VehicleLoadReport from "./VehicleLoadReport";

export const dynamic = "force-dynamic";

export default async function Page() {
  const vehicles = await getVehicles();

  return (
    <div className="p-4 md:p-6">
      <VehicleLoadReport vehicles={vehicles || []} />
    </div>
  );
}