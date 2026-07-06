import { getVehicles } from "@/app/(universal)/action/distribution/getVehicles";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package2, Plus, Truck } from "lucide-react";
import Link from "next/link";

export default async function Page() {
  const vehicles = await getVehicles(); 

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6 w-full">
      

          {/* HEADER */}
        <div className="sticky top-0 z-10 bg-[#f8fafc]/90 backdrop-blur border-b border-gray-100">
          <div className="px-4 md:px-6 py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-rose-100 flex items-center justify-center">
                  <Truck
                size={22}
                className={
                  "text-yellow-600"
                }
              />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                  Vehicles
                  </h1>

                  <p className="text-sm text-gray-500">
                   Manage all distribution vehicles.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
               

                <Link href="/admin/distribution/vehicle/add">
                  <button className="btn-save-4 flex items-center gap-2">
                    <Plus size={18} />
                    Add Vehicle
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>


      <Card className="rounded-3xl border border-gray-100 shadow-sm bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-xl">
            Vehicle List
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <div className="rounded-2xl overflow-hidden border border-gray-200">

            <table className="w-full">

              <thead className="bg-zinc-200">
                <tr>
                  <th className="text-left p-3">
                    Vehicle No
                  </th>

                  <th className="text-left p-3">
                    Vehicle
                  </th>

                  <th className="text-center p-3">
                    Type
                  </th>

                  <th className="text-left p-3">
                    Driver
                  </th>

                  <th className="text-center p-3">
                    Capacity
                  </th>

                  <th className="text-center p-3">
                    Status
                  </th>

                  <th className="text-left p-3">
                    Remarks
                  </th>

                  <th className="text-center p-3 w-40">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {vehicles.map((vehicle) => (
                  <tr
                    key={vehicle.id}
                    className="
                      border-b border-zinc-200
                      odd:bg-zinc-50
                      even:bg-zinc-100
                      hover:bg-blue-50
                      transition-colors
                    "
                  >
                    <td className="p-3 font-medium">
                      {vehicle.locationCode}
                    </td>

                    <td className="p-3">
                      {vehicle.name}
                    </td>

                    <td className="text-center">
                      {vehicle.type}
                    </td>

                    <td className="p-3">
                      {vehicle.responsiblePersonName || "-"}
                    </td>

                    <td className="text-center">
                      {vehicle.capacity || 0} Kg
                    </td>

                    <td className="text-center">
                      {vehicle.active ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="p-3">
                      {vehicle.remarks || "-"}
                    </td>

                   <td className="text-center">
  <div className="flex justify-center gap-2">
    <Button
      size="sm"
      variant="outline"
    >
      View
    </Button>

    <Button
      asChild
      size="sm"
    >
      <Link
        href={`/admin/distribution/vehicle/edit/${vehicle.id}`}
      >
        Edit
      </Link>
    </Button>
  </div>
</td>
                  </tr>
                ))}

                {vehicles.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-10 text-center text-gray-500"
                    >
                      No vehicles found.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}