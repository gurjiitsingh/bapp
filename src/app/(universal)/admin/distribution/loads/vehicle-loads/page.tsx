import { getVehicleLoadReports } from "@/app/(universal)/action/distribution/reports/load/getVehicleLoadReports";
import VehicleLoadReportTable from "./VehicleLoadReportTable";





export default async function VehicleLoadsPage() {
  const result = await getVehicleLoadReports({
    limit: 100,
  });

  return (
    <div className="w-full space-y-6 p-6">

      <div>
        <h1 className="text-2xl font-semibold">
          Vehicle Loads
        </h1>

        <p className="text-sm text-muted-foreground">
          Vehicle loading history and distribution status.
        </p>
      </div>

      <VehicleLoadReportTable
        data={result.data}
      />

    </div>
  );
}