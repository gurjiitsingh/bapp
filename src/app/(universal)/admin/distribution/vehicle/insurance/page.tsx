import { getVehicleInsurances } from "@/lib/types/distribution/vehicle/insurance/getVehicleInsurances";
import Link from "next/link";
import VehicleInsuranceTable from "./VehicleInsuranceTable";

 

export default async function VehicleInsurancePage() {
  const result = await getVehicleInsurances();

 

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">
            Vehicle Insurance
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage insurance records for all vehicles.
          </p>
        </div>

        <Link
          href="/admin/distribution/vehicle/insurance/new"
          className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700"
        >
          Add Insurance
        </Link>
      </div>

      {!result.success ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {result.message}
        </div>
      ) : (
        <VehicleInsuranceTable
          insurances={result.data}
        />
      )}
    </div>
  );
}