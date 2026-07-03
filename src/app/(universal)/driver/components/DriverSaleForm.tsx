
"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useForm } from "react-hook-form";

import { Search, Package2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { addItemSale } from "@/app/(universal)/action/stock-finished/addItemSale";
import { WholeCustomerType } from "@/lib/types/WholeSaleCustomerType";

import {
  InventoryItemType,
  InventoryUnit,
} from "@/lib/types/InventoryItemType";

import { PaymentStatus } from "@/lib/types/PaymentStatus";
import { displayStock } from "@/utils/inventory/displayStock";
import { ProductType } from "@/lib/types/productType";
import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";
import { ProductStock } from "@/lib/types/productStockType";
import Link from "next/link";

type PaymentMethod = "CASH" | "UPI" | "CARD";

type FormType = {
  id: string;
  wholeSaleCutomerId?: string;
  wholeSaleCutomerName?: string;
  type: InventoryTransactionNameType;

  direction: "IN" | "OUT";

  quantity: number;

  transactionUnit: InventoryUnit;

  // ✅ ADD THIS
  unitPrice: number;
  paymentStatus: PaymentStatus; // 
  paymentMethod?: PaymentMethod;
  paidAmount?: number;          // 
  dueAmount?: number;

  note: string;
};

type Props = {
  products: ProductStock[];

  customers: WholeCustomerType[];
  userName: string;
};;


export default function DriverSaleForm({
  products,
  customers,
  userName
}: Props) {

  console.log("user------------------", userName)

  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [search, setSearch] =
    useState("");

  const [showDropdown, setShowDropdown] =
    useState(false);

  const [
    selectedProduct,
    setselectedProduct,
  ] =
    useState<ProductStock | null>(
      null
    );



  const [customerSearch, setCustomerSearch] =
    useState("");



  const filteredCustomers =
    customers.filter((customer) =>
      customer.companyName
        ?.toLowerCase()
        .includes(
          customerSearch.toLowerCase()
        )
    );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<FormType>({
    defaultValues: {
      type: "SALE",
      direction: "OUT",

      paymentStatus: "PAID",
      paymentMethod: "CASH",
      paidAmount: 0,
      quantity: 0,
      unitPrice: 0,
      note: "",
    },
  });

  const customerId = watch("wholeSaleCutomerId");

  const paymentStatus = watch("paymentStatus");
  const paidAmount = Number(watch("paidAmount") || 0);
  const quantity = Number(watch("quantity") || 0);
  const unitPrice = Number(watch("unitPrice") || 0);

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === customerId) || null;
  }, [customerId, customers]);

  const type = watch(
    "type"
  );

  const transactionUnit = watch("transactionUnit");



  // =====================================================
  // AUTO SET STOCK DIRECTION
  // =====================================================







  // =====================================================
  // FILTER INVENTORY
  // =====================================================

  const filteredItem =
    useMemo(() => {
      if (!search.trim()) return [];

      return products
        .filter((item) =>
          item.name
            ?.toLowerCase()
            .includes(
              search
                .trim()
                .toLowerCase()
            )
        )
        .slice(0, 20);


    }, [search, products]);


  const totalAmount = quantity * unitPrice;
  const dueAmount = Math.max(totalAmount - paidAmount, 0);

  useEffect(() => {
    if (paymentStatus === "PAID") {
      setValue("paidAmount", totalAmount);
    }

    if (paymentStatus === "CREDIT") {
      setValue("paidAmount", 0);
    }
  }, [paymentStatus, totalAmount, setValue]);
  // =====================================================
  // SUBMIT
  // =====================================================

  async function onSubmit(data: FormType) {
    if (isSubmitting) return;

    if (!selectedProduct) {
      alert("Please select inventory item");
      return;
    }

    // =====================================================
    // CALCULATE TOTALS
    // =====================================================

    const totalAmount =
      Number(data.quantity) *
      Number(data.unitPrice);

    const paidAmount =
      Number(data.paidAmount || 0);

    const dueAmount =
      Math.max(totalAmount - paidAmount, 0);

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!data.quantity || Number(data.quantity) <= 0) {
      alert("Enter valid quantity");
      return;
    }

    if (!data.unitPrice || Number(data.unitPrice) <= 0) {
      alert("Selling price must be greater than 0");
      return;
    }

    // Stock validation
    if (
      selectedProduct &&
      Number(data.quantity) >
      selectedProduct.currentStock!
    ) {
      alert("Not enough stock available");
      return;
    }

    // Payment Method
    if (
      data.paymentStatus !== "CREDIT" &&
      !data.paymentMethod
    ) {
      alert("Select payment method");
      return;
    }

    // Partial payment validation
    if (
      data.paymentStatus === "PARTIAL" &&
      paidAmount <= 0
    ) {
      alert("Enter paid amount");
      return;
    }

    // Paid amount validation
    if (paidAmount > totalAmount) {
      alert("Paid amount cannot exceed total amount");
      return;
    }

    // =====================================================
    // PREPARE DATA
    // =====================================================

    const finalQuantity =
      Number(data.quantity);

    const finalUnitPrice =
      Number(data.unitPrice);

    const finalCustomerId =
      customerId || undefined;

    const finalCustomerName =
      selectedCustomer?.companyName ||
      "Walk-in Customer";

    // =====================================================
    // SAVE
    // =====================================================

    setIsSubmitting(true);

    console.log({
      paymentStatus: data.paymentStatus,
      paymentMethod: data.paymentMethod,
      totalAmount,
      paidAmount,
      dueAmount,
    });

    try {
      const result = await addItemSale({
        id: data.id,

        wholeSaleCutomerId: finalCustomerId,
        wholeSaleCutomerName: finalCustomerName,

        type: "SALE",
        direction: "OUT",

        quantity: finalQuantity,
        unitPrice: finalUnitPrice,
        transactionUnit: transactionUnit,

        paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
        paidAmount,
        dueAmount,

        note: data.note,
         createdBy: userName,
      });

      if (result.success) {
        setselectedProduct({
          ...selectedProduct,
          currentStock:
            selectedProduct.currentStock! -
            finalQuantity,
        });

        reset({
          type: "SALE",
          direction: "OUT",

          paymentStatus: "PAID",
          paymentMethod: "CASH",

          paidAmount: 0,

          quantity: 0,
          unitPrice: 0,

          note: "",
          id: "",
        });

        setselectedProduct(null);
        setSearch("");
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem("lastCustomerId");
    if (saved) {
      setValue("wholeSaleCutomerId", saved);
    }
  }, []);

  useEffect(() => {
    if (customerId) {
      localStorage.setItem("lastCustomerId", customerId);
    }
  }, [customerId]);



  return (
    <div className="min-h-screen ">


      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

    
      {/* ===================================================== */}
      {/* FORM */}
      {/* ===================================================== */}

      <form
        onSubmit={handleSubmit(
          onSubmit
        )}
        className="flex flex-col xl:flex-row gap-3 w-full mt-10 m-2"
      >


        <div className="bg-white flex-[0.45] rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
          {/* Customer Selection */}
          <div className="bg-white   border-gray-100  ">
            <div className="flex items-center justify-between mb-4">
              <div>
                {/* <h2 className="text-lg font-semibold text-gray-800">
                  Wholesale Customer
                </h2> */}

                <p className="text-sm text-gray-500 mt-1">
                  Select customer for wholesale sale
                </p>
              </div>
            </div>



            {/* ===================================================== */}
            {/* CUSTOMER */}
            {/* ===================================================== */}

            <div className="bg-white  ">
              <div className="flex mb-3 justify-between">
                <div className="flex items-center justify-between mb-4">
                  {selectedCustomer && (
                    <div className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      {selectedCustomer.companyName}
                    </div>
                  )}
                </div>

              </div>

              {/* SEARCH */}
              <div className="relative">

                <Search
                  size={18}
                  className="absolute right-2 top-3 text-gray-400"
                />

                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) =>
                    setCustomerSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search customer..."
                  className="input-style-4 pl-10"
                />
              </div>

              {/* LIST */}
              <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-gray-200">

                {filteredCustomers.length > 0 ? (

                  filteredCustomers.map(
                    (customer) => (

                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => {
                          setValue("wholeSaleCutomerId", customer.id);
                          setCustomerSearch(customer.companyName);
                          setShowDropdown(false);
                        }}
                        className={`
              w-full text-left px-4 py-3
              border-b border-gray-100
              hover:bg-slate-50
              transition
              ${selectedCustomer?.id ===
                            customer.id
                            ? "bg-blue-50"
                            : ""
                          }
            `}
                      >

                        <div className="font-medium text-sm text-gray-800">
                          {customer.companyName}
                        </div>

                        <div className="text-xs text-gray-500">
                          {customer.phone || "No phone"}
                        </div>

                      </button>
                    )
                  )

                ) : (

                  <div className="p-4 text-sm text-gray-400 text-center">
                    No customer found
                  </div>

                )}
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* INVENTORY SEARCH */}
          {/* ===================================================== */}

          <div className="flex flex-col gap-2">
            <label className="label-style-4">
              Inventory Item
            </label>

            <div className="relative">

              {!search.trim() && (
                <Search
                  size={18}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                />
              )}

              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(
                    e.target.value
                  );

                  setShowDropdown(
                    true
                  );
                }}
                placeholder="Search product"
                className={`input-style-4 pr-4 ${!search.trim()
                  ? "pl-12"
                  : "pl-4"
                  }`}
              />

              {/* DROPDOWN */}

              {showDropdown &&
                filteredItem.length >
                0 && (
                  <div className="absolute z-50 mt-2 w-full max-h-80 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">

                    {filteredItem.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setselectedProduct(item);

                          setValue(
                            "id",
                            item.id
                          );

                          // default transaction unit
                          // setValue(
                          //   "transactionUnit",
                          //   item.purchaseUnit
                          // );

                          setSearch(item.name);

                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="font-medium text-gray-800">
                          {item.name}
                        </div>

                        <div className="text-xs text-gray-400">
                          Current:{" "}
                          {item.currentStock}{" "}

                        </div>
                      </button>
                    ))}
                  </div>
                )}
            </div>

            <input
              type="hidden"
              {...register(
                "id"
              )}
            />
          </div>

          {/* ===================================================== */}
          {/* CURRENT STOCK */}
          {/* ===================================================== */}

          {selectedProduct && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 flex items-center justify-between">

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Package2
                    className="text-blue-600"
                    size={22}
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800">
                    {
                      selectedProduct.name
                    }
                  </h3>

                  {/* <p className="text-sm text-gray-500">
                      Current Stock
                    </p> */}
                </div>
              </div>

              <div className="text-2xl font-bold text-blue-700">
                {/* {selectedProduct.currentStock} */}
                {/* { selectedProduct.purchaseUnit,} */}
                {/* {displayStock(
                  selectedproduct.currentStock!,
                  selectedProduct.purchaseUnit,
                  selectedProduct.consumptionUnit,
                  selectedProduct.conversionFactor
                )} */}
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TYPE */}
          {/* ===================================================== */}



          {/* ===================================================== */}
          {/* QUANTITY */}
          {/* ===================================================== */}


          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Quantity
              </label>

              <input
                type="number"
                step="0.001"
                {...register("quantity")}
                onFocus={(e) => {
                  if (e.target.value === "0") {
                    e.target.value = "";
                  }
                }}
                className="input-style-4"
                placeholder="0"
              />
            </div>

            {/* PRICE */}
            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Price
              </label>

              <input
                type="number"
                step="0.01"
                {...register("unitPrice")}
                onFocus={(e) => {
                  if (e.target.value === "0") {
                    e.target.value = "";
                  }
                }}
                className="input-style-4"
                placeholder="Enter price"
              />
            </div>

            {/* UNIT SELECTOR */}
            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Unit
              </label>

              <select
                {...register("transactionUnit")}
                className="input-style-4"
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="pcs">Piece (pcs)</option>
                <option value="box">Box</option>
                <option value="pack">Pack</option>
                <option value="bottle">Bottle</option>
                <option value="can">Can</option>
                <option value="jar">Jar</option>
                <option value="bag">Bag</option>
                <option value="carton">Carton</option>
                <option value="tray">Tray</option>
                <option value="roll">Roll</option>
                <option value="pair">Pair</option>
                <option value="dozen">Dozen</option>


                <option value="gm">Gram (g)</option>
                <option value="ltr">Liter (L)</option>
                <option value="ml">Milliliter (ml)</option>
              </select>
            </div>



          </div>


          <div className="rounded-2xl   space-y-4">

            <h3 className="font-semibold text-lg">
              Payment
            </h3>

            <div className="grid md:grid-cols-2 gap-4">

              {/* Payment Status */}

              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Payment Status
                </label>

                <select
                  {...register("paymentStatus")}
                  className="input-style-4"
                >
                  <option value="PAID">Paid</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="CREDIT">Credit</option>
                </select>
              </div>

              {/* Payment Method */}

              {paymentStatus !== "CREDIT" && (
                <div className="flex flex-col gap-2">
                  <label className="label-style-4">
                    Payment Method
                  </label>

                  <select
                    {...register("paymentMethod")}
                    className="input-style-4"
                  >
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>
              )}

              {/* Paid Amount */}

              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Paid Amount
                </label>

                <input
                  type="number"
                  step="0.01"
                  disabled={paymentStatus === "PAID"}
                  {...register("paidAmount")}
                  className="input-style-4"
                />
              </div>

              {/* Due Amount */}

              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Due Amount
                </label>

                <input
                  value={dueAmount.toFixed(2)}

                  readOnly
                  className="input-style-4 bg-gray-100"
                />
              </div>

            </div>

            <div className="rounded-xl bg-green-50 border border-green-200 p-4 flex justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Total Amount
                </p>

                <p className="text-2xl font-bold">
                  ₹ {totalAmount.toFixed(2)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Balance
                </p>

                <p
                  className={`text-2xl font-bold ${dueAmount > 0
                    ? "text-red-600"
                    : "text-green-600"
                    }`}
                >
                  ₹ {dueAmount.toFixed(2)}
                </p>
              </div>

            </div>

          </div>

          {/* ===================================================== */}
          {/* NOTE */}
          {/* ===================================================== */}

          <div className="flex flex-col gap-2">
            <label className="label-style-4">
              Note
            </label>

            <textarea
              {...register("note")}
              placeholder="Optional note..."
              className="input-style-4 h-10 overflow-hidden resize-none"
            />
          </div>

          {/* ===================================================== */}
          {/* SAVE */}
          {/* ===================================================== */}

        </div>

        {/* Sticky Bottom Bar */}

        <div className="sticky bottom-0 -mx-6 mt-6 border-t bg-white px-6 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="btn-save-4 h-12 w-full text-base font-semibold"
          >
            {isSubmitting ? "Saving..." : "Save Sale"}
          </Button>
        </div>

      </form>

    </div >
  );
}
