import { getVehicleLoads } from '@/app/(universal)/action/production/distribution/vehicleLoad/getVehicleLoads';
import Link from 'next/link';
 

export default async function VehicleLoadsPage() {
  const loads = await getVehicleLoads();

  return (
    <div className="max-w-5xl  p-6 space-y-6">
      <h1 className="text-2xl font-bold">Vehicle Loads</h1>

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Load ID</th>
              <th className="px-4 py-3 text-left">Vehicle</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Value</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {loads.map((load: any) => (
              <tr key={load.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/distribution/loads/${load.loadId}`}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    {load.loadId}
                  </Link>
                </td>

                <td className="px-4 py-3">{load.vehicleName}</td>

                <td className="px-4 py-3 text-right">
                  {load.totalQuantity}
                </td>

                <td className="px-4 py-3 text-right">
                  ₹{Number(load.totalValue).toFixed(2)}
                </td>

                <td className="px-4 py-3">
                  <span className="text-green-700 font-medium">
                    {load.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}