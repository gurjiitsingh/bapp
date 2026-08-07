import { fetchCustomer } from '@/app/(universal)/action/stock-finished/customer/fetchCustomer';
import Link from 'next/link';


export default async function Page() {
  const customers = await fetchCustomer();

  return (
    <div className='max-w-5xl  p-6 space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>
          Customer Sales Reports
        </h1>
        <p className='text-sm text-gray-500'>
          Select a customer to view date-wise sales report.
        </p>
      </div>

      <div className='overflow-hidden rounded-xl border bg-white shadow-sm'>
        <table className='w-full text-sm'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-3 text-left'>
                Customer
              </th>
              <th className='px-4 py-3 text-left'>
                Phone
              </th>
              <th className='px-4 py-3 text-right'>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className='border-t'
              >
                <td className='px-4 py-3'>
                  <div className='font-medium'>
                    {customer.companyName}
                  </div>
                
                </td>

                <td className='px-4 py-3'>
                  {customer.phone || '-'}
                </td>

                <td className='px-4 py-3 text-right'>
                  <Link
                    href={`/admin/distribution/sales/reports/customer/${customer.id}`}
                    className='inline-flex items-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700'
                  >
                    View Report
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}