"use client";


import { ProductStockType } from "@/lib/types/productStockType";
import DriverHeader from "./components/DriverHeader";
import HomeCards from "./components/HomeCards";
import { WholeCustomerType } from "@/lib/types/WholeSaleCustomerType";
import { useState } from "react";
import DriverSaleForm from "./components/DriverSaleForm";



type Props = {
  products: ProductStockType[];

  customers: WholeCustomerType[];
  userName: string;
};
import {
  ArrowLeft,
  RefreshCw,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DriverDashboard({
  userName,
  products,
  customers,
}: Props) {
  const [screen, setScreen] = useState<
    "home" | "sale" | "return"
  >("home");

  return (
   <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-100">

  {/* Background Decoration */}
  <div className="absolute -top-32 -left-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

  <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-indigo-400/20 blur-3xl" />

  <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/20 blur-3xl" />

  <div className="relative z-10">
    <DriverHeader userName={userName} />

      <div className="w-full">
        {screen !== "home" && (
          <div className="sticky top-0 z-30 bg-white px-4 py-3 border-b">

            <div className="flex items-center justify-between">

              {/* Back */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setScreen("home")}
                className="rounded-full h-11 w-11"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <h1 className="text-lg font-semibold">
                {screen === "sale"
                  ? "Sales"
                  : "Customer Return"}
              </h1>

              {/* Switch Screen */}
              {screen === "sale" ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setScreen("return")}
                  className="rounded-full px-4 h-11"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Returns
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setScreen("sale")}
                  className="rounded-full px-4 h-11"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Sales
                </Button>
              )}

            </div>

          </div>
        )}

        {screen === "home" && (
          <HomeCards
            onSale={() => setScreen("sale")}
            onReturn={() => setScreen("return")}
          />
        )}

        {screen === "sale" && (
          <DriverSaleForm
            products={products}
            customers={customers}
             userName={userName}
          />
        )}



        {screen === "return" && (
          <div className="p-6">
            Customer Return Page
          </div>
        )}

      </div>
      </div>
    </main>
  );
}