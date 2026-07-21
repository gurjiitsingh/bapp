"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Search, Truck } from "lucide-react";

import { unloadVehicle } from "@/app/(universal)/action/distribution/unloadVehicle";
import { getStockLocationsAll } from "@/app/(universal)/action/distribution/getStockLocationsAll";

import { VehicleType } from "@/lib/types/distribution/VehicleType";


import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { WholeCustomerType } from "@/lib/types/WholeSaleCustomerType";
import { deiveryTruckSale } from "@/app/(universal)/action/distribution/sale/deleliveryTruckSale";
import { bulkSale } from "@/app/(universal)/action/distribution/sale/bulkSale/bulkSale";
import { ProductStock, ProductStockType } from "@/lib/types/productStockType";

type TruckDeliverySaleType = {
  vehicleId: string;
  vehicleName: string;

  wholeSaleCutomerId?: string;
  wholeSaleCutomerName?: string;

  locationCode: string;
  responsiblePerson: string;

  remarks?: string;
  createdBy?: string;

  paymentStatus: "PAID" | "PARTIAL";

  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  items: {
    productId: string;
    quantity: number;
    wholesalePrice: number;
  }[];
};

type Props = {
  vehicles: VehicleType[];
  productStock: ProductStockType[];
  customers: WholeCustomerType[];
};

export default function BulkSaleForm({
  vehicles,
  productStock,
  customers,
}: Props) {
  const [customerSearch, setCustomerSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Product stock shown on screen
  const [products, setProducts] =
    useState<ProductStockType[]>(productStock);

  const form = useForm<TruckDeliverySaleType>({
    defaultValues: {
      vehicleId: "",
      remarks: "",
      paymentStatus: "PAID",
      totalAmount: 0,
      paidAmount: 0,
      dueAmount: 0,
      items: productStock.map((p) => ({
        productId: p.id,
        quantity: 0,
        wholesalePrice: p.wholesalePrice ?? p.sellingPrice,
      })),
    },
  });

  const customerId = form.watch("wholeSaleCutomerId");
  const vehicleId = form.watch("vehicleId");
  const paymentStatus = form.watch("paymentStatus");
  const paidAmount = form.watch("paidAmount") || 0;

  const totalAmount = form
    .watch("items")
    .reduce(
      (sum, item) =>
        sum + item.quantity * item.wholesalePrice,
      0
    );

  const dueAmount = Math.max(
    totalAmount - paidAmount,
    0
  );

  useEffect(() => {
    form.setValue("totalAmount", totalAmount);
    form.setValue("dueAmount", dueAmount);
  }, [totalAmount, dueAmount]);

  useEffect(() => {
    if (paymentStatus === "PAID") {
      form.setValue("paidAmount", totalAmount);
      form.setValue("dueAmount", 0);
    }
  }, [paymentStatus, totalAmount]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;

    return customers.filter((customer) =>
      customer.companyName
        ?.toLowerCase()
        .includes(customerSearch.toLowerCase())
    );
  }, [customerSearch, customers]);

  const selectedCustomer = useMemo(
    () =>
      customers.find((c) => c.id === customerId) ??
      null,
    [customerId, customers]
  );

  const selectedVehicle = vehicles.find(
    (v) => v.id === vehicleId
  );

  // Products displayed in table
  const rows = products;

  const onSubmit = async (
    data: TruckDeliverySaleType
  ) => {
    const items = data.items.filter(
      (x) => x.quantity > 0
    );

    if (!data.vehicleId) {
      toast.error("Please select a vehicle.");
      return;
    }

    if (!selectedVehicle) {
      toast.error("Selected vehicle not found.");
      return;
    }

    if (
      !data.wholeSaleCutomerId ||
      !data.wholeSaleCutomerName
    ) {
      toast.error(
        "Please select a wholesale customer."
      );
      return;
    }

    if (!items.length) {
      toast.error(
        "Please enter at least one quantity."
      );
      return;
    }

    if (data.paidAmount > data.totalAmount) {
      toast.error(
        "Paid amount cannot be greater than total amount."
      );
      return;
    }

    const result = await bulkSale({
      vehicleId: data.vehicleId,
      vehicleName: selectedVehicle.name,
      locationCode: selectedVehicle.locationCode,
      responsiblePerson:
        selectedVehicle.responsiblePersonName,

      wholeSaleCutomerId:
        data.wholeSaleCutomerId,
      wholeSaleCutomerName:
        data.wholeSaleCutomerName,

      totalAmount: Number(data.totalAmount),
      paidAmount: Number(data.paidAmount),
      dueAmount: Number(data.dueAmount),

      paymentStatus: data.paymentStatus,

      remarks: data.remarks,

      items,
    });

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    // Update local product stock
    setProducts((prev) =>
      prev.map((product) => {
        const sold = items.find(
          (i) => i.productId === product.id
        );

        if (!sold) return product;

        return {
          ...product,
          currentStock:
            product.currentStock -
            sold.quantity,
        };
      })
    );

    toast.success(result.message);

    form.reset({
      vehicleId: data.vehicleId,

      wholeSaleCutomerId: "",
      wholeSaleCutomerName: "",

      remarks: "",

      paymentStatus: "PAID",

      totalAmount: 0,
      paidAmount: 0,
      dueAmount: 0,

      items: products.map((p) => ({
        productId: p.id,
        quantity: 0,
        wholesalePrice:
          p.wholesalePrice ??
          p.sellingPrice,
      })),
    });

    setCustomerSearch("");
  };


  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6 w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Truck Delivery Sale
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Record products delivered from truck to customer.
          </p>
        </div>

        <div className="w-full space-y-6">

          {/* ================= Vehicle Info ================= */}

          <Card className="rounded-3xl border border-gray-100 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Truck Delivery Sale
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">

                <div>
                  {/* Vehicle */}

                  <div className="flex flex-col gap-2">
                    <label className="label-style-4">
                      Vehicle
                    </label>

                    <Controller
                      control={form.control}
                      name="vehicleId"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full bg-white text-black border border-gray-300">
                            <SelectValue placeholder="Select Vehicle" />
                          </SelectTrigger>

                          <SelectContent className="bg-white border border-gray-300">
                            {vehicles.map((v) => (
                              <SelectItem
                                key={v.id}
                                value={v.id}
                              >
                                {v.name} ({v.locationCode})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Driver */}

                  <div className="flex flex-col gap-2">
                    <label className="label-style-4">
                      Driver
                    </label>

                    <Input
                      value={
                        selectedVehicle?.responsiblePersonName ??
                        ""
                      }
                      disabled
                      className="input-style-4 bg-gray-100"
                    />
                  </div>
                  {/* Reference */}

                  {/* <div className="flex flex-col gap-2">
                    <label className="label-style-4">
                      Reference
                    </label>

                    <Input
                      className="input-style-4"
                      placeholder="Optional"
                    />
                  </div> */}

                </div>
                {/* RIGHT SIDE */}
                <div>

                  {/* ===================================================== */}
                  {/* PAYMENT */}
                  {/* ===================================================== */}

                  <div className=" pt-3">

                    <h3 className="font-semibold text-lg mb-4">
                      Payment Details
                    </h3>


                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">


                      {/* TOTAL AMOUNT */}

                      <div className="flex flex-col gap-2">

                        <label className="label-style-4">
                          Total Amount
                        </label>

                        <Input
                          value={totalAmount.toFixed(2)}
                          readOnly
                          className="input-style-4 bg-gray-100"
                        />

                      </div>


                      {/* PAYMENT STATUS */}

                      <div className="flex flex-col gap-2">

                        <label className="label-style-4">
                          Payment
                        </label>


                        <select
                          {...form.register("paymentStatus")}
                          className="input-style-4"
                        >

                          <option value="PAID">
                            Full Paid
                          </option>


                          <option value="PARTIAL">
                            Partial Payment
                          </option>


                        </select>

                      </div>



                      {/* PAID AMOUNT */}

                      <div className="flex flex-col gap-2">

                        <label className="label-style-4">
                          Paid Amount
                        </label>


                        <Input
                          type="number"
                          step="0.01"
                          disabled={
                            paymentStatus === "PAID"
                          }
                          {...form.register(
                            "paidAmount",
                            {
                              valueAsNumber: true
                            }
                          )}
                          className="input-style-4"
                        />

                      </div>



                      {/* DUE AMOUNT */}

                      <div className="flex flex-col gap-2">

                        <label className="label-style-4">
                          Due Amount
                        </label>


                        <Input
                          value={dueAmount.toFixed(2)}
                          readOnly
                          className="input-style-4 bg-gray-100"
                        />

                      </div>


                    </div>


                  </div>

                </div>

              </div>

              {/* ===================================================== */}
              {/* CUSTOMER */}
              {/* ===================================================== */}

              <div className="border-t pt-6">

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Customer
                    </h3>

                    <p className="text-sm text-gray-500">
                      Select customer for this delivery
                    </p>
                  </div>
                </div>

                <div className="bg-white">

                  <div className="flex mb-3 justify-between">
                    <div className="flex items-center justify-between mb-4">
                      {customerId && selectedCustomer && (
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
                        setCustomerSearch(e.target.value)
                      }
                      placeholder="Search customer..."
                      className="input-style-4 pl-10"
                    />

                  </div>

                  {/* CUSTOMER LIST */}

                  <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-gray-200">

                    {filteredCustomers.length > 0 ? (

                      filteredCustomers.map((customer) => (

                        <button
                          key={customer.id}
                          type="button"
                          onClick={() => {
                            form.setValue(
                              "wholeSaleCutomerId",
                              customer.id
                            );

                            form.setValue(
                              "wholeSaleCutomerName",
                              customer.companyName
                            );

                            setCustomerSearch(customer.companyName);

                            setShowDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-slate-50 transition ${selectedCustomer?.id === customer.id
                            ? "bg-blue-50"
                            : ""
                            }`}
                        >
                          <div className="font-medium text-sm text-gray-800">
                            {customer.companyName}
                          </div>

                          <div className="text-xs text-gray-500">
                            {customer.phone || "No phone"}
                          </div>

                        </button>

                      ))

                    ) : (

                      <div className="p-4 text-sm text-gray-400 text-center">
                        No customer found
                      </div>

                    )}

                  </div>

                </div>

              </div>



            </CardContent>
          </Card>

          {/* ================= Products ================= */}

          <Card className="rounded-3xl border border-gray-100 shadow-sm bg-white">

            <CardHeader className="border-b border-gray-100">
              <CardTitle>
                Products Stock
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6">

              <div className="rounded-2xl overflow-hidden  ">

                <table className="w-full">

                  <thead className="bg-zinc-200">
                    <tr>
                      <th className="text-left p-3">
                        Product
                      </th>

                      <th className="text-center p-3">
                        Current Stock
                      </th>

                      <th className="text-center p-3">
                        Default Price
                      </th>

                      <th className="text-center p-3">
                        Selling Price
                      </th>

                      <th className="text-center p-3">
                        Selling Qty
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {rows.map((item, index) => {

                      const wholesalePrice =
                        form.watch(`items.${index}.wholesalePrice`);
                      const qty =
                        form.watch(`items.${index}.quantity`) || 0;

                      return (
                        <tr
                          key={item.id}
                          className={`
        ${qty > 0
                              ? "bg-green-50"
                              : index % 2 === 0
                                ? "bg-zinc-50"
                                : "bg-zinc-100"
                            }
        hover:bg-blue-50
      `}
                        >
                          <td className="p-3 font-medium">
                            {item.name}
                          </td>

                          <td className="text-center font-semibold">
                            {item.currentStock}
                          </td>

                          <td className="text-center p-3">
                            ₹{item.wholesalePrice ?? item.sellingPrice}
                          </td>

                          <td className="p-2 w-36">
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              value={wholesalePrice ?? 0}
                              onChange={(e) =>
                                form.setValue(
                                  `items.${index}.wholesalePrice`,
                                  Number(e.target.value)
                                )
                              }
                            />
                          </td>

                          <td className="p-2">
                            <Input
                              type="number"
                              min={0}
                              max={item.currentStock}
                              {...form.register(`items.${index}.quantity`, {
                                valueAsNumber: true,
                                setValueAs: (value) =>
                                  value === "" || value == null
                                    ? 0
                                    : Number(value),
                              })}
                              onFocus={(e) => {
                                if (e.target.value === "0") {
                                  e.target.value = "";
                                }
                              }}
                              onBlur={(e) => {
                                if (e.target.value === "") {
                                  form.setValue(
                                    `items.${index}.quantity`,
                                    0,
                                    { shouldDirty: true }
                                  );
                                }
                              }}
                            />
                          </td>
                          {/* <td className="text-center font-semibold text-green-700">
                            {item.quantity - qty}
                          </td> */}
                        </tr>
                      )
                    })}

                    {rows.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-10 text-center text-gray-500"
                        >
                          No products available.
                        </td>
                      </tr>
                    )}

                  </tbody>

                </table>

              </div>

            </CardContent>

          </Card>

          {/* ================= Summary ================= */}

          <Card className="rounded-3xl border border-gray-100 shadow-sm bg-white">

            <CardContent className="p-6">

              <div className="flex justify-between items-center">

                <div className="space-y-1">

                  <p>
                    Total Products :
                    <strong> {rows.length}</strong>
                  </p>

                  <p>
                    Total Stock :
                    <strong>
                      {rows.reduce(
                        (sum, item) => sum + item.currentStock,
                        0
                      )}
                    </strong>
                  </p>

                </div>

                <Button type="submit" size="lg">
                  {/* <Truck className="mr-2 h-5 w-5" /> */}
                  Record Sale
                </Button>

              </div>

            </CardContent>

          </Card>

        </div>
      </div>
    </form>
  );
} 