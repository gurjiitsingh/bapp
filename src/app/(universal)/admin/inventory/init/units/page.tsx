import { getUnitConversions } from "@/app/(universal)/action/inventory/init/unit-conversion/getUnitConversions";
import InitButton from "../addunit/InitButton";

export default async function Page() {
  const units = await getUnitConversions();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Unit Conversions
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage inventory unit conversion rules
          </p>
        </div>

        <InitButton />
      </div>

      {/* Stats */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">
            Total Conversions
          </span>

          <span className="px-3 py-1 rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
            {units.length}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="p-4 text-left text-sm font-semibold text-slate-700">
                #
              </th>

              <th className="p-4 text-left text-sm font-semibold text-slate-700">
                Purchase Unit
              </th>

              <th className="p-4 text-left text-sm font-semibold text-slate-700">
                Consumption Unit
              </th>

              <th className="p-4 text-left text-sm font-semibold text-slate-700">
                Factor
              </th>

              <th className="p-4 text-left text-sm font-semibold text-slate-700">
                Type
              </th>

              <th className="p-4 text-left text-sm font-semibold text-slate-700">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {units.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-slate-500"
                >
                  No unit conversions found
                </td>
              </tr>
            ) : (
              units.map((unit: any, i: number) => (
                <tr
                  key={unit.id}
                  className="border-b last:border-b-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4 text-sm text-slate-500 font-medium">
                    {i + 1}
                  </td>

                  <td className="p-4 font-medium text-slate-800">
                    {unit.purchaseUnit}
                  </td>

                  <td className="p-4 text-slate-700">
                    {unit.consumptionUnit}
                  </td>

                  <td className="p-4 font-mono text-slate-700">
                    {unit.factor}
                  </td>

                  <td className="p-4">
                    {unit.system ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        System
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
                        Custom
                      </span>
                    )}
                  </td>

                  <td className="p-4">
                    {unit.isActive !== false ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}