import { getVehicleLoadById } from '@/app/(universal)/action/production/distribution/vehicleLoad/getVehicleLoadById';
import PrintButton from './PrintButton';
import PrintLoadButton from './PrintLoadButton';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({
  params,
}: Props) {

  const { id } = await params;

  const load = await getVehicleLoadById(id);

  if (!load) {
    return <div className="p-6">Load not found</div>;
  }

  return (
    <div className="max-w-4xl p-6 space-y-6 print:p-0">

      {/* Header */}
      <div className="flex items-start justify-between print:block">
        <div>
          <h1 className="text-2xl font-bold">
            Vehicle Load Report
          </h1>

          <p className="text-sm text-gray-500">
            {load.loadId}
          </p>
        </div>

      <PrintLoadButton loadId={load.loadId} />
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4 rounded-xl border p-4 bg-white print:border print:rounded-none print:p-3">

        <div>
          <p className="text-sm text-gray-500">Vehicle</p>
          <p className="font-medium">{load.vehicleName}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Responsible</p>
          <p className="font-medium">
            {load.responsiblePerson}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Location</p>
          <p className="font-medium">
            {load.locationCode}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Status</p>
          <p className="font-medium text-green-700">
            {load.status}
          </p>
        </div>

      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-white print:border print:rounded-none">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 print:bg-transparent">
            <tr>
              <th className="border-b px-4 py-3 text-left">
                Product
              </th>

              <th className="border-b px-4 py-3 text-right">
                Qty
              </th>

              <th className="border-b px-4 py-3 text-right">
                Unit Cost
              </th>

              <th className="border-b px-4 py-3 text-right">
                Value
              </th>
            </tr>
          </thead>

          <tbody>
            {load.items.map((item) => (
              <tr key={item.id} className="border-t">

                <td className="border-b px-4 py-3">
                  {item.productName}
                </td>

                <td className="border-b px-4 py-3 text-right">
                  {item.quantity}
                </td>

                <td className="border-b px-4 py-3 text-right">
                  ₹{Number(item.unitCost).toFixed(2)}
                </td>

                <td className="border-b px-4 py-3 text-right font-semibold">
                  ₹{Number(item.lineValue).toFixed(2)}
                </td>

              </tr>
            ))}
          </tbody>

          <tfoot className="bg-gray-50 print:bg-transparent">
            <tr>

              <td className="border-t px-4 py-3 font-semibold">
                Total
              </td>

              <td className="border-t px-4 py-3 text-right font-semibold">
                {load.totalQuantity}
              </td>

              <td className="border-t px-4 py-3"></td>

              <td className="border-t px-4 py-3 text-right font-bold text-green-700">
                ₹{Number(load.totalValue).toFixed(2)}
              </td>

            </tr>
          </tfoot>

        </table>

      </div>

      {/* Remarks */}
      {load.remarks && (
        <div className="rounded-xl border bg-white p-4 print:border print:rounded-none print:p-3">

          <p className="text-sm font-medium text-gray-700 mb-1">
            Remarks
          </p>

          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {load.remarks}
          </p>

        </div>
      )}

      {/* Footer */}
      <div className="text-xs text-gray-500 print:mt-8">
        Generated from Distribution System
      </div>

    </div>
  );
}