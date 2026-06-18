//admin/inventory/dashboard

"use server";

import {
  fetchInventoryDashboard,
} from "@/app/(universal)/action/inventory/fetchInventoryDashboard";

import {
  AlertTriangle,
  Boxes,
  IndianRupee,
  TrendingDown,
  Clock3,
  Tags,
  Truck,
} from "lucide-react";


import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";

export default async function InventoryDashboardPage() {



  
  const dashboard =
    await fetchInventoryDashboard();

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-2 pt-0 md:p-4">
      <div className="w-full mx-auto flex flex-col gap-6">

        {/* ===================================================== */}
        {/* HEADER */}
        {/* ===================================================== */}

        <div className="w-full bg-green-100 rounded-3xl border border-gray-100 shadow-sm p-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Inventory Dashboard
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Inventory overview and stock analytics
            </p>
          </div>
        </div>

        {/* ===================================================== */}
        {/* STATS */}
        {/* ===================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

          {/* TOTAL ITEMS */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Total Items
                </p>

                <h2 className="text-3xl font-bold text-gray-800 mt-2">
                  {dashboard.totalItems}
                </h2>
              </div>

              <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <Boxes
                  className="text-blue-600"
                  size={26}
                />
              </div>
            </div>
          </div>

          {/* LOW STOCK */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Low Stock
                </p>

                <h2 className="text-3xl font-bold text-orange-600 mt-2">
                  {dashboard.lowStockItems}
                </h2>
              </div>

              <div className="h-14 w-14 rounded-2xl bg-orange-100 flex items-center justify-center">
                <AlertTriangle
                  className="text-orange-600"
                  size={26}
                />
              </div>
            </div>
          </div>

          {/* NEGATIVE STOCK */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Negative Stock
                </p>

                <h2 className="text-3xl font-bold text-red-600 mt-2">
                  {
                    dashboard.negativeStockItems
                  }
                </h2>
              </div>

              <div className="h-14 w-14 rounded-2xl bg-red-100 flex items-center justify-center">
                <TrendingDown
                  className="text-red-600"
                  size={26}
                />
              </div>
            </div>
          </div>

          {/* STOCK VALUE */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Stock Value
                </p>

                <h2 className="text-3xl font-bold text-green-600 mt-2">
                  ₹
                  {dashboard.totalStockValue.toFixed(
                    2
                  )}
                </h2>
              </div>

              <div className="h-14 w-14 rounded-2xl bg-green-100 flex items-center justify-center">
                <IndianRupee
                  className="text-green-600"
                  size={26}
                />
              </div>
            </div>
          </div>
        </div>


        {/* ===================================================== */}
        {/* CONTENT */}
        {/* ===================================================== */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* ===================================================== */}
          {/* LOW STOCK LIST */}
          {/* ===================================================== */}

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-xl font-bold text-gray-800">
                Low Stock Items
              </h2>

              <p className="text-sm text-gray-500">
                Items reaching minimum stock
              </p>
            </div>

            <div className="p-6">
              {dashboard.lowStockList
                .length === 0 ? (
                <div className="h-[250px] flex items-center justify-center text-gray-400">
                  No low stock items
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {dashboard.lowStockList.map(
                    (item: any) => (
                      <div
                        key={item.id}
                        className="border border-orange-100 bg-orange-50 rounded-2xl px-4 py-4 flex items-center justify-between"
                      >
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {item.name}
                          </h3>

                          <p className="text-sm text-gray-500 mt-1">
                            Min Stock:{" "}
                            {item.minStock}{" "}
                            {item.consumptionUnit}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-bold text-orange-600">
                            {
                              item.currentStock
                            }{" "}
                            {item.consumptionUnit}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ===================================================== */}
          {/* RECENT TRANSACTIONS */}
          {/* ===================================================== */}

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <Clock3
                  size={20}
                  className="text-gray-600"
                />

                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Recent Transactions
                  </h2>

                  <p className="text-sm text-gray-500">
                    Latest inventory activity
                  </p>
                </div>
              </div>
            </div>

          <div className="max-h-[500px] overflow-y-auto">
  {dashboard.recentTransactions.length === 0 ? (
    <div className="h-[250px] flex items-center justify-center text-gray-400">
      No transactions found
    </div>
  ) : (
    dashboard.recentTransactions.map((trx: any) => {
      const style = getTransactionStyle(trx.transactionType);

      const sign =
        trx.transactionType === "ADJUSTMENT"
          ? trx.direction === "IN"
            ? "+"
            : "-"
          : style.sign;

      return (
        <div
          key={trx.id}
          className="border-b border-gray-100 px-6 py-4 hover:bg-gray-50 flex items-center justify-between"
        >
          {/* LEFT */}
          <div>
            <h3 className="font-semibold text-gray-800">
              {trx.inventoryItemName}
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              {trx.note}
            </p>
          </div>

          {/* RIGHT */}
          <div className="text-right">
            <div className={`text-sm font-bold ${style.color}`}>
              {sign}
              {trx.quantity}
            </div>

            <div className="text-xs text-gray-400 mt-1 uppercase">
              {trx.transactionType}
            </div>
          </div>
        </div>
      );
    })
  )}
</div>
          </div>
        </div>
      </div>
    </div>
  );
}




 function getTransactionStyle(type: InventoryTransactionNameType) {
  switch (type) {
    case "PURCHASE":
    case "OPENING":
    case "CUSTOMER_RETURN":
      return {
        color: "text-green-600",
        sign: "+",
      };

    case "SALE":
    case "WASTAGE":
    case "SUPPLIER_RETURN":
      return {
        color: "text-red-600",
        sign: "-",
      };

    case "ADJUSTMENT":
      return {
        color: "text-blue-600",
        sign: "", // depends on direction
      };

    case "RETURN":
      return {
        color: "text-yellow-600",
        sign: "",
      };

    default:
      return {
        color: "text-gray-600",
        sign: "",
      };
  }
}