
"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Search,
  RotateCcw,
  Loader2,
} from "lucide-react";

import { VehicleType } from "@/lib/types/distribution/VehicleType";
import { StockLocationType } from "@/lib/types/distribution/StockLocationType";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";

import { returnVehicleStock } from "@/app/(universal)/action/distribution/returnStock/returnVehicleStock";
import { getActiveVehicleTripAction } from "@/app/(universal)/action/distribution/returnStock/getActiveVehicleTripAction";
import { WholeCustomerType } from "@/lib/types/WholeSaleCustomerType";
import Link from "next/link";

// =====================================================
// TYPES
// =====================================================

type ReturnType =
  | "SPOILED"
  | "DAMAGED"
  | "UNSOLD_RETURN"
  | "CUSTOMER_RETURN";

type VehicleStockReturnForm = {
  vehicleId: string;
  wholeSaleCutomerId?: string;
  wholeSaleCutomerName?: string;
  returnType: ReturnType;

  reason: string;

  remarks: string;

  items: {
    productId: string;
    quantity: number;
  }[];
};

type Props = {
  vehicles: VehicleType[];

  // Used only as the product list / price source.
  // We DO NOT use its quantity to restrict returns.
  factoryStock: StockLocationType[];
  customers: WholeCustomerType[];
};

// =====================================================
// COMPONENT
// =====================================================

export default function TruckStockReturn({
  vehicles,
  factoryStock,
  customers,
}: Props) {


  const [highlightIndex, setHighlightIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev < filteredCustomers.length - 1 ? prev + 1 : prev
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredCustomers[highlightIndex];
      if (selected) {
        form.setValue("wholeSaleCutomerId", selected.id);
        form.setValue("wholeSaleCutomerName", selected.companyName);
        setCustomerSearch(selected.companyName);
        setShowDropdown(false);
      }
    }
  };

  const [customerSearch, setCustomerSearch] = useState("");

  const form =
    useForm<VehicleStockReturnForm>({
      defaultValues: {
        vehicleId: "",

        returnType:
          "CUSTOMER_RETURN",

        reason: "",

        remarks: "",

        items: [],
      },
    });

  // ===================================================
  // STATE
  // ===================================================

  const [submitting, setSubmitting] =
    useState(false);

  const [search, setSearch] =
    useState("");

  // ===================================================
  // WATCH
  // ===================================================

  const vehicleId =
    form.watch("vehicleId");

  const returnType =
    form.watch("returnType");

  const items =
    form.watch("items");

  // ===================================================
  // SELECTED VEHICLE
  // ===================================================

  const selectedVehicle =
    vehicles.find(
      (vehicle) =>
        vehicle.id === vehicleId
    );

  // ===================================================
  // INITIALIZE PRODUCT ITEMS
  // ===================================================
  //
  // IMPORTANT:
  //
  // factoryStock is ONLY being used as a product
  // source so we can display:
  //
  // Product
  // Wholesale Price
  // Return Qty
  //
  // factoryStock.quantity is NOT used.
  //
  // ===================================================

  useEffect(() => {
    form.setValue(
      "items",
      factoryStock.map(
        (item) => ({
          productId:
            item.productId,

          quantity: 0,
        })
      )
    );
  }, [
    factoryStock,
    form,
  ]);

  // ===================================================
  // FILTER PRODUCTS
  // ===================================================

  const filteredProducts =
    useMemo(() => {
      const value =
        search
          .trim()
          .toLowerCase();

      if (!value) {
        return factoryStock;
      }

      return factoryStock.filter(
        (item) =>
          item.productName
            ?.toLowerCase()
            .includes(value)
      );
    }, [
      search,
      factoryStock,
    ]);

  // ===================================================
  // TOTAL RETURN QUANTITY
  // ===================================================

  const totalReturnQuantity =
    items.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.quantity || 0
        ),
      0
    );

  // ===================================================
  // TOTAL RETURN VALUE
  // ===================================================

  const totalReturnValue =
    items.reduce(
      (
        sum,
        formItem
      ) => {
        const product =
          factoryStock.find(
            (item) =>
              item.productId ===
              formItem.productId
          );

        if (!product) {
          return sum;
        }

        return (
          sum +
          Number(
            formItem.quantity || 0
          ) *
          Number(
            product.wholesalePrice ||
            0
          )
        );
      },
      0
    );

  // ===================================================
  // RETURN TYPE LABEL
  // ===================================================

  const returnTypeLabel =
    useMemo(() => {
      switch (returnType) {
        case "SPOILED":
          return "Spoiled";

        case "DAMAGED":
          return "Damaged";

        case "UNSOLD_RETURN":
          return "Unsold Return";

        case "CUSTOMER_RETURN":
          return "Customer Return";

        default:
          return "Return";
      }
    }, [
      returnType,
    ]);

  // ===================================================
  // SUBMIT
  // ===================================================

  const onSubmit =
    async (
      data: VehicleStockReturnForm
    ) => {
      try {
        setSubmitting(true);

        // =============================================
        // VEHICLE
        // =============================================

        if (!data.vehicleId) {
          toast.error(
            "Please select a vehicle."
          );

          return;
        }

        // =============================================
        // VEHICLE VALIDATION
        // =============================================

        if (!selectedVehicle) {
          toast.error(
            "Selected vehicle not found."
          );

          return;
        }


        // =============================================
        // CUSTOMER
        // =============================================

        if (data.returnType === "CUSTOMER_RETURN") {
          if (
            !data.wholeSaleCutomerId ||
            !data.wholeSaleCutomerName
          ) {
            toast.error(
              "Please select a wholesale customer."
            );

            return;
          }
        }

        // =============================================
        // ITEMS
        // =============================================

        const selectedItems =
          data.items.filter(
            (item) =>
              Number(
                item.quantity || 0
              ) > 0
          );

        if (
          selectedItems.length === 0
        ) {
          toast.error(
            "Please enter at least one return quantity."
          );

          return;
        }

        // =============================================
        // VALIDATE QUANTITIES
        // =============================================
        //
        // IMPORTANT:
        //
        // There is NO truck stock check.
        //
        // There is NO maximum quantity.
        //
        // Customer can return any quantity entered
        // by the salesman.
        //
        // =============================================

        for (
          const selectedItem of selectedItems
        ) {
          const quantity =
            Number(
              selectedItem.quantity
            );

          if (
            !Number.isFinite(
              quantity
            ) ||
            quantity <= 0
          ) {
            const product =
              factoryStock.find(
                (item) =>
                  item.productId ===
                  selectedItem.productId
              );

            toast.error(
              `${product?.productName ||
              "Product"
              }: invalid return quantity.`
            );

            return;
          }
        }

        // =============================================
        // TRIP
        // =============================================
        //
        // Your returnVehicleStock action requires
        // tripId and tripNo.
        //
        // If these are not part of VehicleType yet,
        // fetch the active trip separately.
        //
        // =============================================

        // =============================================
        // RECOVER ACTIVE TRIP
        // =============================================

        const tripResult =
          await getActiveVehicleTripAction(
            data.vehicleId
          );

        if (!tripResult.success) {
          toast.error(
            tripResult.message
          );

          return;
        }

        const tripId =
          tripResult.tripId;

        const tripNo =
          tripResult.tripNo;

        if (!tripId || !tripNo) {
          toast.error(
            "Active trip information is incomplete."
          );

          return;
        }


        const salesmanId =
          tripResult.salesmanId;

        const salesmanName =
          tripResult.salesmanName;

        if (!salesmanId) {
          toast.error(
            "Salesman not found on active trip."
          );

          return;
        }

        if (!salesmanName) {
          toast.error(
            "Salesman name not found on active trip."
          );

          return;
        }





        // =============================================
        // RETURN EACH ITEM
        // =============================================

        for (
          const selectedItem of selectedItems
        ) {
          const product =
            factoryStock.find(
              (item) =>
                item.productId ===
                selectedItem.productId
            );

          if (!product) {
            toast.error(
              "Product not found."
            );

            return;
          }

          const quantity =
            Number(
              selectedItem.quantity
            );

          const result =
            await returnVehicleStock({
              // =========================================
              // TRIP
              // =========================================

              tripId,

              tripNo,

              // =========================================
              // VEHICLE
              // =========================================

              vehicleId:
                data.vehicleId,

              vehicleName:
                selectedVehicle.name,

              locationCode:
                selectedVehicle.locationCode,

              // =========================================
              // SALESMAN
              // =========================================

              salesmanId,

              salesmanName,

              // =========================================
              // CUSTOMER
              // =========================================

              customerId:
                data.wholeSaleCutomerId,

              customerName:
                data.wholeSaleCutomerName,

              // =========================================
              // PRODUCT
              // =========================================

              productId:
                product.productId,

              productName:
                product.productName,

              quantity,

              // =========================================
              // PRICE
              // =========================================

              wholesalePrice:
                Number(
                  product.wholesalePrice ||
                  0
                ),

              sellingPrice:
                Number(
                  product.sellingPrice ||
                  0
                ),

              costPrice:
                Number(
                  product.costPrice ||
                  0
                ),

              avgCost:
                Number(
                  product.avgCost ||
                  0
                ),

              // =========================================
              // RETURN
              // =========================================

              returnType:
                data.returnType,

              reason:
                data.reason,

              remarks:
                data.remarks,

              // =========================================
              // META
              // =========================================

              createdBy:
                "ADMIN",
            });

          if (!result.success) {
            toast.error(
              result.message
            );

            return;
          }
        }

        // =============================================
        // SUCCESS
        // =============================================

        toast.success(
          `${returnTypeLabel} recorded successfully.`
        );

        // =============================================
        // RESET
        // =============================================

        form.reset({
          vehicleId:
            data.vehicleId,

          returnType:
            data.returnType,

          reason: "",

          remarks: "",

          items:
            factoryStock.map(
              (item) => ({
                productId:
                  item.productId,

                quantity: 0,
              })
            ),
        });

        setSearch("");

      } catch (error) {
        console.error(
          "Return submit error:",
          error
        );

        toast.error(
          "Failed to record return."
        );
      } finally {
        setSubmitting(false);
      }
    };



  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;

    return customers.filter((customer) =>
      customer.companyName
        ?.toLowerCase()
        .includes(customerSearch.toLowerCase())
    );
  }, [customerSearch, customers]);



  // ===================================================
  // RENDER
  // ===================================================

  return (
    <form
      onSubmit={form.handleSubmit(
        onSubmit
      )}
    >
      <div className="min-h-screen w-full">

        <div className="w-full space-y-4">

          {/* =========================================
              HEADER
          ========================================= */}

          <div className="rounded-xl border border-gray-100 bg-white px-2 shadow-sm">

            <div className="flex flex-wrap items-center justify-between ">
              <div className="flex flex-wrap items-end gap-4 pb-4">
                {/* =====================================
                  VEHICLE
              ===================================== */}

                <div className="flex flex-col">

                  <label className="mb-1 text-xs text-gray-500">
                    Vehicle
                  </label>

                  <Controller
                    control={
                      form.control
                    }
                    name="vehicleId"
                    render={({
                      field,
                    }) => (
                      <Select
                        value={
                          field.value
                        }
                        onValueChange={
                          field.onChange
                        }
                      >
                        <SelectTrigger className="h-9 w-44 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>

                        <SelectContent>

                          {vehicles.map(
                            (
                              vehicle
                            ) => (
                              <SelectItem
                                key={
                                  vehicle.id
                                }
                                value={
                                  vehicle.id
                                }
                              >
                                {
                                  vehicle.name
                                }
                              </SelectItem>
                            )
                          )}

                        </SelectContent>
                      </Select>
                    )}
                  />

                </div>

                {/* =====================================
                  SALESMAN
              ===================================== */}

                <div className="flex flex-col">

                  <label className="mb-1 text-xs text-gray-500">
                    Salesman
                  </label>

                  <Input
                    value={
                      selectedVehicle
                        ?.responsiblePersonName ??
                      ""
                    }
                    disabled
                    className="h-9 w-40 bg-gray-100 text-sm"
                  />

                </div>

                {/* Customer */}
                <div className="relative w-56">

                  {/* INPUT */}
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute right-2 top-2.5 text-gray-400"
                    />

                    <input
                      type="text"
                      value={customerSearch}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setShowDropdown(true);
                        setHighlightIndex(0);
                      }}
                      onFocus={() => setShowDropdown(true)}
                      onKeyDown={handleKeyDown}
                      placeholder="Search"
                      className="h-9 w-full border border-gray-300 rounded px-2 pr-6 text-sm"
                    />
                  </div>

                  {/* DROPDOWN */}
                  {showDropdown && (
                    <div className="absolute top-full mt-1 w-full max-h-44 overflow-y-auto border bg-white shadow-sm z-50 rounded">

                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer, index) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() => {
                              form.setValue("wholeSaleCutomerId", customer.id);
                              form.setValue("wholeSaleCutomerName", customer.companyName);
                              setCustomerSearch(customer.companyName);
                              setShowDropdown(false);
                            }}
                            className={`w-full text-left px-2 py-2 text-sm ${index === highlightIndex
                              ? "bg-blue-100"
                              : "hover:bg-gray-100"
                              }`}
                          >
                            <div className="font-medium truncate">
                              {customer.companyName}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-2 text-xs text-gray-400 text-center">
                          No customer
                        </div>
                      )}

                    </div>
                  )}
                </div>

                {/* =====================================
                  RETURN TYPE
              ===================================== */}

                <div className="flex flex-col">

                  <label className="mb-1 text-xs text-gray-500">
                    Return Type
                  </label>

                  <Controller
                    control={
                      form.control
                    }
                    name="returnType"
                    render={({
                      field,
                    }) => (
                      <Select
                        value={
                          field.value
                        }
                        onValueChange={
                          field.onChange
                        }
                      >

                        <SelectTrigger className="h-9 w-44 text-sm">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>

                          <SelectItem value="CUSTOMER_RETURN">
                            Customer Return
                          </SelectItem>

                          <SelectItem value="SPOILED">
                            Spoiled
                          </SelectItem>

                          <SelectItem value="DAMAGED">
                            Damaged
                          </SelectItem>

                          <SelectItem value="UNSOLD_RETURN">
                            Unsold Return
                          </SelectItem>

                        </SelectContent>

                      </Select>
                    )}
                  />

                </div>

                {/* =====================================
                  TOTAL RETURN QTY
              ===================================== */}

                {/* <div className="flex flex-col">

                <label className="mb-1 text-xs text-gray-500">
                  Return Qty
                </label>

                <Input
                  value={
                    totalReturnQuantity
                  }
                  readOnly
                  className="h-9 w-28 bg-gray-100 text-sm"
                />

              </div> */}

                {/* =====================================
                  TOTAL RETURN VALUE
              ===================================== */}

                <div className="flex flex-col">

                  <label className="mb-1 text-xs text-gray-500">
                    Return Value
                  </label>

                  <Input
                    value={
                      totalReturnValue.toFixed(
                        2
                      )
                    }
                    readOnly
                    className="h-9 w-32 bg-gray-100 text-sm"
                  />

                </div>

                {/* =====================================
                  SEARCH
              ===================================== */}

                {/* <div className="relative flex flex-col">

                <label className="mb-1 text-xs text-gray-500">
                  Search Product
                </label>

                <Search
                  size={14}
                  className="absolute right-2 top-[29px] text-gray-400"
                />

                <Input
                  value={
                    search
                  }
                  onChange={(
                    e
                  ) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search"
                  className="h-9 w-48 pr-7 text-sm"
                />

              </div> */}

                {/* =====================================
                  SAVE
              ===================================== */}

                <Button
                  type="submit"
                  size="lg"
                  disabled={
                    submitting ||
                    !vehicleId ||
                    totalReturnQuantity <=
                    0
                  }
                  className="h-9 w-[220px] bg-red-600 text-slate-100 hover:bg-red-700"
                >

                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />

                      Processing...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />

                      Save Return
                    </>
                  )}

                </Button>
              </div>

              <div>
                <Link
                  href={`/admin/distribution/truckdelivery-return/`}
                >
                  <Button
                    className="
      bg-red-600
        inline-flex
        items-center
        gap-2
        rounded-lg
        px-5
        py-2.5
        font-semibold
        shadow-sm
        text-white
      "
                  >

                    All Returns
                  </Button>
                </Link>
              </div>
            </div>

          </div>

          {/* =========================================
              REASON / REMARKS
          ========================================= */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* REASON */}

            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">

              <label className="mb-2 block text-xs font-medium text-gray-500">
                Reason
              </label>

              <Textarea
                {...form.register(
                  "reason"
                )}
                placeholder={
                  returnType ===
                    "SPOILED"
                    ? "Example: Product spoiled during delivery..."
                    : returnType ===
                      "DAMAGED"
                      ? "Example: Product damaged during transport..."
                      : returnType ===
                        "CUSTOMER_RETURN"
                        ? "Example: Customer returned product..."
                        : "Enter return reason..."
                }
                className="min-h-[80px] resize-none text-sm"
              />

            </div>

            {/* REMARKS */}

            <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">

              <label className="mb-2 block text-xs font-medium text-gray-500">
                Remarks
              </label>

              <Textarea
                {...form.register(
                  "remarks"
                )}
                placeholder="Additional remarks..."
                className="min-h-[80px] resize-none text-sm"
              />

            </div>

          </div>

          {/* =========================================
              PRODUCTS
          ========================================= */}

          <div className="rounded-xl border border-gray-100 bg-white shadow-sm">

            <div className="overflow-hidden rounded-xl">

              <table className="w-full">

                <thead className="bg-zinc-200">

                  <tr>

                    <th className="p-3 text-left">
                      Product
                    </th>

                    <th className="p-3 text-center">
                      Wholesale Price
                    </th>

                    <th className="p-3 text-center">
                      Return Qty
                    </th>

                    <th className="p-3 text-center">
                      Return Value
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredProducts.map(
                    (
                      item,
                      productIndex
                    ) => {

                      const index =
                        factoryStock.findIndex(
                          (
                            product
                          ) =>
                            product.productId ===
                            item.productId
                        );

                      const qty =
                        Number(
                          form.watch(
                            `items.${index}.quantity`
                          ) || 0
                        );

                      const returnValue =
                        qty *
                        Number(
                          item.wholesalePrice ||
                          0
                        );

                      return (
                        <tr
                          key={
                            item.productId
                          }
                          className={`
                            ${qty > 0
                              ? "bg-red-50"
                              : productIndex %
                                2 ===
                                0
                                ? "bg-zinc-50"
                                : "bg-zinc-100"
                            }
                            hover:bg-blue-50
                          `}
                        >

                          {/* PRODUCT */}

                          <td className="p-3 font-medium">
                            {
                              item.productName
                            }
                          </td>

                          {/* WHOLESALE PRICE */}

                          <td className="p-3 text-center font-medium">
                            ₹
                            {Number(
                              item.wholesalePrice ||
                              0
                            ).toFixed(
                              2
                            )}
                          </td>

                          {/* RETURN QTY */}

                          <td className="p-2">

                            <Input
                              type="number"
                              min={0}
                              step="1"

                              // IMPORTANT:
                              // NO max attribute.
                              //
                              // Return quantity is NOT
                              // restricted by truck stock.
                              //
                              {...form.register(
                                `items.${index}.quantity`,
                                {
                                  valueAsNumber:
                                    true,

                                  min: 0,
                                }
                              )}

                              onFocus={(
                                e
                              ) => {
                                if (
                                  e.target
                                    .value ===
                                  "0"
                                ) {
                                  e.target.value =
                                    "";
                                }
                              }}

                              className="mx-auto h-9 w-28 text-center"
                            />

                          </td>

                          {/* RETURN VALUE */}

                          <td className="p-3 text-center font-semibold">

                            ₹
                            {returnValue.toFixed(
                              2
                            )}

                          </td>

                        </tr>
                      );
                    }
                  )}

                  {/* NO PRODUCTS */}

                  {filteredProducts.length ===
                    0 && (
                      <tr>

                        <td
                          colSpan={4}
                          className="py-10 text-center text-gray-500"
                        >
                          No products found.
                        </td>

                      </tr>
                    )}

                </tbody>

              </table>

            </div>

          </div>

          {/* =========================================
              SUMMARY
          ========================================= */}

          <Card className="rounded-3xl border border-gray-100 bg-white shadow-sm">

            <CardContent className="p-6">

              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                {/* LEFT */}

                <div className="space-y-1 text-sm">

                  <p>
                    Products :
                    <strong>
                      {" "}
                      {
                        factoryStock.length
                      }
                    </strong>
                  </p>

                  <p>
                    Selected Return Qty :
                    <strong className="text-red-600">
                      {" "}
                      {
                        totalReturnQuantity
                      }
                    </strong>
                  </p>

                </div>

                {/* RIGHT */}

                <div className="rounded-xl bg-gray-50 px-6 py-4 text-right">

                  <div className="text-xs text-gray-500">
                    {
                      returnTypeLabel
                    }{" "}
                    Value
                  </div>

                  <div className="text-2xl font-bold text-gray-800">

                    ₹
                    {totalReturnValue.toFixed(
                      2
                    )}

                  </div>

                </div>

              </div>

            </CardContent>

          </Card>

        </div>

      </div>
    </form>
  );
}

