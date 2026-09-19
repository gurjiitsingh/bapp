"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import TableRows from "./components/TableRows";
import { orderMasterDataT } from "@/lib/types/orderMasterType";
import { db } from "@/lib/firebaseConfig";

import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";

const ORDERS_PER_PAGE = 10;

const ListView = () => {
  const [orderData, setOrderData] = useState<
    orderMasterDataT[]
  >([]);

  const [loading, setLoading] = useState(true);

  const audioRef =
    useRef<HTMLAudioElement | null>(null);

  const previousOrderIdsRef =
    useRef<string[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "orderMaster"),

      // Only realtime WEB orders
      where("source", "==", "WEB"),

      // Newest first
      orderBy("srno", "desc"),

      limit(ORDERS_PER_PAGE)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newOrders =
          snapshot.docs.map((doc) => {
            const data = doc.data();

            return {
              id: doc.id,
              ...data,
            } as orderMasterDataT;
          });

        const previousIds =
          previousOrderIdsRef.current;

        const newFirstOrderId =
          newOrders[0]?.id;

        const oldFirstOrderId =
          previousIds[0];

        // Don't play sound on the initial load.
        // Play only when a new order appears.
        if (
          oldFirstOrderId &&
          newFirstOrderId &&
          newFirstOrderId !== oldFirstOrderId
        ) {
          audioRef.current
            ?.play()
            .catch((error) => {
              console.error(
                "Sound play failed:",
                error
              );
            });
        }

        setOrderData(newOrders);

        previousOrderIdsRef.current =
          newOrders.map(
            (order) => order.id
          );

        setLoading(false);
      },
      (error) => {
        console.error(
          "Realtime WEB orders error:",
          error
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="mt-2">
      <audio
        ref={audioRef}
        src="/sounds/relaxing-guitar-loop-v5-245859g.mp3"
        preload="auto"
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table className="min-w-[1100px]">
            <TableHeader className="bg-slate-50">
              <TableRow className="border-b border-slate-200 hover:bg-slate-50">
                <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Order
                </TableHead>

                <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Customer
                </TableHead>

                <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Submitted
                </TableHead>

                <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Delivery / Pickup
                </TableHead>

                <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Status
                </TableHead>

                <TableHead className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Total
                </TableHead>

                <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Payment
                </TableHead>

                <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Coupon
                </TableHead>

                <TableHead className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Discount
                </TableHead>

                <TableHead className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Flat Discount
                </TableHead>

                {/* <TableHead className="px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Action
                </TableHead> */}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <td
                    colSpan={11}
                    className="py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />

                      <span className="text-sm text-slate-500">
                        Loading online orders...
                      </span>
                    </div>
                  </td>
                </TableRow>
              ) : orderData.length === 0 ? (
                <TableRow>
                  <td
                    colSpan={11}
                    className="py-12 text-center"
                  >
                    <div className="text-sm font-medium text-slate-700">
                      No online orders
                    </div>

                    <div className="mt-1 text-xs text-slate-400">
                      New WEB orders will appear here
                      automatically.
                    </div>
                  </td>
                </TableRow>
              ) : (
                orderData.map((order) => (
                  <TableRows
                    key={order.id}
                    order={order}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ListView;