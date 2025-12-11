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
import { fetchdelivery } from "@/app/(universal)/action/delivery/dbOperation";
import { deliveryType } from "@/lib/types/deliveryType";

const ListView = () => {
  const [deliveryData, setDeliveryData] = useState<deliveryType[]>([]);

  useEffect(() => {
    async function fetchDeliveryList() {
      try {
        const result = await fetchdelivery();
        setDeliveryData(result);
      } catch (error) {
        console.error("Failed to fetch deliveries:", error);
      }
    }

    fetchDeliveryList();
  }, []);

  return (
    <div className="mt-2">
      <h3 className="text-2xl mb-4 font-semibold">Delivery Zones</h3>
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 dark:bg-zinc-800 text-slate-700 dark:text-white">
              <TableHead className="hidden md:table-cell">Zip Code</TableHead>
              <TableHead className="hidden md:table-cell">Cost (€)</TableHead>
              <TableHead>Min Spend (€)</TableHead>
              <TableHead>Distance (km)</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="hidden md:table-cell text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveryData?.map((delivery) => (
              <TableRows key={delivery.id} delivery={delivery} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ListView;
