'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TableRows from './components/TableRows';
import { orderMasterDataT } from '@/lib/types/orderMasterType';
import { db } from '@/lib/firebaseConfig';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const ORDERS_PER_PAGE = 10; // Show only the latest 10 orders

const ListView = () => {
const [orderData, setOrderData] = useState<orderMasterDataT[]>([]);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousOrderIdsRef = useRef<string[]>([]); // to compare new orders

  useEffect(() => {
    // Firestore real-time listener with limit(10)
    // const q = query(
    //   collection(db, 'orderMaster'),
    //   orderBy('time', 'desc'),
    //   limit(ORDERS_PER_PAGE)
    // );

    const q = query(
  collection(db, 'orderMaster'),
  orderBy('srno', 'desc'), // ← Sort newest orders first using srno
  limit(ORDERS_PER_PAGE)
);

    // const unsubscribe = onSnapshot(q, (snapshot) => {
    //   const orders = snapshot.docs.map((doc) => ({
    //     id: doc.id,
    //     ...doc.data(),
    //   })) as orderMasterDataT[];

    //   console.log('Orders updated:', orders.length);
    //   setOrderData(orders);
    //   setLoading(false);
    // });

   const unsubscribe = onSnapshot(q, (snapshot) => {
      const newOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as orderMasterDataT[];

      // Compare with previous to detect new order
      const previousIds = previousOrderIdsRef.current;
      const newFirstOrderId = newOrders[0]?.id;
      const oldFirstOrderId = previousIds[0];

      if (oldFirstOrderId && newFirstOrderId && newFirstOrderId !== oldFirstOrderId) {
        // New order has come
        if (audioRef.current) {
          audioRef.current.play().catch((err) => console.error('Sound play failed:', err));
        }
      }

      // Update state and previous ref
      setOrderData(newOrders);
      previousOrderIdsRef.current = newOrders.map((o) => o.id);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  return (
    <div className="mt-2">
       <audio ref={audioRef} src="/sounds/relaxing-guitar-loop-v5-245859g.mp3" preload="auto" />
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
    </div>
  );
};

export default ListView;
