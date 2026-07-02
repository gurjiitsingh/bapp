"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useForm } from "react-hook-form";

import { Search, Package2 } from "lucide-react";

import { Button } from "@/components/ui/button";


import {
  InventoryItemType,
  InventoryUnit,
} from "@/lib/types/InventoryItemType";

import { PaymentStatus } from "@/lib/types/PaymentStatus";
import { displayStock } from "@/utils/inventory/displayStock";

import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";

import { SupplierType } from "@/lib/types/SupplierType";
import { adjustInventoryStock } from "@/app/(universal)/action/inventory/adjustInventoryStock";

type PaymentMethod = "CASH" | "UPI" | "CARD";

type FormType = {
  id: string;
  supplierId?: string;
  supplierName?: string;
  type: InventoryTransactionNameType;

  direction: "IN" | "OUT";

  quantity: number;
 stockValue: number;
  transactionUnit: InventoryUnit;

  // ✅ ADD THIS
  unitCost: number;
  paymentStatus: PaymentStatus; // 
  paymentMethod?: PaymentMethod;
  paidAmount?: number;          // 
  returnReason?: string;
  note: string;
};

type Props = {
  inventoryItems: InventoryItemType[];
  supplierMap: Record<
    string,
    SupplierType[]
  >;
};


export default function SupplierInventoryrReturnForm({
  inventoryItems,
  supplierMap,
}: Props) {

//console.log("inventoryItems---------", inventoryItems)


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
    useState<InventoryItemType | null>(null);

  const linkedSuppliers =
    supplierMap[
    selectedInventory?.id || ""
    ] || [];

  const [suppliersearch, setsuppliersearch] =
    useState("");

  const [
    selectedSupplier,
    setSelectedSupplier,
  ] = useState<SupplierType | null>(null);


  const filteredsuppliers =
    linkedSuppliers.filter((supplier) =>
      supplier.companyName
        ?.toLowerCase()
        .includes(
          suppliersearch.toLowerCase()
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
      type: "SUPPLIER_RETURN",
      direction: "OUT",
      quantity: 0,
      stockValue: 0,
      unitCost: 0,
      transactionUnit: "kg",
    }
  });

  const type = watch(
    "type"
  );

  const quantity = watch("quantity");
const unitCost = watch("unitCost");
const stockValue = watch("stockValue");

const [lastEdited, setLastEdited] = useState<
  "unitCost" | "stockValue"
>("unitCost");

useEffect(() => {
  const qty = Number(quantity || 0);

  if (qty <= 0) return;

  if (lastEdited === "unitCost") {
    setValue(
      "stockValue",
      Number((qty * Number(unitCost || 0)).toFixed(2))
    );
  }

  if (lastEdited === "stockValue") {
    setValue(
      "unitCost",
      Number((Number(stockValue || 0) / qty).toFixed(4))
    );
  }
}, [
  quantity,
  unitCost,
  stockValue,
  lastEdited,
  setValue,
]);

  const transactionUnit = watch("transactionUnit");


const filteredItem = useMemo(() => {
  const keyword = search.trim().toLowerCase();

  if (!keyword) return [];

  return inventoryItems
    .filter(
      (item) =>
        item.name &&
        item.name
          .toLowerCase()
          .includes(keyword)
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

    // SALE VALIDATION

    if (!data.supplierId) {
      alert("Please select supplier");
      return;
    }

    // Quantity validation
    if (!data.quantity || Number(data.quantity) <= 0) {
      alert("Enter a valid quantity");
      return;
    }
    if (
      Number(data.quantity) >
      Number(selectedInventory.currentStock || 0)
    ) {
      alert("Not enough stock available");
      return;
    }

    // Unit price validation
    if (!data.unitCost || Number(data.unitCost) <= 0) {
      alert("Enter a valid unit price");
      return;
    }







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
  // convert quantity
  finalQuantity =
    finalQuantity *
    selectedInventory.conversionFactor;

  // convert unit cost
  finalUnitCost =
    finalUnitCost /
    selectedInventory.conversionFactor;
}



    setIsSubmitting(true);


    try {

      const result =
      await adjustInventoryStock({
  inventoryItemId: selectedInventory.id,

  supplierId: data.supplierId,

  supplierName:
    selectedSupplier?.companyName || "",

  type: "SUPPLIER_RETURN",

  direction: "OUT",

  // Internal stock values
  quantity: finalQuantity,
  unitCost: finalUnitCost,
stockValue,
  // Original values entered by user
  purchaseQuantity: originalQuantity,
  purchaseUnit: transactionUnit,
  purchaseUnitCost: originalUnitCost,
  conversionFactor:
    selectedInventory.conversionFactor,

  paymentStatus: "CREDIT",
  paidAmount: 0,
  dueAmount:
    originalQuantity *
    originalUnitCost,

  note:
    `${data.returnReason || ""} ${
      data.note || ""
    }`.trim(),

  createdBy: "admin",
});





      if (result.success) {
        let updatedStock =
          selectedInventory!.currentStock || 0;

        updatedStock -= finalQuantity;

        setSelectedInventory({
          ...selectedInventory,
          currentStock: updatedStock,
        });

        reset({
          type: "SUPPLIER_RETURN",
          direction: "OUT",
          quantity: 0,
          note: "",
          unitCost: 0,
          id: selectedInventory!.id,
        });
      } else {
        alert(result.message);
      }
      setSelectedSupplier(null);
      setsuppliersearch("");
      setSearch("");
      setSelectedInventory(null);
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }

    setIsSubmitting(false);
  }



  return (
    <div className="min-h-screen  p-4 md:p-6">
      <div className="max-w-3xl">

        {/* ===================================================== */}
        {/* HEADER */}
        {/* ===================================================== */}

        <h1 className="text-3xl font-bold text-gray-800">
          Supplier Return
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Return purchased inventory back to supplier.
        </p>

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
          {/* CUSTOMER */}
          {/* ===================================================== */}

          <div>
            <p className="text-sm text-gray-500 mb-3">
              Select supplier receiving the returned inventory
            </p>

            <div className="flex justify-between mb-3">
              <div>
                {selectedSupplier && (
                  <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    {selectedSupplier.companyName}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="btn-save-4 h-11"
              >
                {isSubmitting
                  ? "Saving..."
                  : "Return To Supplier"}
              </Button>
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
                  {/* {selectedProduct.currentStock} */}
                  {displayStock(
                    selectedInventory.currentStock || 0,
                    selectedInventory.purchaseUnit,
                    selectedInventory.consumptionUnit,
                    selectedInventory.conversionFactor
                  )}
                </div>
              </div>
            )}



            <div className="bg-white   border-gray-100  my-3">
              
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
                    filteredItem.length >
                    0 && (
                      <div className="absolute z-50 mt-2 w-full max-h-80 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">

                        {filteredItem.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setValue(
                                "transactionUnit",
                                item.purchaseUnit
                              );
                              setSelectedInventory(item);

                              setSelectedSupplier(null);
                              setsuppliersearch("");

                              setValue("supplierId", "");
                              setValue("id", item.id);

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
            </div>



            {/* Search */}

            <div className="relative">
              <Search
                size={18}
                className="absolute right-3 top-3 text-gray-400"
              />

              <input
                type="text"
                value={suppliersearch}
                onChange={(e) =>
                  setsuppliersearch(e.target.value)
                }
                placeholder="Search supplier..."
                className="input-style-4 pr-10"
              />
            </div>

            {/* List */}

            <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-gray-200">
              {filteredsuppliers.map((customer) => (
                <button
                  key={customer.id}
                  type="button"

                  onClick={() => {
                    setSelectedSupplier(customer);

                    setValue(
                      "supplierId",
                      customer.id
                    );

                    setValue(
                      "supplierName",
                      customer.companyName
                    );

                    setsuppliersearch(
                      customer.companyName
                    );
                  }}
                  className={`w-full border-b border-gray-100 px-4 py-3 text-left transition hover:bg-slate-50 ${selectedSupplier?.id === customer.id
                    ? "bg-blue-50"
                    : ""
                    }`}
                >
                  <div className="font-medium">
                    {customer.companyName}
                  </div>

                  <div className="text-xs text-gray-500">
                    {customer.phone || "No phone"}
                  </div>
                </button>
              ))}
            </div>
          </div>



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

            {/* unitCost */}
            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Unit Price
              </label>

          

<input
  type="number"
  step="0.01"
  value={unitCost || ""}
  onChange={(e) => {
    setLastEdited("unitCost");
    setValue("unitCost", Number(e.target.value || 0));
  }}
  onFocus={(e) => {
    if (e.target.value === "0") {
      e.target.value = "";
    }
  }}
  className="input-style-4"
  placeholder="Enter Price"
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
                <option value="gm">Gram (g)</option>
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


                <option value="ltr">Liter (L)</option>
                <option value="ml">Milliliter (ml)</option>
              </select>
            </div>



          </div>
          <div className="flex flex-col gap-2">
            <label className="label-style-4">
              Return Reason
            </label>

            <select
              {...register("returnReason")}
              className="input-style-4"
            >
              <option value="">
                Select reason
              </option>

              <option value="Damaged">
                Damaged
              </option>

              <option value="Expired">
                Expired
              </option>

              <option value="Wrong Item">
                Wrong Item
              </option>

              <option value="Quality Issue">
                Quality Issue
              </option>

              <option value="Over Supply">
                Over Supply
              </option>

              <option value="Other">
                Other
              </option>
            </select>
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


<div className="flex flex-col gap-2">
  <label className="label-style-4">
    Return Stock Value
  </label>

  <input
    type="number"
    step="0.01"
    value={stockValue || ""}
    onChange={(e) => {
      setLastEdited("stockValue");
      setValue("stockValue", Number(e.target.value || 0));
    }}
    className="input-style-4"
    placeholder="0.00"
  />
</div>

        </form>
      </div >
    </div >
  );
}
