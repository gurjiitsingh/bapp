 
import { getRoutes } from "@/app/(universal)/action/distribution/sale-route/getRoutes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Route as RouteIcon } from "lucide-react";
import Link from "next/link";

export default async function Page() {
  const routes = await getRoutes();

  return (
    <div className="space-y-6">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="sticky top-0 z-10 bg-[#f8fafc]/90 backdrop-blur border-b border-gray-100">
        <div className="px-4 md:px-6 py-4">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="h-11 w-11 rounded-2xl bg-rose-100 flex items-center justify-center">

                <RouteIcon
                  size={22}
                  className="text-yellow-600"
                />

              </div>

              <div>

                <h1 className="text-2xl font-bold text-gray-800">
                  Routes
                </h1>

                <p className="text-sm text-gray-500">
                  Manage all distribution routes.
                </p>

              </div>

            </div>


            {/* ADD ROUTE */}

            <div className="flex items-center gap-3">

              <Link href="/admin/distribution/sale-route/add">

                <button className="btn-save-4 flex items-center gap-2">

                  <Plus size={18} />

                  Add Route

                </button>

              </Link>

            </div>

          </div>

        </div>
      </div>


      {/* ===================================================== */}
      {/* ROUTE LIST */}
      {/* ===================================================== */}

      <Card className="rounded-3xl border border-gray-100 shadow-sm bg-white">

        <CardHeader className="border-b border-gray-100">

          <CardTitle className="text-xl">
            Route List
          </CardTitle>

        </CardHeader>


        <CardContent>

          <div className="overflow-hidden">

            <table className="w-full">

              <thead className="bg-zinc-200">

                <tr>

                  <th className="text-left p-3">
                    Route Code
                  </th>

                  <th className="text-left p-3">
                    Route
                  </th>

                  <th className="text-left p-3">
                    Salesman
                  </th>

                  <th className="text-left p-3">
                    Vehicle
                  </th>

                  <th className="text-left p-3">
                    Description
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

                {routes.map((route: any) => (

                  <tr
                    key={route.id}
                    className="
                      border-b border-zinc-200
                      odd:bg-zinc-50
                      even:bg-zinc-100
                      hover:bg-blue-50
                      transition-colors
                    "
                  >

                    {/* ROUTE CODE */}

                    <td className="p-3 font-medium">
                      {route.routeCode}
                    </td>


                    {/* ROUTE NAME */}

                    <td className="p-3">
                      {route.routeName}
                    </td>


                    {/* SALESMAN */}

                    <td className="p-3">
                      {route.salesmanName || "-"}
                    </td>


                    {/* VEHICLE */}

                    <td className="p-3">
                      {route.vehicleName || "-"}
                    </td>


                    {/* DESCRIPTION */}

                    <td className="p-3">
                      {route.description || "-"}
                    </td>


                    {/* STATUS */}

                    <td className="text-center">

                      {route.status === "ACTIVE" ? (

                        <span
                          className="
                            rounded-full
                            bg-green-100
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            text-green-700
                          "
                        >
                          Active
                        </span>

                      ) : (

                        <span
                          className="
                            rounded-full
                            bg-red-100
                            px-3
                            py-1
                            text-xs
                            font-semibold
                            text-red-700
                          "
                        >
                          Inactive
                        </span>

                      )}

                    </td>


                    {/* REMARKS */}

                    <td className="p-3">
                      {route.remarks || "-"}
                    </td>


                    {/* ACTION */}

                    <td className="text-center">

                      <Button
                        asChild
                        size="sm"
                      >

                        <Link
                          href={`/admin/distribution/sale-route/edit/${route.id}`}
                        >
                          Edit
                        </Link>

                      </Button>

                    </td>

                  </tr>

                ))}


                {/* EMPTY */}

                {routes.length === 0 && (

                  <tr>

                    <td
                      colSpan={8}
                      className="py-10 text-center text-gray-500"
                    >
                      No routes found.
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