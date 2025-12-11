'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TableRows from './TableRows';
import { orderMasterDataT } from '@/lib/types/orderMasterType';
import {  fetchOrdersPaginated } from '@/app/(universal)/action/orders/dbOperations';

const ORDERS_PER_PAGE = 10;

const ListView = () => {
  const [orderData, setOrderData] = useState<orderMasterDataT[]>([]);
  const [lastId, setLastId] = useState<string | null>(null);
  const [afterStack, setAfterStack] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
const [pageIndex, setPageIndex] = useState(0);
  useEffect(() => {
    loadOrders();
  }, []);

const loadOrders = async (next = false, back = false) => {
  setLoading(true);
  let afterId: string | undefined = undefined;
  let newStack = [...afterStack];

  if (next && lastId) {
    newStack.push(lastId);
    afterId = lastId;
    setPageIndex((prev) => prev + 1);
  } else if (back && newStack.length > 0) {
    newStack.pop(); // remove current
    afterId = newStack[newStack.length - 1]; // get previous
    setPageIndex((prev) => prev - 1);
  } else {
    // first page load
    setPageIndex(0);
  }

  setAfterStack(newStack);

  const { orders, lastId: newLastId } = await fetchOrdersPaginated({ afterId, pageSize: ORDERS_PER_PAGE });
  setOrderData(orders);
  setLastId(newLastId);
  setLoading(false);
};




  

  return (
    <div className="mt-2">
      <div className="overflow-x-auto bg-white dark:bg-zinc-900 shadow rounded-xl border border-gray-200 dark:border-zinc-700">
        <Table className="min-w-[800px] text-sm text-left text-gray-700 dark:text-zinc-200">
          <TableHeader className="bg-gray-100 dark:bg-zinc-800">
            <TableRow>
              <TableHead className="hidden md:table-cell">Order No.</TableHead>
              <TableHead className="hidden md:table-cell">Name</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden md:table-cell">Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Coupon</TableHead>
              <TableHead>Discount %</TableHead>
              <TableHead>Flat Discount</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <td colSpan={10} className="text-center py-4">Loading...</td>
              </TableRow>
            ) : orderData.length === 0 ? (
              <TableRow>
                <td colSpan={10} className="text-center py-4">No orders found.</td>
              </TableRow>
            ) : (
              orderData.map((order) => <TableRows key={order.id} order={order} />)
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between mt-4">
       <button
  onClick={() => loadOrders(false, true)}
  disabled={pageIndex === 0}
  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-50"
>
  ⬅️ Newer Orders
</button>
       <button
  onClick={() => loadOrders(true, false)}
  disabled={orderData.length < ORDERS_PER_PAGE}
  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 disabled:opacity-50"
>
  Older Orders ➡️
</button>
      </div>
    </div>
  );
};

export default ListView;
