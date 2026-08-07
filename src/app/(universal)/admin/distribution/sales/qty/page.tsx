import Link from 'next/link';
import { ArrowLeft, Eye } from 'lucide-react';
import { getTruckSales } from '@/app/(universal)/action/distribution/sale/getTruckSales';
 
export default async function Page() {
  const sales = await getTruckSales();

  return (
    <div className='max-w-7xl mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>
            Truck Sales
          </h1>

          <p className='text-sm text-gray-500'>
            All vehicle sale reports
          </p>
        </div>

        <Link
          href='/admin/distribution'
          className='inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100'
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      {/* Table */}
      <div className='overflow-hidden rounded-2xl border bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='bg-gray-50 text-gray-600'>
              <tr>
                <th className='px-4 py-3 text-left font-medium'>
                  Sale ID
                </th>

                <th className='px-4 py-3 text-left font-medium'>
                  Vehicle
                </th>

                <th className='px-4 py-3 text-left font-medium'>
                  Customer
                </th>

                <th className='px-4 py-3 text-right font-medium'>
                  Qty
                </th>

                <th className='px-4 py-3 text-right font-medium'>
                  Amount
                </th>

                <th className='px-4 py-3 text-center font-medium'>
                  Payment
                </th>

                <th className='px-4 py-3 text-left font-medium'>
                  Date
                </th>

                <th className='px-4 py-3 text-center font-medium'>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {sales.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className='px-4 py-8 text-center text-gray-500'
                  >
                    No truck sales found
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr
                    key={sale.saleId}
                    className='border-t hover:bg-gray-50'
                  >
                    <td className='px-4 py-3 font-medium text-gray-800'>
                      {sale.saleId}
                    </td>

                    <td className='px-4 py-3'>
                      {sale.vehicleName}
                    </td>

                    <td className='px-4 py-3'>
                      {sale.wholeSaleCutomerName}
                    </td>

                    <td className='px-4 py-3 text-right'>
                      {sale.totalQuantity}
                    </td>

                    <td className='px-4 py-3 text-right font-semibold text-green-700'>
                      ₹
                      {Number(
                        sale.totalAmount
                      ).toFixed(2)}
                    </td>

                    <td className='px-4 py-3 text-center'>
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          sale.paymentStatus ===
                          'PAID'
                            ? 'bg-green-100 text-green-700'
                            : sale.paymentStatus ===
                                'PARTIAL'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {sale.paymentStatus}
                      </span>
                    </td>

                    <td className='px-4 py-3 text-gray-600'>
                      {sale.createdAt?.toDate
                        ? sale.createdAt
                            .toDate()
                            .toLocaleDateString(
                              'en-IN'
                            )
                        : '-'}
                    </td>

                    <td className='px-4 py-3 text-center'>
                      <Link
                        href={`/admin/distribution/sales/${sale.saleId}`}
                        className='inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100'
                      >
                        <Eye size={16} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}