"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Truck } from "lucide-react";

import { StockLocationType } from "@/lib/types/distribution/StockLocationType";
import { Controller, useForm } from "react-hook-form";
import { loadVehicle } from "@/app/(universal)/action/distribution/loadVehicle";
import { VehicleType } from "@/lib/types/distribution/VehicleType";
import { useEffect, useState } from "react";
import { getStockLocationsAll } from "@/app/(universal)/action/distribution/getStockLocationsAll";
import toast from "react-hot-toast";


type LoadVehicleFormType = {
  vehicleId: string;
  remarks?: string;
  name: string;

  items: {
    productId: string;
    quantity: number;
    wholesalePrice:number;
  }[];
};

type Props = {
  vehicles: VehicleType[];
  factoryStock: StockLocationType[];
};

export default function LoadVehicleFormOeprator({
  factoryStock,
  vehicles,
}: Props) {




  const form = useForm<LoadVehicleFormType>({
    defaultValues: {
      vehicleId: "",
      remarks: "",
   items: factoryStock.map((item)=>({
  productId:item.productId,
  quantity:0,
  wholesalePrice:item.wholesalePrice,
}))
    },
  });



  const vehicleId = form.watch("vehicleId");
  console.log("vehicleId:", vehicleId);
  const [factoryData, setFactoryData] =
    useState<StockLocationType[]>(factoryStock);

  const [vanStock, setVanStock] =
    useState<StockLocationType[]>([]);

  const fetchVanStock = async (vanId: string) => {
    console.log("vehicleId =", vehicleId);
    if (!vanId) {
      setVanStock([]);
      return;
    }

    const result = await getStockLocationsAll({
      locationType: "TRUCK",
      locationRef: vanId,
    });

    setVanStock(result);
  };

  useEffect(() => {
    fetchVanStock(vehicleId);
  }, [vehicleId]);

  const selectedVehicle = vehicles.find(
    (v) => v.id === vehicleId
  );
  console.log("selectedVehicle:", selectedVehicle);

  const vanMap = new Map(
    vanStock.map((x) => [x.productId, x.quantity])
  );

  const rows = factoryData.map((item) => ({
    ...item,
    vanQuantity: vanMap.get(item.productId) ?? 0,
  }));

  const onSubmit = async (data: LoadVehicleFormType) => {

    const items = data.items.filter((x) => x.quantity > 0);



    if (!data.vehicleId) {
      toast.error("Please select a vehicle.");
      return;
    }

    if (!selectedVehicle?.name) {
      toast.error("Selected vehicle not found.");
      return;
    }

    if (items.length === 0) {
      toast.error("Please enter at least one quantity.");
      return;
    }

    const result = await loadVehicle({
      vehicleId: data.vehicleId,
      vehicleName: selectedVehicle.name,
      locationCode: selectedVehicle.locationCode,
      responsiblePerson: selectedVehicle.responsiblePersonName,
      remarks: data.remarks,
      items,
    });

    console.log(result);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    // ==========================
    // Update Factory Stock
    // ==========================

    setFactoryData((prev) =>
      prev.map((stock) => {
        const loaded = items.find(
          (i) => i.productId === stock.productId
        );

        if (!loaded) return stock;

        return {
          ...stock,
          quantity: stock.quantity - loaded.quantity,
        };
      })
    );

    // ==========================
    // Update Van Stock
    // ==========================

    setVanStock((prev) => {
      const updated = [...prev];

      for (const loaded of items) {
        const index = updated.findIndex(
          (x) => x.productId === loaded.productId
        );

        if (index >= 0) {
          updated[index] = {
            ...updated[index],
            quantity:
              updated[index].quantity + loaded.quantity,
          };
        } else {
          const product = factoryData.find(
            (x) => x.productId === loaded.productId
          );

          if (product) {
            updated.push({
              ...product,
              id: `${product.productId}_VAN_${data.vehicleId}`,
              locationType: "TRUCK",
              locationRef: data.vehicleId,
              quantity: loaded.quantity,
              wholesalePrice: loaded.wholesalePrice,
            });
          }
        }
      }

      return updated;
    });

    toast.success(result.message);

    await fetchVanStock(data.vehicleId);

    form.reset({
      vehicleId: data.vehicleId,
      remarks: "",
   items: factoryData.map((item)=>({
  productId:item.productId,
  quantity:0,
  wholesalePrice:item.wholesalePrice,
}))
    });
  };



  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6 w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Load Vehicle
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Transfer finished products to vehicle
          </p>
        </div>
        <div className="w-full space-y-6">

          <Card className="rounded-3xl border border-gray-100 shadow-sm bg-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Load Vehicle
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
                    value={selectedVehicle?.responsiblePersonName || ""}
                    placeholder="Auto Selected"
                    disabled
                    className="input-style-4 bg-gray-100"
                  />
                </div>

                {/* Loading Date */}

                {/* <div className="flex flex-col gap-2">
                  <label className="label-style-4">
                    Loading Date
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
                    placeholder="Optional"
                    className="input-style-4"
                  />
                </div>

              </div>

              {/* Remarks */}

              {/* <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Remarks
                </label>

                <Textarea
                  placeholder="Remarks..."
                  className="input-style-4 min-h-[110px] resize-none"
                />
              </div> */}

            </CardContent>
          </Card>

          {/* Products */}

          <Card className="rounded-3xl border border-gray-100 shadow-sm bg-white">

            <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100">

              <CardTitle className="flex items-center gap-2 text-xl">Products</CardTitle>

              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10">

                <Plus className="mr-2 h-4 w-4" />

                Add Product

              </Button>

            </CardHeader>

            <CardContent className="p-6 space-y-6">

              <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white">

                <table className="w-full">

                  <thead className="bg-zinc-200">

                    <tr>

                      <th className="text-left p-3">
                        Product
                      </th>
                      <th className="p-3">
                        Price
                      </th>
                      <th className="  p-3">
                        Total Stock
                      </th>


                      <th className="  p-3">
                        Van Stock
                      </th>

                      <th className="  p-3">
                        Load Qty
                      </th>

                      <th className="w-16"></th>

                    </tr>

                  </thead>

                  <tbody>
                    {rows.map((item, index) => (
                      <tr
                        key={item.id}
                        className="
        border-b border-zinc-200
        odd:bg-zinc-50
        even:bg-zinc-100
        hover:bg-blue-50
        transition-colors
      "
                      >
                        <td className="p-3 font-medium">
                          {item.productName}
                        </td>
                        <td className="text-center p-3 font-medium  ">
                         {item.wholesalePrice}
                        </td>
                        <td className="text-center font-semibold">
                          {item.quantity}
                        </td>

                        <td className="text-center font-semibold">
                          {item.vanQuantity}
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

                        <td className="text-center">
                          <Button
                            size="icon"
                            variant="ghost"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))}

                    {factoryStock.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-10 text-center text-gray-500"
                        >
                          No stock available.
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>

              </div>

            </CardContent>

          </Card>

          {/* Summary */}

          <Card className="rounded-3xl border border-gray-100 shadow-sm bg-white">

            <CardContent className="p-6">

              <div className="flex justify-between items-center">

                <div className="space-y-1">

                  <p>
                    Total Products :
                    <strong> 3</strong>
                  </p>

                  <p>
                    Total Quantity :
                    <strong> 170 Kg</strong>
                  </p>

                </div>



                <Button type="submit" size="lg">
                  <Truck className="mr-2 h-5 w-5" />
                  Load Vehicle
                </Button>

              </div>

            </CardContent>

          </Card>

        </div></div>
    </form>
  );
}