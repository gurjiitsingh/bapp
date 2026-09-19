"use server"
import { fetchPosOrdersPaginated } from '@/app/(universal)/action/orders/fetchPosOrdersPaginated';
import ListView from './orders/ListView';


 

export default async function Page() {
  const result =
    await fetchPosOrdersPaginated({
      pageSize: 10,
      source:"WEB",
    });

  if (!result.success) {
    return (
      <div className="p-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-lg font-bold text-red-700">
            Failed to load POS orders
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {result.error!.message}
          </p>

          <p className="mt-4 text-xs font-medium text-red-500">
            Error Code:
          </p>

          <code className="text-xs text-red-700">
            {result.error!.code}
          </code>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col px-1 mt-1">
      <ListView
        initialOrders={result.orders}
        initialLastId={result.lastId}
      />
    </div>
  );
}