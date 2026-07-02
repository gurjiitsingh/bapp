
"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useForm } from "react-hook-form";

import { Search, Package2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { adjustInventoryStock } from "@/app/(universal)/action/inventory/adjustInventoryStock";
import { SupplierType } from "@/lib/types/SupplierType";

import {
  InventoryItemType,
  InventoryUnit,
} from "@/lib/types/InventoryItemType";
import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";
import { PaymentStatus } from "@/lib/types/PaymentStatus";
import { displayStock } from "@/utils/inventory/displayStock";

type PaymentMethod = "CASH" | "UPI" | "CARD";

type FormType = {
  inventoryItemId: string;
  supplierId?: string;
  supplierName?: string;
  type: InventoryTransactionNameType;

  direction: "IN" | "OUT";

  quantity: number;

  transactionUnit: InventoryUnit;

  // ✅ ADD THIS
  unitCost: number;
  totalAmount: number; // NEW
  paymentStatus: PaymentStatus; // 
  paymentMethod?: PaymentMethod;
  paidAmount?: number;          // 
  //dueAmount?: number;
  note: string;
};

type Props = {
  inventoryItems: InventoryItemType[];
  supplierMap: Record<string, SupplierType[]>;
};


export default function StockPurchaseForm({
  inventoryItems,
  supplierMap
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
    useState<InventoryItemType | null>(
      null
    );

  const [lastEdited, setLastEdited] = useState<
    "unitCost" | "totalAmount"
  >("unitCost");



  const linkedSuppliers = supplierMap[selectedInventory?.id || ""] || [];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<FormType>({
    defaultValues: {
      type: "PURCHASE",
      direction: "IN",

      quantity: 0,

      unitCost: 0,
      totalAmount: 0,

      transactionUnit: "pcs",

      paymentStatus: "PAID",
      paymentMethod: "CASH",
      paidAmount: 0,

      note: "",
    },
  });

  const type = watch("type", "PURCHASE");

  const quantity = watch("quantity", 0);
  const unitCost = watch("unitCost", 0);
  const totalAmount = watch("totalAmount", 0);

  const transactionUnit = watch("transactionUnit", "pcs");

  const paymentStatus = watch("paymentStatus", "PAID");

  const paidAmount = Number(
    watch("paidAmount", 0)
  );


  const dueAmount = Math.max(
    (Number(totalAmount) || 0) - (Number(paidAmount) || 0),
    0
  );


  useEffect(() => {
    if (paymentStatus === "PAID") {
      setValue(
        "paidAmount",
        Number(totalAmount || 0)
      );
    }

    if (paymentStatus === "CREDIT") {
      setValue(
        "paidAmount",
        0
      );
    }
  }, [
    paymentStatus,
    totalAmount,
    setValue,
  ]);

  // =====================================================
  // AUTO SET STOCK DIRECTION
  // =====================================================

  React.useEffect(() => {
    if (
      type === "PURCHASE" ||
      type === "OPENING_STOCK" ||
      type === "CUSTOMER_RETURN"
    ) {
      setValue("direction", "IN");
    }

    if (
      type === "WASTAGE"
    ) {
      setValue("direction", "OUT");
    }
  }, [type, setValue]);



  React.useEffect(() => {
    switch (type) {
      case "PURCHASE":
      case "OPENING_STOCK":
      case "CUSTOMER_RETURN":
        setValue("direction", "IN");
        break;

      case "WASTAGE":
      case "SUPPLIER_RETURN":
        setValue("direction", "OUT");
        break;

      // ADJUSTMENT = manual selection
    }
  }, [type, setValue]);

  useEffect(() => {
    const qty = Number(quantity || 0);

    if (qty <= 0) return;

    if (lastEdited === "unitCost") {
      setValue(
        "totalAmount",
        Number((qty * Number(unitCost || 0)).toFixed(2))
      );
    }

    if (lastEdited === "totalAmount") {
      setValue(
        "unitCost",
        Number(
          (
            Number(totalAmount || 0) / qty
          ).toFixed(4)
        )
      );
    }
  }, [
    quantity,
    unitCost,
    totalAmount,
    lastEdited,
    setValue,
  ]);

  // =====================================================
  // FILTER INVENTORY
  // =====================================================

  const filteredInventory =
    useMemo(() => {
      if (!search.trim()) return [];

      return inventoryItems
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
    }, [search, inventoryItems]);

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

    if (data.type === "PURCHASE") {

      // supplier required
      if (!data.supplierId) {
        alert("Please select supplier");
        return;
      }

      // price required
      if (!data.unitCost || Number(data.unitCost) <= 0) {
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

    const selectedSupplier =
      linkedSuppliers.find(
        (s) => s.id === data.supplierId
      );

    let finalQuantity =
      Number(data.quantity);

    let finalUnitCost =
      Number(data.unitCost);

    const originalQuantity =
      Number(data.quantity);

    const originalUnitCost =
      Number(data.unitCost);

    // Convert purchase unit -> consumption unit
    if (
      data.transactionUnit ===
      selectedInventory.purchaseUnit &&
      selectedInventory.purchaseUnit !==
      selectedInventory.consumptionUnit
    ) {
      // quantity convert
      finalQuantity =
        finalQuantity *
        selectedInventory.conversionFactor;

      // ✅ cost convert
      finalUnitCost =
        finalUnitCost /
        selectedInventory.conversionFactor;
    }

    if (
      Number(data.paidAmount || 0) >
      Number(data.totalAmount)
    ) {
      alert(
        "Paid amount cannot exceed total amount"
      );

      return;
    }

    setIsSubmitting(true);



    try {
      const result = await adjustInventoryStock({
        inventoryItemId: data.inventoryItemId,

        supplierId: data.supplierId,

        // ✅ ADD THIS
        supplierName:
          selectedSupplier?.companyName || "",

        type: data.type,

        direction: data.direction,
        stockValue: totalAmount,
        // INTERNAL
        quantity: finalQuantity,

        unitCost: finalUnitCost,

        // ORIGINAL
        purchaseQuantity: originalQuantity,

        purchaseUnit: data.transactionUnit,

        purchaseUnitCost: originalUnitCost,

        conversionFactor:
          selectedInventory.conversionFactor,

        paymentStatus: data.paymentStatus,

        paymentMethod: data.paymentMethod,

        paidAmount: Number(data.paidAmount || 0),
        //  dueAmount: Number(data.dueAmount || 0), 
        note: data.note,

        createdBy: "admin",
      });
      if (result.success) {
        let updatedStock =
          selectedInventory.currentStock;

        if (data.direction === "IN") {
          updatedStock! += finalQuantity;
        } else {
          updatedStock! -= finalQuantity;
        }

        setSelectedInventory({
          ...selectedInventory,
          currentStock: updatedStock,
        });

        reset({
          type: "PURCHASE",
          direction: "IN",

          inventoryItemId: selectedInventory.id,

          quantity: 0,
          transactionUnit: selectedInventory.purchaseUnit,

          unitCost: 0,
          totalAmount: 0,

          paymentStatus: "PAID",
          paymentMethod: "CASH",
          paidAmount: 0,

          note: "",
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

  useEffect(() => {
    const qty = Number(quantity || 0);
    const rate = Number(unitCost || 0);

    if (qty > 0 && rate > 0) {
      setValue(
        "totalAmount",
        Number((qty * rate).toFixed(2))
      );
    }
  }, [quantity, unitCost, setValue]);

  const [pricingMode, setPricingMode] = useState<
    "RATE" | "AMOUNT"
  >("RATE");




  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6 w-full  ">
      <div className="w-full">

        {/* ===================================================== */}
        {/* HEADER */}
        {/* ===================================================== */}

        <div className="mb-6  ">
          <h1 className="text-3xl font-bold text-gray-800">
            Purchase
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Purchase raw stock
          </p>
        </div>

        {/* ===================================================== */}
        {/* FORM */}
        {/* ===================================================== */}

        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="flex flex-col xl:flex-row gap-3 w-full"
        >
          <div className="bg-white flex-[0.45] rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">
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
                    selectedInventory.currentStock!,
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {type === "PURCHASE" && (
                <div className="flex flex-col gap-2">
                  <label className="label-style-4">
                    Supplier
                  </label>

                  <select
                    {...register("supplierId")}
                    className="input-style-4"
                  >
                    <option value="">
                      Select Supplier
                    </option>

                    {linkedSuppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              )}


            </div>


            {/* ===================================================== */}
            {/* QUANTITY */}
            {/* ===================================================== */}

            <div className="rounded-2xl border border-gray-200 p-5 space-y-4">

              <h3 className="font-semibold text-lg">
                Purchase Details
              </h3>

              {/* ====================================================== */}
              {/* PURCHASE DETAILS */}
              {/* ====================================================== */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Quantity */}
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

                {/* Unit */}
                <div className="flex flex-col gap-2">
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
                        <option
                          value={
                            selectedInventory.consumptionUnit
                          }
                        >
                          {
                            selectedInventory.consumptionUnit
                          }
                        </option>
                      )}
                  </select>
                </div>

                {/* Total Amount */}
                <div className="flex flex-col gap-2">
                  <label className="label-style-4">
                    Total Amount
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    value={totalAmount || ""}
                    onChange={(e) => {
                      setLastEdited("totalAmount");

                      setValue(
                        "totalAmount",
                        Number(e.target.value || 0)
                      );
                    }}
                    className="input-style-4"
                    placeholder="Invoice Amount"
                  />
                </div>

                {/* Unit Cost */}
                <div className="flex flex-col gap-2">
                  <label className="label-style-4">
                    Price per {transactionUnit}
                  </label>

                  <input
                    type="number"
                    step="0.0001"
                    value={unitCost || ""}
                    onChange={(e) => {
                      setLastEdited("unitCost");

                      setValue(
                        "unitCost",
                        Number(e.target.value || 0)
                      );
                    }}
                    className="input-style-4"
                    placeholder={`Cost per ${transactionUnit}`}
                  />
                </div>

              </div>

              {/* ====================================================== */}
              {/* PAYMENT */}
              {/* ====================================================== */}

              <h3 className="font-semibold text-lg pt-2">
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
                    <option value="PAID">
                      Paid
                    </option>

                    <option value="PARTIAL">
                      Partial Payment
                    </option>

                    <option value="CREDIT">
                      Credit Purchase
                    </option>
                  </select>
                </div>

                {/* Payment Method */}
                {watch("paymentStatus") !== "CREDIT" && (
                  <div className="flex flex-col gap-2">
                    <label className="label-style-4">
                      Payment Method
                    </label>

                    <select
                      {...register("paymentMethod")}
                      className="input-style-4"
                    >
                      <option value="CASH">
                        Cash
                      </option>

                      <option value="UPI">
                        UPI
                      </option>

                      <option value="CARD">
                        Card
                      </option>
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
                    disabled={
                      watch("paymentStatus") ===
                      "PAID"
                    }
                    {...register("paidAmount")}
                    className="input-style-4"
                    placeholder="0"
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



            </div>

          </div>
          <div className="bg-white flex-[0.40] rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">

            {/* ====================================================== */}
            {/* SUMMARY CARD */}
            {/* ====================================================== */}

            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex justify-between">

              <div>
                <p className="text-sm text-gray-500">
                  Purchase Amount
                </p>

                <p className="text-2xl font-bold">
                  ₹ {(Number(totalAmount) || 0).toFixed(2)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">
                  Outstanding Amount
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
                : "Save Stock Purchase"}
            </Button>

          </div>
        </form>
      </div >
    </div >
  );
}
