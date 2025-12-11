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
import { fetchcoupon } from "@/app/(universal)/action/coupon/dbOperation";
import { couponType } from "@/lib/types/couponType";

const ListView = () => {
  const [couponData, setCouponData] = useState<couponType[]>([]);

  useEffect(() => {
    async function fetchCoupons() {
      try {
        const result = await fetchcoupon();
        setCouponData(result);
      } catch (error) {
        console.error("Error fetching coupons:", error);
      }
    }
    fetchCoupons();
  }, []);

  return (
    <div className="mt-6">
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
        Coupon List
      </h3>

      <div className="rounded-xl bg-white dark:bg-zinc-800 shadow-sm p-2 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200">
              <TableHead className="hidden md:table-cell">Code</TableHead>
              <TableHead className="hidden md:table-cell">Discount</TableHead>
              <TableHead>Min Spend</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="md:table-cell">Edit</TableHead>
              <TableHead>Exclude Food</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="md:table-cell">Delete</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {couponData?.map((coupon) => (
              <TableRows key={coupon.id} coupon={coupon} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ListView;
