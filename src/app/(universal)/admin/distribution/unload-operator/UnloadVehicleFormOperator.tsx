"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus, Trash2, Truck } from "lucide-react";

import { unloadVehicle } from "@/app/(universal)/action/distribution/unloadVehicle";
import { getStockLocationsAll } from "@/app/(universal)/action/distribution/getStockLocationsAll";

import { VehicleType } from "@/lib/types/distribution/VehicleType";
import { StockLocationType } from "@/lib/types/distribution/StockLocationType";

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

type UnloadVehicleFormType = {
   vehicleId: string;
  vehicleName: string;
  locationCode: string;
  responsiblePerson: string;

  remarks?: string;
  createdBy?: string;

  

  items: {
    productId: string;
    quantity: number;
  }[];
};

type Props = {
  vehicles: VehicleType[];
  factoryStock: StockLocationType[];
};

export default function UnloadVehicleFormOperator({
  vehicles,
  factoryStock,
}: Props) {

const form = useForm<UnloadVehicleFormType>({
  defaultValues: {
    vehicleId: "",
    remarks: "",
    items: [],
  },
});

const vehicleId = form.watch("vehicleId");

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
    }))
  );
};

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

const rows = vanStock.map((item) => ({
  ...item,
  factoryQuantity:
    factoryMap.get(item.productId) ?? 0,
}));

const onSubmit = async (
  data: UnloadVehicleFormType
) => {
  const items = data.items.filter(
    (x) => x.quantity > 0
  );

  if (!items.length) {
    toast.error(
      "Please enter at least one quantity."
    );
    return;
  }

  const result = await unloadVehicle({
    vehicleId: data.vehicleId,
  vehicleName: selectedVehicle!.name ,
  locationCode: selectedVehicle!.locationCode,
  responsiblePerson: selectedVehicle!.responsiblePersonName,
  remarks: data.remarks,
  items,
  });

  

  if (!result.success) {
    toast.error(result.message);
    return;
  }

  // ==========================
  // Update Factory Stock
  // ==========================

  setFactoryData((prev) =>
    prev.map((stock) => {
      const unloaded = items.find(
        (i) => i.productId === stock.productId
      );

      if (!unloaded) return stock;

      return {
        ...stock,
        quantity:
          stock.quantity + unloaded.quantity,
      };
    })
  );

  // ==========================
  // Update Vehicle Stock
  // ==========================

  setVanStock((prev) =>
    prev
      .map((stock) => {
        const unloaded = items.find(
          (i) => i.productId === stock.productId
        );

        if (!unloaded) return stock;

        return {
          ...stock,
          quantity:
            stock.quantity - unloaded.quantity,
        };
      })
      .filter((x) => x.quantity > 0)
  );

  toast.success(result.message);

  await fetchVanStock(data.vehicleId);

  form.reset({
    vehicleId: data.vehicleId,
    remarks: "",
    items: vanStock.map((item) => ({
      productId: item.productId,
      quantity: 0,
    })),
  });
};


 return (
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6 w-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Unload Vehicle
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Return remaining products from vehicle to factory
        </p>
      </div>

      <div className="w-full space-y-6">

        {/* ================= Vehicle Info ================= */}

        <Card className="rounded-3xl border border-gray-100 shadow-sm bg-white">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Unload Vehicle
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6 space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

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

              {/* Date */}

              {/* <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Unloading Date
                </label>

                <Input
                  type="date"
                  className="input-style-4"
                />
              </div> */}

              {/* Reference */}

              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Reference
                </label>

                <Input
                  className="input-style-4"
                  placeholder="Optional"
                />
              </div>

            </div>

            {/* <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Remarks
              </label>

              <Textarea
                className="input-style-4 min-h-[110px]"
                placeholder="Remarks..."
              />
            </div> */}

          </CardContent>
        </Card>

        {/* ================= Products ================= */}

        <Card className="rounded-3xl border border-gray-100 shadow-sm bg-white">

          <CardHeader className="border-b border-gray-100">
            <CardTitle>
              Products in Vehicle
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
                      Truck Stock
                    </th>

                    <th className="text-center p-3">
                     Factory Stock
                    </th>

                    <th className="text-center p-3">
                      Unload Qty
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {rows.map((item, index) => (
                    <tr
                      key={item.productId}
                      className="
                        
                        odd:bg-zinc-50
                        even:bg-zinc-100
                        hover:bg-blue-50
                      "
                    >
                      <td className="p-3 font-medium">
                        {item.productName}
                      </td>

                      <td className="text-center">
                        {item.factoryQuantity}
                      </td>

                      <td className="text-center font-semibold text-blue-700">
                        {item.quantity}
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
                    </tr>
                  ))}

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

          </CardContent>

        </Card>

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

              <Button type="submit" size="lg">
                <Truck className="mr-2 h-5 w-5" />
                Unload Vehicle
              </Button>

            </div>

          </CardContent>

        </Card>

      </div>
    </div>
  </form>
);
}