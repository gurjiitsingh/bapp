
"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";

import { useForm } from "react-hook-form";

import { Search, Package2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { SupplierType } from "@/lib/types/SupplierType";

import {
  InventoryItemType,
  InventoryUnit,
} from "@/lib/types/InventoryItemType";
import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";
import { PaymentStatus } from "@/lib/types/PaymentStatus";
import { displayStock } from "@/utils/inventory/displayStock";
import { purchaseStock } from "@/app/(universal)/action/inventory/purchaseStock";
import { PaymentMethodType } from "@/lib/types/distribution/PaymentMethodType";
import Link from "next/link";





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
  paymentMethod?: PaymentMethodType;
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


  const [inventoryFilter, setInventoryFilter] = useState("");

  const linkedSuppliers = supplierMap[selectedInventory?.id || ""] || [];
  const inventorySearchRef = useRef<HTMLInputElement>(null);
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

      transactionUnit: "gm",

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

  const transactionUnit = watch("transactionUnit", "gm");

  const paymentStatus = watch("paymentStatus", "PAID");
  const [activeIndex, setActiveIndex] = useState(0);
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

  const selectInventoryItem = (
    item: typeof inventoryItems[number]
  ) => {
    setSelectedInventory(item);

    setValue("inventoryItemId", item.id);

    setValue(
      "transactionUnit",
      item.purchaseMappings?.[0]?.purchaseUnit ??
      item.consumptionUnit
    );

    // Inventory search
    setSearch(item.name);
    setInventoryFilter("");
    setActiveIndex(0);

    // CLEAR PREVIOUS SUPPLIER
    setValue("supplierId", "", {
      shouldDirty: true,
      shouldValidate: true,
    });

    setSupplierSearch("");
    setActiveSupplierIndex(0);
  };

  // =====================================
  // SUPPLIER SELECTION
  // =====================================

  const supplierSearchRef = useRef<HTMLInputElement>(null);

  const [supplierSearch, setSupplierSearch] = useState("");

  const [activeSupplierIndex, setActiveSupplierIndex] =
    useState(0);

  const selectedSupplierId = watch("supplierId");

  const filteredSuppliers = linkedSuppliers.filter((supplier) =>
    supplier.companyName
      ?.toLowerCase()
      .includes(supplierSearch.toLowerCase().trim())
  );
  // =====================================================
  // FILTER INVENTORY
  // =====================================================


  const filteredInventory = useMemo(() => {
    const query = inventoryFilter.trim().toLowerCase();

    return [...inventoryItems]
      .filter((item) => {
        if (!query) return true;
        return item.name?.toLowerCase().startsWith(query);
      })
      .sort((a, b) =>
        (a.name || "").localeCompare(
          b.name || "",
          undefined,
          { sensitivity: "base" }
        )
      );
  }, [inventoryFilter, inventoryItems]);

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
    const mapping =
      selectedInventory.purchaseMappings.find(
        (m) =>
          m.purchaseUnit ===
          data.transactionUnit
      );

    if (mapping) {
      finalQuantity =
        finalQuantity * mapping.factor;

      finalUnitCost =
        finalUnitCost / mapping.factor;
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
      const result = await purchaseStock({
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
        purchaseQuantity: originalQuantity || 0,

        purchaseUnit: data.transactionUnit || "kg",

        purchaseUnitCost: originalUnitCost || 1,

        conversionFactor:
          mapping?.factor || 1,

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

          // Clear supplier after successful purchase
          supplierId: "",

          quantity: 0,

          transactionUnit:
            selectedInventory.purchaseMappings?.[0]?.purchaseUnit ??
            selectedInventory.consumptionUnit,

          unitCost: 0,
          totalAmount: 0,

          paymentStatus: "PAID",
          paymentMethod: "CASH",
          paidAmount: 0,

          note: "",
        });

        // Clear supplier search after submission
        setSupplierSearch("");
        setActiveSupplierIndex(0);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }

    setIsSubmitting(false);
  }

  // useEffect(() => {
  //   const qty = Number(quantity || 0);
  //   const rate = Number(unitCost || 0);

  //   if (qty > 0 && rate > 0) {
  //     setValue(
  //       "totalAmount",
  //       Number((qty * rate).toFixed(2))
  //     );
  //   }
  // }, [quantity, unitCost, setValue]);

  const [pricingMode, setPricingMode] = useState<
    "RATE" | "AMOUNT"
  >("RATE");


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F1") {
        e.preventDefault();

        inventorySearchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleFieldNavigation = (
    e: React.KeyboardEvent<HTMLElement>
  ) => {
    const target = e.target as HTMLElement;

    // F2 → Focus Inventory Item
    if (e.key === "F2") {
      e.preventDefault();
      inventorySearchRef.current?.focus();
      return;
    }

    // F3 → Save Record
    if (e.key === "F3") {
      e.preventDefault();

      const form = target.closest("form");

      if (form) {
        form.requestSubmit();
      }

      return;
    }

    // Do not interfere with inventory dropdown navigation
    if (target === inventorySearchRef.current) {
      return;
    }

    if (
      !["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Enter"].includes(e.key)
    ) {
      return;
    }

    // Allow normal selection inside textarea
    if (target.tagName === "TEXTAREA") return;

    e.preventDefault();

    const form = target.closest("form");

    if (!form) return;

    const fields = Array.from(
      form.querySelectorAll<HTMLElement>(
        'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button[type="submit"]:not([disabled])'
      )
    ).filter((el) => {
      return el.offsetWidth > 0 && el.offsetHeight > 0;
    });

    const currentIndex = fields.indexOf(target);

    if (currentIndex === -1) return;

    const current = target.getBoundingClientRect();

    let nextIndex = -1;

    if (e.key === "ArrowRight" || e.key === "Enter") {
      nextIndex = currentIndex + 1;
    }

    if (e.key === "ArrowLeft") {
      nextIndex = currentIndex - 1;
    }

    if (e.key === "ArrowDown") {
      const candidates = fields
        .map((field, index) => ({
          index,
          rect: field.getBoundingClientRect(),
        }))
        .filter(({ rect, index }) => {
          return (
            index !== currentIndex &&
            rect.top > current.top + 5 &&
            rect.left < current.right &&
            rect.right > current.left
          );
        })
        .sort((a, b) => a.rect.top - b.rect.top);

      nextIndex = candidates[0]?.index ?? -1;
    }

    if (e.key === "ArrowUp") {
      const candidates = fields
        .map((field, index) => ({
          index,
          rect: field.getBoundingClientRect(),
        }))
        .filter(({ rect, index }) => {
          return (
            index !== currentIndex &&
            rect.bottom < current.top - 5 &&
            rect.left < current.right &&
            rect.right > current.left
          );
        })
        .sort((a, b) => b.rect.bottom - a.rect.bottom);

      nextIndex = candidates[0]?.index ?? -1;
    }

    if (nextIndex >= 0 && nextIndex < fields.length) {
      fields[nextIndex].focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6 w-full  ">
      <div className="w-full">

        {/* ===================================================== */}
        {/* HEADER */}
        {/* ===================================================== */}


        <div className="mb-1  ">
          <div className="flex justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              Purchase
            </h1>
            <Link href={"/admin/inventory/purchase/add-1"}>Classic</Link>
          </div>
        </div>

        {/* ===================================================== */}
        {/* FORM */}
        {/* ===================================================== */}


        <form
          onSubmit={handleSubmit(onSubmit)}
          onKeyDown={handleFieldNavigation}
          className="flex flex-col gap-1 w-full"
        >

          <div className="flex flex-col xl:flex-row gap-1 w-full">

            {/* ===================================================== */}
            {/* INVENTORY SEARCH */}
            {/* ===================================================== */}

            <div className="flex flex-col gap-2 w-[270px]">
              <label className="label-style-4">
                Inventory Item
                <span className="ml-1 font-bold text-red-500">
                  (F1)</span>
              </label>

              <div className="relative">

                {/* {!search.trim() && (
                    <Search
                      size={28}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                  )} */}

                <input
                  ref={inventorySearchRef}
                  type="text"
                  value={search}
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  onFocus={() => {
                    setActiveIndex(0);
                  }}
                  onClick={() => {
                    // Clear selected item name on second click
                    if (selectedInventory && search === selectedInventory.name) {
                      setSearch("");
                      setInventoryFilter("");
                      setSelectedInventory(null);
                      setValue("inventoryItemId", "");
                      setActiveIndex(0);
                    }
                  }}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSearch(value);
                    setInventoryFilter(value);
                    setSelectedInventory(null);
                    setValue("inventoryItemId", "");
                    setActiveIndex(0);
                  }}
                  onKeyDown={(e) => {
                    if (filteredInventory.length === 0) return;

                    if (e.key === "ArrowDown") {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveIndex((prev) =>
                        Math.min(prev + 1, filteredInventory.length - 1)
                      );
                    }

                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveIndex((prev) => Math.max(prev - 1, 0));
                    }

                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.stopPropagation();

                      const item = filteredInventory[activeIndex];
                      if (item) selectInventoryItem(item);
                    }
                  }}
                  placeholder="Select or search inventory item..."
                  className={`input-style-4 pr-4 ${!search.trim() ? "pl-12" : "pl-4"
                    }`}
                />

                {/* DROPDOWN */}

                {/* ALWAYS VISIBLE INVENTORY LIST */}
                <div className="mt-2 w-full h-[64vh] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => selectInventoryItem(item)}
                        className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 ${activeIndex === index
                          ? "bg-red-50 border-l-4 border-l-red-600"
                          : "hover:bg-gray-50"
                          }`}
                      >
                        <div className="font-medium text-gray-800">
                          {item.name}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      No inventory items found.
                    </div>
                  )}
                </div>
              </div>


            </div>

            {/* ===================================== */}
            {/* SUPPLIER SELECTION */}
            {/* ===================================== */}
            <div>
              {type === "PURCHASE" && (
                <div className="flex flex-col gap-2 w-[200px]">

                  <label className="label-style-4">
                    Supplier
                  </label>

                  {/* SEARCH INPUT */}

                  <input
                    ref={supplierSearchRef}
                    type="text"
                    value={supplierSearch}
                    spellCheck={false}
                    placeholder="Search supplier..."
                    className="input-style-4 px-3"
                    onChange={(e) => {
                      setSupplierSearch(e.target.value);
                      setActiveSupplierIndex(0);

                      // A new search requires a new selection
                      setValue("supplierId", "", {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (filteredSuppliers.length === 0) return;

                      if (e.key === "ArrowDown") {
                        e.preventDefault();

                        setActiveSupplierIndex((prev) =>
                          Math.min(
                            prev + 1,
                            filteredSuppliers.length - 1
                          )
                        );
                      }

                      if (e.key === "ArrowUp") {
                        e.preventDefault();

                        setActiveSupplierIndex((prev) =>
                          Math.max(prev - 1, 0)
                        );
                      }

                      if (e.key === "Enter") {
                        e.preventDefault();

                        const supplier =
                          filteredSuppliers[activeSupplierIndex];

                        if (supplier) {
                          setValue("supplierId", supplier.id, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                          setSupplierSearch("");
                          //    setSupplierSearch(supplier.companyName);
                        }
                      }
                    }}
                  />

                  {/* ALWAYS VISIBLE SUPPLIER LIST */}

                  <div className="w-full h-[64vh] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm">

                    {!selectedInventory ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Select an inventory item first.
                      </div>
                    ) : filteredSuppliers.length > 0 ? (
                      filteredSuppliers.map((supplier, index) => {

                        const isSelected =
                          selectedSupplierId === supplier.id;

                        return (
                          <button
                            key={supplier.id}
                            type="button"
                            onMouseEnter={() =>
                              setActiveSupplierIndex(index)
                            }
                            onClick={() => {
                              setValue("supplierId", supplier.id, {
                                shouldDirty: true,
                                shouldValidate: true,

                              });





                              setSupplierSearch(supplier.companyName);
                            }}
                            className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 transition-colors ${isSelected
                              ? "bg-green-50 border-l-4 border-l-green-600"
                              : activeSupplierIndex === index
                                ? "bg-red-50 border-l-4 border-l-red-600"
                                : "hover:bg-gray-50"
                              }`}
                          >
                            <div className="flex items-center justify-between">

                              <span className="font-medium text-gray-800">
                                {supplier.companyName}
                              </span>

                              {isSelected && (
                                <span className="text-xs font-semibold text-green-700">
                                  Selected
                                </span>
                              )}

                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No suppliers found for this inventory item.
                      </div>
                    )}

                  </div>

                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className=" flex-full    flex flex-col gap-2">


                {/* ===================================================== */}
                {/* TYPE */}
                {/* ===================================================== */}

                <div className="grid grid-cols-1 md:grid-cols-5 gap-5">





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


                  {/* ===================================================== */}
                  {/* SAVE */}
                  {/* ===================================================== */}
                  <div className="flex flex-col gap-1">
                    <label className="label-style-4">
                      Save
                      <span className="ml-1 font-bold text-red-500 ">
                        (F3)</span>
                    </label>

                    <Button
                      type="submit"
                      disabled={
                        isSubmitting
                      }
                      className="btn-save-4 h-10"
                    >
                      {isSubmitting
                        ? "Saving..."
                        : "Save Stock Purchase"}
                    </Button>
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
                      {selectedInventory?.purchaseMappings?.map((mapping) => (
                        <option
                          key={mapping.purchaseUnit}
                          value={mapping.purchaseUnit}
                        >
                          {mapping.purchaseUnit}
                        </option>
                      ))}

                      {!(
                        selectedInventory?.purchaseMappings?.some(
                          (m) => m.purchaseUnit === selectedInventory.consumptionUnit
                        )

                      ) && (
                          <option
                            value={selectedInventory?.consumptionUnit}
                          >
                            {selectedInventory?.consumptionUnit}
                          </option>
                        )}
                    </select>
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


                {/* ===================================================== */}
                {/* QUANTITY */}
                {/* ===================================================== */}

                <div className="rounded-2xl border border-gray-200 p-3 space-y-0">



                  {/* ====================================================== */}
                  {/* PURCHASE DETAILS */}
                  {/* ====================================================== */}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">



                  </div>

                  {/* ====================================================== */}
                  {/* PAYMENT */}
                  {/* ====================================================== */}



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

                <h3 className="font-semibold text-lg">
                  Purchase Details
                </h3>

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
                      <div className="text-2xl font-bold text-blue-700">
                        {displayStock(
                          selectedInventory.currentStock!,
                          selectedInventory.purchaseMappings?.[0]?.purchaseUnit ??
                          selectedInventory.consumptionUnit,
                          selectedInventory.consumptionUnit,
                          selectedInventory.purchaseMappings?.[0]?.factor ?? 1
                        )}
                      </div>
                    </div>
                  </div>
                )}

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



              </div>
            </div>

          </div>


        </form>
      </div>



    </div >
  );
}
