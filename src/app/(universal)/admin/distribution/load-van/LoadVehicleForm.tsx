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
import { useForm } from "react-hook-form";
import { loadVehicle } from "@/app/(universal)/action/distribution/loadVehicle";
import { VehicleType } from "@/lib/types/distribution/VehicleType";

type Props = {
  factoryStock: StockLocationType[];
  vehicles: VehicleType[];
};

type LoadVehicleFormType = {
  vehicleId: string;
  vehicleName?: string,

  remarks?: string;

  items: {
    productId: string;
    quantity: number;
  }[];
};

export default function LoadVehicleForm({
  factoryStock,
  vehicles,
}: Props) {

  

  const form = useForm<LoadVehicleFormType>({
    defaultValues: {
      vehicleId: "",
      remarks: "",
      items: factoryStock.map((item) => ({
        productId: item.productId,
        quantity: 0,
      })),
    },
  });

  const vehicleId = form.watch("vehicleId");

  const selectedVehicle = vehicles.find(
    (v) => v.id === vehicleId
  );

  const onSubmit = async (data: LoadVehicleFormType) => {
    const items = data.items.filter((x) => x.quantity > 0);
  
    const result = await loadVehicle({
      vehicleId: data.vehicleId,
      vehicleName: selectedVehicle?.name ?? "",
       locationCode: selectedVehicle?.locationCode ?? "",
  responsiblePerson: selectedVehicle?.responsiblePersonName ?? "",
      remarks: data.remarks,
      items,
    });

    console.log(result);

    if (!result.success) {
      alert(result.message);
      return;
    }

    alert(result.message);

    form.reset();
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

            <CardContent className="space-y-6">

              {/* Header */}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                <div>
                  <label className="text-sm font-medium">Vehicle</label>

                  <Select
                    onValueChange={(value) =>
                      form.setValue("vehicleId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Vehicle" />
                    </SelectTrigger>

                    <SelectContent>
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

                  <input
                    type="hidden"
                    {...form.register("vehicleId")}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Driver</label>

                  <Input
                    value={selectedVehicle?.responsiblePersonName || ""}
                    placeholder="Auto Selected"
                    disabled
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Loading Date</label>

                  <Input type="date" />
                </div>

                <div>
                  <label className="text-sm font-medium">Reference</label>

                  <Input placeholder="Optional" />
                </div>

              </div>

              <div>
                <label className="text-sm font-medium">
                  Remarks
                </label>

                <Textarea
                  placeholder="Remarks..."
                />
              </div>

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

                      <th className="text-center p-3">
                        Factory Stock
                      </th>

                      <th className="text-center p-3">
                        Van Stock
                      </th>

                      <th className="text-center p-3">
                        Load Qty
                      </th>

                      <th className="w-16"></th>

                    </tr>

                  </thead>

                  <tbody>
                    {factoryStock.map((item, index) => (
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

                        <td className="text-center font-semibold">
                          {item.quantity}
                        </td>

                        <td className="text-center">
                          0
                        </td>

                        <td className="p-2">
                          <Input
                            type="number"
                            min={0}
                            max={item.quantity}
                            {...form.register(`items.${index}.quantity`, {
                              valueAsNumber: true,
                            })}
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