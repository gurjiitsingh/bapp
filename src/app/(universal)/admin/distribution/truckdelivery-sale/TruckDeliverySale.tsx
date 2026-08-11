"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Search, Truck } from "lucide-react";

import { unloadVehicle } from "@/app/(universal)/action/distribution/unloadVehicle";
import { getStockLocationsAll } from "@/app/(universal)/action/distribution/getStockLocationsAll";

import { VehicleType } from "@/lib/types/distribution/VehicleType";
import { StockLocationType } from "@/lib/types/distribution/StockLocationType";
import { Loader2 } from 'lucide-react';
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
import { saveDeiveryTruckSale } from "@/app/(universal)/action/distribution/sale/saveDeiveryTruckSale";


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
  factoryStock: StockLocationType[];
  customers: WholeCustomerType[];
};

export default function TruckDeliverySale({
  vehicles,
  factoryStock,
  customers,
}: Props) {
  // console.log("fact  ------------------", factoryStock)
  // console.log("fact  ------------------", vehicles)
  // console.log("fact  ------------------", customers)

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



  const form = useForm<TruckDeliverySaleType>({
    defaultValues: {
      vehicleId: "",
      remarks: "",

      paymentStatus: "PAID",

      totalAmount: 0,
      paidAmount: 0,
      dueAmount: 0,

      items: []
    }
  });

  const customerId = form.watch("wholeSaleCutomerId");
  const vehicleId = form.watch("vehicleId");

  const paymentStatus = form.watch("paymentStatus");

  const paidAmount = form.watch("paidAmount") || 0;


  const totalAmount = form.watch("items").reduce(
    (sum, item) =>
      sum + (item.quantity * item.wholesalePrice),
    0
  );


  const dueAmount = Math.max(
    totalAmount - paidAmount,
    0
  );


  // save calculated values in form
  useEffect(() => {

    form.setValue(
      "totalAmount",
      totalAmount
    );

    form.setValue(
      "dueAmount",
      dueAmount
    );

  }, [
    totalAmount,
    dueAmount
  ]);


  useEffect(() => {

    if (paymentStatus === "PAID") {

      form.setValue(
        "paidAmount",
        totalAmount
      );

      form.setValue(
        "dueAmount",
        0
      );

    }

  }, [
    paymentStatus,
    totalAmount
  ]);

  const [factoryData, setFactoryData] =
    useState<StockLocationType[]>(factoryStock);

  const [vanStock, setVanStock] =
    useState<StockLocationType[]>([]);



  const fetchVanStock = async (vanId: string) => {
    if (!vanId) {
      setVanStock([]);

      form.setValue("items", []);

      return;
    }

    const result = await getStockLocationsAll({
      locationType: "TRUCK",
      locationRef: vanId,
    });

    setVanStock(result);

    form.setValue(
      "items",
      result.map((item) => ({
        productId: item.productId,
        quantity: 0,
        wholesalePrice: item.wholesalePrice,
      }))
    );
  };


  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;

    return customers.filter((customer) =>
      customer.companyName
        ?.toLowerCase()
        .includes(customerSearch.toLowerCase())
    );
  }, [customerSearch, customers]);

  const selectedCustomer = useMemo(() => {
    return (
      customers.find((c) => c.id === customerId) ?? null
    );
  }, [customerId, customers]);



  // useEffect(() => {
  //   if (customerId) {
  //     localStorage.setItem(
  //       "lastCustomerId",
  //       customerId
  //     );
  //   }
  // }, [customerId]);

  useEffect(() => {
    fetchVanStock(vehicleId);
  }, [vehicleId]);

  const selectedVehicle = vehicles.find(
    (v) => v.id === vehicleId
  );

  const factoryMap = new Map(
    factoryData.map((x) => [
      x.productId,
      x.quantity,
    ])
  );
  const [submitting, setSubmitting] = useState(false);
  const rows = vanStock.map((item) => ({
    ...item,
    factoryQuantity:
      factoryMap.get(item.productId) ?? 0,
  }));

  const onSubmit = async (data: TruckDeliverySaleType) => {
    try {
      setSubmitting(true);

      const items = data.items.filter(
        (x) => x.quantity > 0
      );

      if (!data.vehicleId) {
        toast.error('Please select a vehicle.');
        return;
      }

      if (!selectedVehicle?.name) {
        toast.error('Selected vehicle not found.');
        return;
      }

      if (
        !data.wholeSaleCutomerId ||
        !data.wholeSaleCutomerName
      ) {
        toast.error(
          'Please select a wholesale customer.'
        );
        return;
      }

      if (!items.length) {
        toast.error(
          'Please enter at least one quantity.'
        );
        return;
      }

      // if (data.paidAmount > data.totalAmount) {
      //   toast.error(
      //     'Paid amount cannot be greater than total amount.'
      //   );
      //   return;
      // }

      const result = await saveDeiveryTruckSale({
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

      // your existing success logic...
      toast.success(result.message);

      await fetchVanStock(data.vehicleId);

      // your existing form.reset(...)
    } finally {
      setSubmitting(false);
    }
  };

  //   const onSubmit = async (
  //     data: TruckDeliverySaleType
  //   ) => {
  //     const items = data.items.filter(
  //       (x) => x.quantity > 0
  //     );


  //     if (!data.vehicleId) {
  //       toast.error("Please select a vehicle.");
  //       return;
  //     }

  //     if (!selectedVehicle?.name) {
  //       toast.error("Selected vehicle not found.");
  //       return;
  //     }

  //     if (
  //       !data.wholeSaleCutomerId ||
  //       !data.wholeSaleCutomerName
  //     ) {
  //       toast.error("Please select a wholesale customer.");
  //       return;
  //     }

  //     if (!items.length) {
  //       toast.error(
  //         "Please enter at least one quantity."
  //       );
  //       return;
  //     }

  //     if (data.paidAmount > data.totalAmount) {

  //       toast.error(
  //         "Paid amount cannot be greater than total amount."
  //       );

  //       return;

  //     }

  //     const result = await deiveryTruckSale({

  //       vehicleId: data.vehicleId,

  //       vehicleName: selectedVehicle!.name,

  //       locationCode: selectedVehicle!.locationCode,

  //       responsiblePerson:
  //         selectedVehicle!.responsiblePersonName,


  //       wholeSaleCutomerId:
  //         data.wholeSaleCutomerId!,


  //       wholeSaleCutomerName:
  //         data.wholeSaleCutomerName!,


  //       totalAmount: Number(data.totalAmount),

  //       paidAmount: Number(data.paidAmount),

  //       dueAmount: Number(data.dueAmount),

  //       paymentStatus: data.paymentStatus,



  //       remarks: data.remarks,


  //       items,

  //     });



  //     if (!result.success) {
  //       toast.error(result.message);
  //       return;
  //     }

  //     // ==========================
  //     // Update Factory Stock
  //     // ==========================

  //     setFactoryData((prev) =>
  //       prev.map((stock) => {
  //         const unloaded = items.find(
  //           (i) => i.productId === stock.productId
  //         );

  //         if (!unloaded) return stock;

  //         return {
  //           ...stock,
  //           quantity:
  //             stock.quantity + unloaded.quantity,
  //         };
  //       })
  //     );

  //     // ==========================
  //     // Update Vehicle Stock
  //     // ==========================

  //     setVanStock((prev) =>
  //       prev
  //         .map((stock) => {
  //           const unloaded = items.find(
  //             (i) => i.productId === stock.productId
  //           );

  //           if (!unloaded) return stock;

  //           return {
  //             ...stock,
  //             quantity:
  //               stock.quantity - unloaded.quantity,
  //           };
  //         })
  //         .filter((x) => x.quantity > 0)
  //     );

  //     toast.success(result.message);

  //     await fetchVanStock(data.vehicleId);



  //     form.reset({

  //       vehicleId: data.vehicleId,

  //       wholeSaleCutomerId: "",

  //       wholeSaleCutomerName: "",

  //       remarks: "",

  //       paymentStatus: "PAID",

  //       totalAmount: 0,

  //       paidAmount: 0,

  //       dueAmount: 0,


  //    items: vanStock.map((item) => ({
  //   productId: item.productId,
  //   quantity: 0,
  //   wholesalePrice: item.wholesalePrice,
  // }))
  //     });

  //     setCustomerSearch("");
  //   };


  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="min-h-screen   w-full">
        {/* <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Truck Delivery Sale
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Record products delivered from truck to customer.
          </p>
        </div> */}

        <div className="w-full space-y-4">

          {/* ================= Vehicle Info ================= */}

          <div className="rounded-xl px-1 border border-gray-100 shadow-sm ">




            <div className="flex items-end gap-4 flex-wrap   pb-3">

              {/* Vehicle */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Vehicle</label>

                <Controller
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="h-9 w-44 text-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>

                      <SelectContent>
                        {vehicles.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Driver */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Driver</label>

                <Input
                  value={selectedVehicle?.responsiblePersonName ?? ""}
                  disabled
                  className="h-9 w-40 text-sm bg-gray-100"
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

              {/* Total */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Total</label>

                <Input
                  value={totalAmount.toFixed(2)}
                  readOnly
                  className="h-9 w-28 text-sm bg-gray-100"
                />
              </div>

              {/* Payment Status */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Payment</label>

                <select
                  {...form.register("paymentStatus")}
                  className="h-9 w-36 border border-gray-300 rounded text-sm px-2"
                >
                  <option value="PAID">Paid</option>
                  <option value="PARTIAL">Partial</option>
                </select>
              </div>

              {/* Paid Amount */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Paid</label>

                <Input
                  type="number"
                  step="0.01"
                  disabled={paymentStatus === "PAID"}
                  {...form.register("paidAmount", {
                    valueAsNumber: true,
                  })}
                  className="h-9 w-28 text-sm"
                />
              </div>

              {/* Due */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500">Due</label>

                <Input
                  value={dueAmount.toFixed(2)}
                  readOnly
                  className="h-9 w-28 text-sm bg-gray-100"
                />
              </div>

              <Button
                type='submit'
                size='lg'
                className='bg-red-600 hover:bg-red-700 w-[300px] text-slate-100'
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                    Processing...
                  </>
                ) : (
                  <>
                    <Truck className='mr-2 h-5 w-5' />
                    Save
                  </>
                )}
              </Button>
            </div>


          </div>

          {/* ================= Products ================= */}

          <div className="rounded-xl border border-gray-100 shadow-sm bg-white">


            <div className="">

              <div className="rounded-xl overflow-hidden  ">

                <table className="w-full">

                  <thead className="bg-zinc-200">
                    <tr>
                      <th className="text-left p-3">
                        Product
                      </th>
                      <th className="text-center p-3">
                        Price
                      </th>
                      <th className="text-center p-3">
                        Truck Stock
                      </th>

                      <th className="text-center p-3">
                        Selling Price
                      </th>

                      <th className="text-center p-3">
                        Selling Qty
                      </th>
                      {/* <th className="text-center p-3">
                        Remaining
                      </th> */}
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
                          key={item.productId}
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
                            {item.productName}
                          </td>
                          <td className="text-center p-3 font-medium">
                            {item.wholesalePrice}
                          </td>

                          <td className="text-center">
                            {item.quantity}
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
                              max={item.quantity}
                              {...form.register(`items.${index}.quantity`, {
                                valueAsNumber: true,
                              })}
                              onFocus={(e) => {
                                if (e.target.value === "0") {
                                  e.target.value = "";
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
                          No products found in vehicle.
                        </td>
                      </tr>
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </div>

          {/* ================= Summary ================= */}

          <Card className="rounded-3xl border border-gray-100 shadow-sm bg-white">

            <CardContent className="p-6">

              <div className="flex justify-between items-center">

                <div className="space-y-1">

                  <p>
                    Products in Vehicle :
                    <strong> {rows.length}</strong>
                  </p>

                  <p>
                    Total Vehicle Qty :
                    <strong>
                      {" "}
                      {rows.reduce(
                        (sum, item) =>
                          sum + item.quantity,
                        0
                      )}
                    </strong>
                  </p>

                </div>



              </div>

            </CardContent>

          </Card>

        </div>
      </div>
    </form>
  );
} 