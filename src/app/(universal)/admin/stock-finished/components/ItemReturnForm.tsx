
"use client";


// reason:
// - Damaged
// - Expired
// - Wrong Item
// - Quality Issue
// - Customer Changed Mind
// - Other


// condition:
// - Saleable
// - Damaged
// - Scrap

import React, { 
  useEffect,
  useMemo,
  useState,
} from "react";

import { useForm } from "react-hook-form";

import { Search, Package2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { addItemSale } from "@/app/(universal)/action/stock-finished/addItemSale";
import { WholeCustomerType  } from "@/lib/types/WholeSaleCustomerType";

import {
  InventoryItemType,
  InventoryUnit,
} from "@/lib/types/InventoryItemType";

import { PaymentStatus } from "@/lib/types/PaymentStatus";
import { displayStock } from "@/utils/inventory/displayStock";
import { ProductType } from "@/lib/types/productType";
import { InventoryTransactionNameType } from "@/lib/types/InventoryTransactionType";
import { customerReturn } from "@/app/(universal)/action/stock-finished/customerReturn";

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

  note: string;
};

type Props = {
  products: ProductType[];

  customers: WholeCustomerType[];
};;


export default function ItemReturnForm({
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
    selectedProduct,
    setselectedProduct,
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
  type: "CUSTOMER_RETURN",
  direction: "IN",
  quantity: 0,
 // unitPrice: 0,
  transactionUnit: "kg",
},
  });

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

  // =====================================================
  // SUBMIT
  // =====================================================

  async function onSubmit(data: FormType) {
    if (isSubmitting) return;

    if (!selectedProduct) {
      alert("Please select inventory item");
      return;
    }

   // SALE VALIDATION

if (!data.wholeSaleCutomerId) {
  alert("Please select customer");
  return;
}

// Quantity validation
if (!data.quantity || Number(data.quantity) <= 0) {
  alert("Enter a valid quantity");
  return;
}

// Unit price validation
if (!data.unitPrice || Number(data.unitPrice) <= 0) {
  alert("Enter a valid unit price");
  return;
}

// payment validation
if (data.paymentStatus === "PAID" && !data.paymentMethod) {
  alert("Select payment method");
  return;
}
 

   


    let finalQuantity =
      Number(data.quantity);

    let finalUnitCost =
      Number(data.unitPrice);

   

    setIsSubmitting(true);

    
    try {
      const result = await customerReturn({
        id: data.id,

        wholeSaleCutomerId: data.wholeSaleCutomerId,

        // ✅ ADD THIS
        wholeSaleCutomerName:
        selectedCustomer?.companyName || "",
        type: "RETURN",
        direction: "IN",//data.direction,
        // INTERNAL
        quantity: finalQuantity,
        unitPrice: finalUnitCost,
        transactionUnit: transactionUnit,
      //   paymentStatus: data.paymentStatus,
        paymentMethod: data.paymentMethod,
      //  paidAmount: Number(data.paidAmount || 0),
        note: data.note,
        createdBy: "admin",
      });




      if (result.success) {
        let updatedStock =
          selectedProduct.currentStock;
         setselectedProduct({
          ...selectedProduct,
          currentStock: updatedStock,
        });

        reset({
          type: "PURCHASE",
          direction: "IN",
          quantity: 0,
          note: "",
          unitPrice: 0,
          id: selectedProduct.id,
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
    <div className="min-h-screen  p-4 md:p-6">
      <div className="max-w-3xl">

        {/* ===================================================== */}
        {/* HEADER */}
        {/* ===================================================== */}

        <h1 className="text-3xl font-bold text-gray-800">
  Customer Return
</h1>

<p className="text-sm text-gray-500 mt-1">
  Receive returned items from customer.
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
    Select customer returning the items
  </p>

  <div className="flex justify-between mb-3">
    <div>
      {selectedCustomer && (
        <div className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          {selectedCustomer.companyName}
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
        : "Save Return"}
    </Button>
  </div>

  {/* Search */}

  <div className="relative">
    <Search
      size={18}
      className="absolute right-3 top-3 text-gray-400"
    />

    <input
      type="text"
      value={customerSearch}
      onChange={(e) =>
        setCustomerSearch(e.target.value)
      }
      placeholder="Search customer..."
      className="input-style-4 pr-10"
    />
  </div>

  {/* List */}

  <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-gray-200">
    {filteredCustomers.map((customer) => (
      <button
        key={customer.id}
        type="button"
        onClick={() => {
          setSelectedCustomer(customer);
          setValue(
            "wholeSaleCutomerId",
            customer.id
          );
          setCustomerSearch(
            customer.companyName
          );
        }}
        className={`w-full border-b border-gray-100 px-4 py-3 text-left transition hover:bg-slate-50 ${
          selectedCustomer?.id === customer.id
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

                  <p className="text-sm text-gray-500">
                    Current Stock
                  </p>
                </div>
              </div>

              <div className="text-2xl font-bold text-blue-700">
                {selectedProduct.currentStock}
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

          {/* Customer Selection */}
          <div className="bg-white   border-gray-100  ">
            <div className="flex items-center justify-between mb-4">
              <div>
                {/* <h2 className="text-lg font-semibold text-gray-800">
                  Wholesale Customer
                </h2> */}

             
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
          </div>

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

    {/* unitPrice */}
  <div className="flex flex-col gap-2">
    <label className="label-style-4">
      Unit Price
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

     

          
        </form>
      </div >
    </div >
  );
}
