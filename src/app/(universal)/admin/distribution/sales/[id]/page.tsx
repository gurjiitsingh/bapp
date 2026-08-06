import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getTruckSaleById } from '@/app/(universal)/action/distribution/sale/getTruckSaleById';
 

type Props = {
  params: Promise<{ id: string }>;
};

export default async function Page({
  params,
}: Props) {
  const { id } = await params;

  const sale = await getTruckSaleById(id);

  if (!sale) {
    return (
      <div className='p-6'>
        Sale report not found
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>
            Truck Sale Report
          </h1>

          <p className='text-sm text-gray-500'>
            {sale.saleId}
          </p>
        </div>

        <Link
          href='/admin/distribution/sales'
          className='inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100'
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </div>

      {/* Summary */}
      <div className='rounded-2xl border bg-white p-5 shadow-sm'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          <div>
            <p className='text-sm text-gray-500'>
              Vehicle
            </p>
            <p className='font-medium'>
              {sale.vehicleName}
            </p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>
              Responsible
            </p>
            <p className='font-medium'>
              {sale.responsiblePerson}
            </p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>
              Customer
            </p>
            <p className='font-medium'>
              {sale.wholeSaleCutomerName}
            </p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>
              Location
            </p>
            <p className='font-medium'>
              {sale.locationCode}
            </p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>
              Payment Status
            </p>
            <p className='font-medium text-green-700'>
              {sale.paymentStatus}
            </p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>
              Payment Method
            </p>
            <p className='font-medium'>
              {sale.paymentMethod || '-'}
            </p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>
              Total Items
            </p>
            <p className='font-medium'>
              {sale.totalItems}
            </p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>
              Total Quantity
            </p>
            <p className='font-medium'>
              {sale.totalQuantity}
            </p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>
              Total Amount
            </p>
            <p className='font-bold text-lg text-green-700'>
              ₹{Number(sale.totalAmount).toFixed(2)}
            </p>
          </div>

          <div>
            <p className='text-sm text-gray-500'>
              Created At
            </p>
            <p className='font-medium'>
              {sale.createdAt?.toDate
                ? sale.createdAt
                    .toDate()
                    .toLocaleString('en-IN')
                : '-'}
            </p>
          </div>
        </div>

        <div className='mt-4 border-t pt-4 grid grid-cols-3 gap-4 text-sm'>
          <div>
            <p className='text-gray-500'>
              Paid
            </p>
            <p className='font-semibold text-green-700'>
              ₹{Number(sale.paidAmount).toFixed(2)}
            </p>
          </div>

          <div>
            <p className='text-gray-500'>
              Due
            </p>
            <p className='font-semibold text-red-700'>
              ₹{Number(sale.dueAmount).toFixed(2)}
            </p>
          </div>

          <div>
            <p className='text-gray-500'>
              Status
            </p>
            <p className='font-semibold'>
              {sale.status}
            </p>
          </div>
        </div>

        {sale.remarks && (
          <div className='mt-4 border-t pt-4'>
            <p className='text-sm text-gray-500 mb-1'>
              Remarks
            </p>
            <p className='text-sm text-gray-800 whitespace-pre-line'>
              {sale.remarks}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}