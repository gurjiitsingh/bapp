"use client";

import React, { useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import TableRows from "./TableRows";

import { orderMasterDataT } from "@/lib/types/orderMasterType";

import {
  fetchPosOrdersPaginated,
} from "@/app/(universal)/action/orders/fetchPosOrdersPaginated";

const ORDERS_PER_PAGE = 10;

// -----------------------------------------------------
// Loading Skeleton
// -----------------------------------------------------

const LoadingSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <TableRow
        key={i}
        className="border-b border-slate-100"
      >
        <TableCell colSpan={14} className="py-5">
          <div className="h-5 w-full animate-pulse rounded-lg bg-slate-100" />
        </TableCell>
      </TableRow>
    ))}
  </>
);

// -----------------------------------------------------
// Props
// -----------------------------------------------------

type ListViewProps = {
  initialOrders: orderMasterDataT[];
  initialLastId: string | null;
};

// -----------------------------------------------------
// List View
// -----------------------------------------------------

const ListView = ({
  initialOrders,
  initialLastId,
}: ListViewProps) => {
 const [orderData, setOrderData] =
  useState<orderMasterDataT[]>(initialOrders ?? []);

  const [lastId, setLastId] =
    useState<string | null>(initialLastId);

  const [afterStack, setAfterStack] =
    useState<string[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [pageIndex, setPageIndex] =
    useState(0);

  // ---------------------------------------------------
  // Load Orders
  // ---------------------------------------------------

  const loadOrders = async (
    next = false,
    back = false
  ) => {
    if (loading) return;

    setLoading(true);

    try {
      let afterId: string | undefined;
      let newStack = [...afterStack];

      // -----------------------------------------------
      // OLDER
      // -----------------------------------------------

      if (next && lastId) {
        newStack.push(lastId);
        afterId = lastId;
      }

      // -----------------------------------------------
      // NEWER
      // -----------------------------------------------

      else if (back && newStack.length > 0) {
        newStack.pop();

        afterId =
          newStack.length > 0
            ? newStack[newStack.length - 1]
            : undefined;
      }

      // -----------------------------------------------
      // FETCH
      // -----------------------------------------------

      const result =
        await fetchPosOrdersPaginated({
          source: "POS",
          afterId,
          pageSize: ORDERS_PER_PAGE,
        });

      // -----------------------------------------------
      // ERROR
      // -----------------------------------------------

      if (!result.success) {
        console.error(
          "Failed to fetch POS orders:",
          result.error
        );

        return;
      }

      // -----------------------------------------------
      // UPDATE
      // -----------------------------------------------

    setOrderData(result.orders ?? []);
      setLastId(result.lastId);
      setAfterStack(newStack);

      // -----------------------------------------------
      // PAGE
      // -----------------------------------------------

      if (next) {
        setPageIndex((prev) => prev + 1);
      } else if (back) {
        setPageIndex((prev) =>
          Math.max(0, prev - 1)
        );
      } else {
        setPageIndex(0);
      }

    } catch (error) {
      console.error(
        "POS order pagination error:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // Empty
  // ---------------------------------------------------

  if (
    !loading &&
    orderData.length === 0
  ) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <span className="text-2xl">📋</span>
          </div>

          <h2 className="text-lg font-semibold text-slate-800">
            No  orders found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Online orders will appear here when they are created.
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------
  // UI
  // ---------------------------------------------------

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Online Orders
            </h1>

            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              Web store Orders
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage and view orders created from the web store.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm">
            Page{" "}
            <span className="font-bold text-slate-800">
              {pageIndex + 1}
            </span>
          </div>

          <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-sm">
            {orderData.length} Orders
          </div>
        </div>

      </div>

      {/* =================================================
          TABLE CARD
          ================================================= */}

      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="h-full overflow-auto">

          <Table className="min-w-[1200px]">

            {/* -------------------------------------------------
                HEADER
                ------------------------------------------------- */}

            <TableHeader className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur">

              <TableRow className="hover:bg-transparent">

                <TableHead className="h-12 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Order
                </TableHead>

                <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Customer
                </TableHead>

                <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Submitted
                </TableHead>

                <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Scheduled
                </TableHead>

                <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Type
                </TableHead>

                {/* <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Table
                </TableHead> */}

                <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                 Order Status
                </TableHead>

                <TableHead className="h-12 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total
                </TableHead>

              <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-slate-500">
  Payment Status
</TableHead>

<TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-slate-500">
  Payment Mode
</TableHead>

                <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Discount
                </TableHead>

                <TableHead className="h-12 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Printed
                </TableHead>

                <TableHead className="h-12 px-4 text-right text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Action
                </TableHead>

              </TableRow>

            </TableHeader>

            {/* -------------------------------------------------
                BODY
                ------------------------------------------------- */}

            <TableBody>

              {loading ? (
                <LoadingSkeleton />
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

      {/* =================================================
          PAGINATION
          ================================================= */}

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

        <div className="text-xs text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {orderData.length}
          </span>{" "}
          orders
        </div>

        <div className="flex items-center gap-2">

          {/* NEWER */}

          <button
            onClick={() =>
              loadOrders(false, true)
            }
            disabled={
              pageIndex === 0 ||
              loading
            }
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              py-2
              text-xs
              font-semibold
              text-slate-700
              shadow-sm
              transition
              hover:bg-slate-50
              hover:border-slate-300
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="h-3.5 w-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>

            Newer
          </button>

          {/* PAGE */}

          <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-slate-900 px-3 text-xs font-bold text-white">
            {pageIndex + 1}
          </div>

          {/* OLDER */}

          <button
            onClick={() =>
              loadOrders(true, false)
            }
            disabled={
              orderData.length < ORDERS_PER_PAGE ||
              loading
            }
            className="
              inline-flex
              items-center
              gap-2
              rounded-lg
              bg-slate-900
              px-3
              py-2
              text-xs
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-slate-800
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            Older

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="h-3.5 w-3.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>

        </div>

      </div>

    </div>
  );
};

export default ListView;