
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
import { WholeCustomerType, WholeCustomerTypeS } from "@/lib/types/WholeSaleCustomerType";

import {
  InventoryItemType,
  InventoryUnit,
} from "@/lib/types/InventoryItemType";
import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";
import { PaymentStatus } from "@/lib/types/PaymentStatus";
import { displayStock } from "@/utils/inventory/displayStock";
import { ProductType } from "@/lib/types/productType";

type PaymentMethod = "CASH" | "UPI" | "CARD";

type FormType = {
  id: string;
  wholeSaleCutomerId?: string;
  wholeSaleCutomerName?: string;
  transactionType: InventoryTransactionNameType;

  stockDirection: "IN" | "OUT";

  quantity: number;

  transactionUnit: InventoryUnit;

  // ✅ ADD THIS
  price: number;
  paymentStatus: PaymentStatus; // 
  paymentMethod?: PaymentMethod;
  paidAmount?: number;          // 

  note: string;
};

type Props = {
  products: ProductType[];

  customers: WholeCustomerType[];
};;


export default function ItemPurchaseForm({
  products,
  customers
}: Props) {




  const [isSubmitting, setIsSubmitting] =
    useState(false);
  const [search, setSearch] =
    useState("");

  const [showDropdown, setShowDropdown] =
    useState(false);

  const [
    selectedInventory,
    setSelectedInventory,
  ] =
    useState<ProductType | null>(
      null
    );



  const [customerSearch, setCustomerSearch] =
    useState("");

  const [
    selectedCustomer,
    setSelectedCustomer,
  ] = useState<WholeCustomerType | null>(
    null
  );

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
      transactionType: "PURCHASE",
      stockDirection: "IN",
      quantity: 0,
      transactionUnit: "pcs",
      note: "",
    },
  });

  const transactionType = watch(
    "transactionType"
  );

  const transactionUnit = watch("transactionUnit");

  // =====================================================
  // AUTO SET STOCK DIRECTION
  // =====================================================

  React.useEffect(() => {
    if (
      transactionType === "PURCHASE" ||
      transactionType === "OPENING_STOCK" ||
      transactionType === "CUSTOMER_RETURN"
    ) {
      setValue("stockDirection", "IN");
    }

    if (
      transactionType === "WASTAGE"
    ) {
      setValue("stockDirection", "OUT");
    }
  }, [transactionType, setValue]);



  React.useEffect(() => {
    switch (transactionType) {
      case "PURCHASE":
      case "OPENING_STOCK":
      case "CUSTOMER_RETURN":
        setValue("stockDirection", "IN");
        break;

      case "WASTAGE":
      case "SUPPLIER_RETURN":
        setValue("stockDirection", "OUT");
        break;

      // ADJUSTMENT = manual selection
    }
  }, [transactionType, setValue]);

  // =====================================================
  // FILTER INVENTORY
  // =====================================================

  const filteredInventory =
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

  // =====================================================
  // SUBMIT
  // =====================================================

  async function onSubmit(data: FormType) {
    if (isSubmitting) return;

    if (!selectedInventory) {
      alert("Please select inventory item");
      return;
    }

    // =====================================
    // PURCHASE VALIDATIONS
    // =====================================

    if (data.transactionType === "PURCHASE") {

      // supplier required
      if (!data.wholeSaleCutomerId) {
        alert("Please select supplier");
        return;
      }

      // price required
      if (!data.price || Number(data.price) <= 0) {
        alert("Unit cost must be greater than 0");
        return;
      }

      // payment method required
      if (
        data.paymentStatus === "PAID" &&
        !data.paymentMethod
      ) {
        alert("Please select payment method");
        return;
      }
    }

    const decimalAllowedUnits = [
      "kg",
      "gm",
      "ltr",
      "ml",
    ];

    const quantity =
      Number(data.quantity);

    if (
      !decimalAllowedUnits.includes(
        data.transactionUnit
      ) &&
      !Number.isInteger(quantity)
    ) {
      alert(
        `Decimal quantity not allowed for ${data.transactionUnit}`
      );

      return;
    }



    let finalQuantity =
      Number(data.quantity);

    let finalUnitCost =
      Number(data.price);

    const originalQuantity =
      Number(data.quantity);

    const originalUnitCost =
      Number(data.price);

    // Convert purchase unit -> consumption unit
    // if (
    //   data.transactionUnit ===
    //   selectedInventory.purchaseUnit &&
    //   selectedInventory.purchaseUnit !==
    //   selectedInventory.consumptionUnit
    // ) {
    //   // quantity convert
    //   finalQuantity =
    //     finalQuantity *
    //     selectedInventory.conversionFactor;

    //   // ✅ cost convert
    //   finalUnitCost =
    //     finalUnitCost /
    //     selectedInventory.conversionFactor;
    // }

    setIsSubmitting(true);

    console.log("paymentMethod--------------", data)

    try {
      const result = await addItemSale({
        id: data.id,

        wholeSaleCutomerId: data.wholeSaleCutomerId,

        // ✅ ADD THIS
        wholeSaleCutomerName:
          selectedCustomer?.companyName || "",

        transactionType: data.transactionType,

        stockDirection: data.stockDirection,

        // INTERNAL
        quantity: finalQuantity,

        price: finalUnitCost,

        // ORIGINAL
        purchaseQuantity: originalQuantity,

        purchaseUnit: data.transactionUnit,

        purchaseUnitCost: originalUnitCost,

       
        paymentStatus: data.paymentStatus,

        paymentMethod: data.paymentMethod,

        paidAmount: Number(data.paidAmount || 0),

        note: data.note,

        createdBy: "admin",
      });
      if (result.success) {
        let updatedStock =
          selectedInventory.currentStock;

        // if (data.stockDirection === "IN") {
        //   updatedStock += finalQuantity;
        // } else {
        //   updatedStock -= finalQuantity;
        // }

        setSelectedInventory({
          ...selectedInventory,
          currentStock: updatedStock,
        });

        reset({
          transactionType: "PURCHASE",
          stockDirection: "IN",
          quantity: 0,
          note: "",
          price: 0,
          id: selectedInventory.id,
        });
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }

    setIsSubmitting(false);
  }



  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
      <div className="max-w-3xl">

        {/* ===================================================== */}
        {/* HEADER */}
        {/* ===================================================== */}

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Stock Sale
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Sale Item
            stock manually
          </p>
        </div>

        {/* ===================================================== */}
        {/* FORM */}
        {/* ===================================================== */}

        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5"
        >

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
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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
                placeholder="Search inventory item..."
                className={`input-style-4 pr-4 ${!search.trim()
                  ? "pl-12"
                  : "pl-4"
                  }`}
              />

              {/* DROPDOWN */}

              {showDropdown &&
                filteredInventory.length >
                0 && (
                  <div className="absolute z-50 mt-2 w-full max-h-80 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">

                    {filteredInventory.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedInventory(item);

                          setValue(
                            "inventoryItemId",
                            item.id
                          );

                          // default transaction unit
                          setValue(
                            "transactionUnit",
                            item.purchaseUnit
                          );

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
                          {item.consumptionUnit}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
            </div>

            <input
              type="hidden"
              {...register(
                "inventoryItemId"
              )}
            />
          </div>

          {/* ===================================================== */}
          {/* CURRENT STOCK */}
          {/* ===================================================== */}

          {selectedInventory && (
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
                      selectedInventory.name
                    }
                  </h3>

                  <p className="text-sm text-gray-500">
                    Current Stock
                  </p>
                </div>
              </div>

              <div className="text-2xl font-bold text-blue-700">
                {displayStock(
                  selectedInventory.currentStock,
                  selectedInventory.purchaseUnit,
                  selectedInventory.consumptionUnit,
                  selectedInventory.conversionFactor
                )}
              </div>
            </div>
          )}

          {/* ===================================================== */}
          {/* TYPE */}
          {/* ===================================================== */}

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

              <div className="flex items-center justify-between mb-4">

              

                {selectedCustomer && (
                  <div className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    Selected
                  </div>
                )}
              </div>

              {/* SEARCH */}
              <div className="relative">

                <Search
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
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

                          setSelectedCustomer(
                            customer
                          );

                          setValue(
                            "wholeSaleCutomerId",
                            customer.id
                          );

                          setCustomerSearch(
                            customer.companyName
                          );
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
          {/* QUANTITY */}
          {/* ===================================================== */}


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Quantity
              </label>

              <input
                type="number"
                step="0.001"
                {...register("quantity")}
                className="input-style-4"
                placeholder="0"
              />
            </div>

            {/* <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Unit
              </label>

              <select
                {...register("transactionUnit")}
                className="input-style-4"
              >
                {selectedInventory && (
                  <option value={selectedInventory.purchaseUnit}>
                    {selectedInventory.purchaseUnit}
                  </option>
                )}

               
                {selectedInventory &&
                  selectedInventory.consumptionUnit !==
                  selectedInventory.purchaseUnit && (
                    <option value={selectedInventory.consumptionUnit}>
                      {selectedInventory.consumptionUnit}
                    </option>
                  )}
              </select>
            </div> */}

            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Unit Cost
              </label>

              <input
                type="number"
                step="0.01"
                {...register("price")}
                className="input-style-4"
                placeholder="Enter unit cost"
              />
            </div>




            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* PAYMENT STATUS */}
              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Payment Type
                </label>

                <select
                  {...register("paymentStatus")}
                  className="input-style-4"
                >
                  <option value="PAID">Paid</option>
                  <option value="CREDIT">Credit (Pay Later)</option>
                </select>
              </div>

              {/* OPTIONAL PAID AMOUNT */}
              {watch("paymentStatus") === "DUE" && (
                <div className="flex flex-col gap-2">
                  <label className="label-style-4">
                    Paid Amount (Optional)
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    {...register("paidAmount")}
                    className="input-style-4"
                    placeholder="0"
                  />
                </div>
              )}

              {watch("paymentStatus") === "PAID" && (
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
              rows={4}
              placeholder="Optional note..."
              className="input-style-4 resize-none"
            />
          </div>

          {/* ===================================================== */}
          {/* SAVE */}
          {/* ===================================================== */}

          <Button
            type="submit"
            disabled={
              isSubmitting
            }
            className="btn-save-4 h-11"
          >
            {isSubmitting
              ? "Saving..."
              : "Save Stock Sale"}
          </Button>
        </form>
      </div >
    </div >
  );
}
