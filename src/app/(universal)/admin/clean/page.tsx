"use client";

import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { clearStockMovements } from "../../action/clean/clearStockMovements";
import { clearSupplierLedger } from "../../action/clean/clearSupplierLedger";
import { clearStockLedgerFinished } from "../../action/clean/clearStockLedgerFinished";
import { clearStockLedgerInventory } from "../../action/clean/clearStockLedgerInventory";
import { clearCustomerLedger } from "../../action/clean/customerLedger";
import { resetProductStockFields } from "../../action/clean/resetProductStockFields";
import { resetInventoryItemFields } from "../../action/clean/resetInventoryItemFields";
import { resetSupplierAccounts } from "../../action/clean/resetSupplierAccounts";
import { resetCustomerAccounts } from "../../action/clean/resetCustomerAccounts";



export default function ClearERPDataPage() {

  const [loading, setLoading] = useState<string | null>(null);


  const handleClear = async (
    name: string,
    action: () => Promise<any>
  ) => {

    const confirmDelete = window.confirm(
      `Are you sure you want to clear ${name}?`
    );

    if (!confirmDelete) return;


    try {

      setLoading(name);

      const result = await action();


      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }


    } catch (error: any) {

      toast.error(
        error.message || "Something went wrong"
      );

    } finally {

      setLoading(null);

    }
  };


  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow p-6">

        <h1 className="text-2xl font-bold mb-2">
          ERP Test Data Cleanup
        </h1>

        <p className="text-gray-500 mb-6">
          Clear transaction collections one by one for testing.
        </p>


        <div className="space-y-4">


          <div className="flex items-center justify-between border rounded-xl p-4">

            <div>
              <h2 className="font-semibold">
                Stock Movements
              </h2>

              <p className="text-sm text-gray-500">
                Clears stock transfer/sale movements
              </p>
            </div>


            <Button
              variant="destructive"
              disabled={loading !== null}
              onClick={() =>
                handleClear(
                  "Stock Movements",
                  clearStockMovements
                )
              }
            >
              {loading === "Stock Movements"
                ? "Clearing..."
                : "Clear"}
            </Button>

          </div>




          <div className="flex items-center justify-between border rounded-xl p-4">

            <div>
              <h2 className="font-semibold">
                Supplier Ledger
              </h2>

              <p className="text-sm text-gray-500">
                Clears supplier transactions
              </p>
            </div>


            <Button
              variant="destructive"
              disabled={loading !== null}
              onClick={() =>
                handleClear(
                  "Supplier Ledger",
                  clearSupplierLedger
                )
              }
            >
              {loading === "Supplier Ledger"
                ? "Clearing..."
                : "Clear"}
            </Button>

          </div>




          <div className="flex items-center justify-between border rounded-xl p-4">

            <div>
              <h2 className="font-semibold">
                Stock Ledger Finished
              </h2>

              <p className="text-sm text-gray-500">
                Clears finished product ledger
              </p>
            </div>


            <Button
              variant="destructive"
              disabled={loading !== null}
              onClick={() =>
                handleClear(
                  "Stock Ledger Finished",
                  clearStockLedgerFinished
                )
              }
            >
              {loading === "Stock Ledger Finished"
                ? "Clearing..."
                : "Clear"}
            </Button>

          </div>





          <div className="flex items-center justify-between border rounded-xl p-4">

            <div>
              <h2 className="font-semibold">
                Stock Ledger Inventory
              </h2>

              <p className="text-sm text-gray-500">
                Clears inventory ledger transactions
              </p>
            </div>


            <Button
              variant="destructive"
              disabled={loading !== null}
              onClick={() =>
                handleClear(
                  "Stock Ledger Inventory",
                  clearStockLedgerInventory
                )
              }
            >
              {loading === "Stock Ledger Inventory"
                ? "Clearing..."
                : "Clear"}
            </Button>

          </div>

          <div className="flex items-center justify-between border rounded-xl p-4">

            <div>
              <h2 className="font-semibold">
                Customer Ledger
              </h2>

              <p className="text-sm text-gray-500">
                Clears customer transactions
              </p>
            </div>


            <Button
              variant="destructive"
              disabled={loading !== null}
              onClick={() =>
                handleClear(
                  "Customer Ledger",
                  clearCustomerLedger
                )
              }
            >
              {loading === "Customer Ledger"
                ? "Clearing..."
                : "Clear"}
            </Button>

          </div>


          <div className="flex items-center justify-between border rounded-xl p-4">

            <div>
              <h2 className="font-semibold">
                Supplier Ledger
              </h2>

              <p className="text-sm text-gray-500">
                Clears supplier transactions
              </p>
            </div>


            <Button
              variant="destructive"
              disabled={loading !== null}
              onClick={() =>
                handleClear(
                  "Supplier Ledger",
                  clearSupplierLedger
                )
              }
            >
              {loading === "Supplier Ledger"
                ? "Clearing..."
                : "Clear"}
            </Button>

          </div>


          <div className="flex items-center justify-between border rounded-xl p-4">
            <div>
              <h2 className="font-semibold">
                Reset Product Stock(disabled)
              </h2>

              <p className="text-sm text-gray-500">
                Resets stock quantities, prices, and stock value to zero.
              </p>
            </div>

            {/* <Button
              variant="destructive"
              disabled={loading !== null}
              onClick={() =>
                handleClear(
                  "Reset Product Stock",
                  resetProductStockFields
                )
              }
            >
              {loading === "Reset Product Stock"
                ? "Resetting..."
                : "Reset"}
            </Button> */}
          </div>

          <div className="flex items-center justify-between border rounded-xl p-4">
            <div>
              <h2 className="font-semibold">
                Reset Inventory Items(disabled)
              </h2>

              <p className="text-sm text-gray-500">
                Resets inventory stock, costs, prices, and stock value to zero.
              </p>
            </div>

            {/* <Button
              variant="destructive"
              disabled={loading !== null}
              onClick={() =>
                handleClear(
                  "Reset Inventory Items",
                  resetInventoryItemFields
                )
              }
            >
              {loading === "Reset Inventory Items"
                ? "Resetting..."
                : "Reset"}
            </Button> */}
          </div>


          <div className="flex items-center justify-between border rounded-xl p-4">
  <div>
    <h2 className="font-semibold">
      Reset Supplier Accounts
    </h2>

    <p className="text-sm text-gray-500">
      Resets supplier account balances and payment totals to zero.
    </p>
  </div>

  <Button
    variant="destructive"
    disabled={loading !== null}
    onClick={() =>
      handleClear(
        "Reset Supplier Accounts",
        resetSupplierAccounts
      )
    }
  >
    {loading === "Reset Supplier Accounts"
      ? "Resetting..."
      : "Reset"}
  </Button>
</div>


<div className="flex items-center justify-between border rounded-xl p-4">
  <div>
    <h2 className="font-semibold">
      Reset Customer Accounts
    </h2>

    <p className="text-sm text-gray-500">
      Resets customer balances and payment/sales totals to zero.
    </p>
  </div>

  <Button
    variant="destructive"
    disabled={loading !== null}
    onClick={() =>
      handleClear(
        "Reset Customer Accounts",
        resetCustomerAccounts
      )
    }
  >
    {loading === "Reset Customer Accounts"
      ? "Resetting..."
      : "Reset"}
  </Button>
</div>

        </div>

      </div>

    </div>
  );
}