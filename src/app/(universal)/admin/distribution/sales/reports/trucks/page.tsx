import { getVehicles } from '@/app/(universal)/action/distribution/getVehicles';
import Link from 'next/link';

export default async function Page() {
  const vehicles = await getVehicles();

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-3xl font-bold'>
          Truck Sales Reports
        </h1>

        <p className='mt-2 text-gray-600'>
          Select a vehicle to view date-wise truck sales report.
        </p>
      </div>

      <div className='overflow-hidden rounded-xl border bg-white shadow-sm'>
        <table className='w-full text-sm'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-3 text-left'>
                Vehicle No
              </th>

              <th className='px-4 py-3 text-left'>
                Vehicle
              </th>

              <th className='px-4 py-3 text-left'>
                Driver
              </th>

              <th className='px-4 py-3 text-right'>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {vehicles.map((vehicle) => (
              <tr
                key={vehicle.id}
                className='border-t'
              >
                <td className='px-4 py-3 font-medium'>
                  {vehicle.locationCode}-{vehicle.id}
                </td>

                <td className='px-4 py-3'>
                  {vehicle.name}
                </td>

                <td className='px-4 py-3'>
                  {vehicle.responsiblePersonName ||
                    '-'}
                </td>

                <td className='px-4 py-3 text-right'>
                  <Link
                    href={`/admin/distribution/sales/reports/trucks/${vehicle.locationCode}`}
                    className='inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700'
                  >
                    View Report
                  </Link>
                </td>
              </tr>
            ))}

            {vehicles.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className='py-10 text-center text-gray-500'
                >
                  No vehicles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}