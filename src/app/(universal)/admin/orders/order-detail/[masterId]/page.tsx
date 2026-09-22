import {
  fetchOrderProductsByOrderMasterId,
} from "@/app/(universal)/action/orders/items/fetchOrderProductsByOrderMasterId";

import {
  searchAddressByAddressId,
} from "@/app/(universal)/action/address/dbOperations";

import React from "react";
import ProductList from "./ProductList";
import BackButton from "@/components/buttons/BackButton";
import CustomerAddress from "./CustomerAddress";

interface PageProps {
  params: Promise<{
    masterId: string;
  }>;

  searchParams: Promise<{
    srno?: string;
    createdAt?: string;

    subTotal?: string;
    taxTotal?: string;
    discountTotal?: string;
    deliveryFee?: string;
    grandTotal?: string;

    paymentMode?: string;
    paymentStatus?: string;
    orderStatus?: string;

    email?: string;
    notes?: string;

    addressId?: string;
  }>;
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { masterId } = await params;

  const {
    srno,
    createdAt,

    subTotal,
    taxTotal,
    discountTotal,
    deliveryFee,
    grandTotal,

    paymentMode,
    paymentStatus,
    orderStatus,

    email,
    notes,

    addressId,
  } = await searchParams;

  // ---------------------------------------------------------
  // VALIDATE MASTER ID
  // ---------------------------------------------------------

  if (!masterId) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-lg font-semibold text-red-700">
            Invalid Order
          </h2>

          <p className="mt-1 text-sm text-red-600">
            Order master ID is missing.
          </p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // FETCH ORDER PRODUCTS
  // ---------------------------------------------------------

  const result =
    await fetchOrderProductsByOrderMasterId(masterId);

  if (!result.success) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-lg font-semibold text-red-700">
            Failed to load order
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {result.error}
          </p>

          <div className="mt-3 rounded-lg bg-white p-3">
            <span className="text-xs font-semibold text-slate-500">
              Order ID
            </span>

            <div className="mt-1 break-all font-mono text-xs text-slate-700">
              {masterId}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const products = result.products ?? [];

  // ---------------------------------------------------------
  // CUSTOMER ADDRESS
  // ---------------------------------------------------------

  let customerAddress = null;

  if (addressId) {
    try {
      customerAddress =
        await searchAddressByAddressId(addressId);
    } catch (error) {
      console.error(
        "Failed to fetch customer address:",
        error
      );
    }
  }

  // ---------------------------------------------------------
  // DEBUG
  // ---------------------------------------------------------

  console.log(
    "masterId -------------------------",
    masterId
  );

  console.log(
    "srno -----------------------------",
    srno
  );

  console.log(
    "createdAt -------------------------",
    createdAt
  );

  console.log(
    "subTotal --------------------------",
    subTotal
  );

  console.log(
    "taxTotal --------------------------",
    taxTotal
  );

  console.log(
    "discountTotal ---------------------",
    discountTotal
  );

  console.log(
    "deliveryFee -----------------------",
    deliveryFee
  );

  console.log(
    "grandTotal ------------------------",
    grandTotal
  );

  console.log(
    "paymentMode -----------------------",
    paymentMode
  );

  console.log(
    "paymentStatus ---------------------",
    paymentStatus
  );

  console.log(
    "orderStatus -----------------------",
    orderStatus
  );

  console.log(
    "email -----------------------------",
    email
  );

  console.log(
    "notes -----------------------------",
    notes
  );

  console.log(
    "addressId -------------------------",
    addressId
  );

  console.log(
    "customerAddress -------------------",
    customerAddress
  );

  // ---------------------------------------------------------
  // PAGE
  // ---------------------------------------------------------

  return (
    <main className="min-h-screen bg-slate-50 mt-2 mx-2">
      <div>

        {/* =====================================================
            PAGE HEADER
        ===================================================== */}

        <div className="mb-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  POS Order
                </h1>

                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  POS
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Order products and pricing details
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex items-center gap-3">

                <div className="mb-4">
                  <BackButton />
                </div>

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Order ID
                  </div>

                  <div className="mt-0.5 max-w-[280px] truncate font-mono text-xs font-medium text-slate-700">
                    {masterId}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* =====================================================
            ORDER MASTER SUMMARY
        ===================================================== */}

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          {/* SUMMARY HEADER */}

          <div className="mb-5 flex items-start justify-between">

            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Order Information
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Order master details and payment information
              </p>
            </div>

            <div className="text-right">
              {srno && (
                <>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Order No.
                  </div>

                  <div className="mt-0.5 text-sm font-bold text-indigo-600">
                    {srno}
                  </div>
                </>
              )}
            </div>

          </div>

          {/* ORDER STATUS */}

          <div className="mb-5 flex flex-wrap gap-2">

            {orderStatus && (
              <span
                className="
                  rounded-full
                  bg-blue-50
                  px-3
                  py-1.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-blue-600
                "
              >
                Order: {orderStatus}
              </span>
            )}

            {paymentStatus && (
              <span
                className="
                  rounded-full
                  bg-emerald-50
                  px-3
                  py-1.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-emerald-600
                "
              >
                Payment: {paymentStatus}
              </span>
            )}

            {paymentMode && (
              <span
                className="
                  rounded-full
                  bg-slate-100
                  px-3
                  py-1.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-slate-600
                "
              >
                {paymentMode}
              </span>
            )}

          </div>

          {/* ORDER DETAILS */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* CREATED */}

            {createdAt && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Order Date
                </div>

                <div className="mt-1 text-sm font-semibold text-slate-700">
                  {createdAt}
                </div>
              </div>
            )}

            {/* EMAIL */}

            {email && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Email
                </div>

                <div className="mt-1 truncate text-sm font-medium text-slate-700">
                  {email}
                </div>
              </div>
            )}

            {/* PAYMENT MODE */}

            {paymentMode && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Payment Mode
                </div>

                <div className="mt-1 text-sm font-semibold text-slate-700">
                  {paymentMode}
                </div>
              </div>
            )}

            {/* ORDER STATUS */}

            {orderStatus && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Order Status
                </div>

                <div className="mt-1 text-sm font-semibold text-slate-700">
                  {orderStatus}
                </div>
              </div>
            )}

          </div>

          {/* NOTES */}

          {notes && (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Notes
              </div>

              <div className="mt-1 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {notes}
              </div>
            </div>
          )}

          {/* ===================================================
              TOTALS
          =================================================== */}

          <div className="mt-5 border-t border-slate-100 pt-5">

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

              {/* SUBTOTAL */}

              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Subtotal
                </div>

                <div className="mt-1 text-sm font-bold text-slate-800">
                  ₹{subTotal ?? "0"}
                </div>
              </div>

              {/* TAX */}

              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Tax
                </div>

                <div className="mt-1 text-sm font-bold text-slate-800">
                  ₹{taxTotal ?? "0"}
                </div>
              </div>

              {/* DISCOUNT */}

              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Discount
                </div>

                <div className="mt-1 text-sm font-bold text-slate-800">
                  ₹{discountTotal ?? "0"}
                </div>
              </div>

              {/* DELIVERY */}

              <div className="rounded-xl bg-slate-50 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Delivery
                </div>

                <div className="mt-1 text-sm font-bold text-slate-800">
                  ₹{deliveryFee ?? "0"}
                </div>
              </div>

              {/* GRAND TOTAL */}

              <div className="rounded-xl bg-indigo-50 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-500">
                  Grand Total
                </div>

                <div className="mt-1 text-base font-bold text-indigo-700">
                  ₹{grandTotal ?? "0"}
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            CUSTOMER ADDRESS
        ===================================================== */}

        {customerAddress && (
          <div className="mb-5">
            <CustomerAddress
              address={customerAddress}
            />
          </div>
        )}

        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        {products.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-xl">
              📦
            </div>

            <h2 className="mt-4 text-base font-semibold text-slate-800">
              No products found
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              No products are associated with this POS order.
            </p>

          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">

            {/* TABLE HEADER */}

            <div className="min-w-[850px] border-b border-slate-200 bg-slate-50 px-4 py-3">

              <div className="grid grid-cols-[minmax(280px,1fr)_70px_110px_120px_110px_130px] gap-4">

                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Product
                </div>

                <div className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Qty
                </div>

                <div className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Price
                </div>

                <div className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Subtotal
                </div>

                <div className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Tax
                </div>

                <div className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Total
                </div>

              </div>
            </div>

            {/* PRODUCT ROWS */}

            <div>
              {products.map((item) => (
                <ProductList
                  key={item.id}
                  item={item}
                />
              ))}
            </div>

          </div>
        )}

      </div>
    </main>
  );
}