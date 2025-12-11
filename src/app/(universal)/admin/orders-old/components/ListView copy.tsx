"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import TableRows from "./TableRows";
import { fetchOrdersMaster } from "@/app/(universal)/action/orders/dbOperations";
import { orderMasterDataT } from "@/lib/types/orderMasterType";

type productTableProps = {
  limit?: number;
  title?: string;
};

const ListView = ({ title }: productTableProps) => {
  const [orderData, setOrderData] = useState<orderMasterDataT[]>([]);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const result = await fetchOrdersMaster();
        setOrderData(result);
      } catch (error) {
        console.log(error);
      }
    }
    fetchOrder();
  }, []);
 

  return (
    <div className="mt-2">
      {/* <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {title || "Orders"}
      </h3> */}

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
            {orderData.length === 0 ? (
              <TableRow>
                <td colSpan={9} className="text-center py-4">
                  No orders found.
                </td>
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
