"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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


type RouteType = {
  id: string;
  routeCode: string;
  routeName: string;

  vehicleId?: string;
  vehicleName?: string;
  locationCode?: string;

  salesmanId?: string;
  salesmanName?: string;
};

type LoadVehicleFormType = {
  routeId: string;
  vehicleId: string;
  salesmanId: string;

  remarks?: string;
  name: string;

  items: {
    productId: string;
    quantity: number;
    wholesalePrice: number;
  }[];
};

type Props = {
  routes: RouteType[];
  vehicles: VehicleType[];
  factoryStock: StockLocationType[];
};

export default function LoadVehicleFormOeprator({
  factoryStock,
  vehicles,
  routes,
}: Props) {




  const form = useForm<LoadVehicleFormType>({
    defaultValues: {
      routeId: "",
      vehicleId: "",
      salesmanId: "",
      remarks: "",

      items: factoryStock.map((item) => ({
        productId: item.productId,
        quantity: 0,
        wholesalePrice: item.wholesalePrice,
      })),
    },
  });


  const routeId = form.watch("routeId");
  const vehicleId = form.watch("vehicleId");
  const salesmanId = form.watch("salesmanId");

  const selectedRoute = routes.find(
    (r) => r.id === routeId
  );

  const selectedVehicle = vehicles.find(
    (v) => v.id === vehicleId
  );

  const [factoryData, setFactoryData] =
    useState<StockLocationType[]>(factoryStock);

  const [vanStock, setVanStock] =
    useState<StockLocationType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
    if (!selectedRoute) {
      form.setValue("vehicleId", "");
      form.setValue("salesmanId", "");
      return;
    }

    // Automatically select route's assigned vehicle
    if (selectedRoute.vehicleId) {
      form.setValue(
        "vehicleId",
        selectedRoute.vehicleId
      );
    }

    // Automatically select route's salesman
    if (selectedRoute.salesmanId) {
      form.setValue(
        "salesmanId",
        selectedRoute.salesmanId
      );
    }
  }, [selectedRoute, form]);


  const vanMap = new Map(
    vanStock.map((x) => [x.productId, x.quantity])
  );

  const rows = factoryData.map((item) => ({
    ...item,
    vanQuantity: vanMap.get(item.productId) ?? 0,
  }));


  const onSubmit = async (data: LoadVehicleFormType) => {
    if (isSubmitting) return;

    const items = data.items.filter((x) => x.quantity > 0);

    if (!data.routeId) {
      toast.error("Please select a route.");
      return;
    }

    if (!selectedRoute) {
      toast.error("Selected route not found.");
      return;
    }

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

    setIsSubmitting(true);

    try {
      const result = await loadVehicle({
        // ==========================
        // ROUTE
        // ==========================

        routeId: data.routeId,

        routeName:
          selectedRoute?.routeName || "",

        // ==========================
        // VEHICLE
        // ==========================

        vehicleId: data.vehicleId,

        vehicleName:
          selectedVehicle.name,

        locationCode:
          selectedVehicle.locationCode,

// ==========================
// SALESMAN
// ==========================

salesmanId:
  selectedRoute.salesmanId || "",

salesmanName:
  selectedRoute.salesmanName || "",

// ==========================
// LEGACY DRIVER FIELDS
// ==========================

driverId:
  selectedRoute.salesmanId || "",

driverName:
  selectedRoute.salesmanName || "",

responsiblePerson:
  selectedRoute.salesmanName || "",

        // ==========================
        // OTHER
        // ==========================

        remarks:
          data.remarks,

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
  routeId: data.routeId,

  vehicleId: data.vehicleId,

  salesmanId:
    selectedRoute?.salesmanId || "",

  remarks: "",

  items: factoryData.map((item) => ({
    productId: item.productId,
    quantity: 0,
    wholesalePrice: item.wholesalePrice,
  })),
});

    } catch (error) {
      console.error("Load vehicle error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedItems = form.watch("items");

  const totalProducts = selectedItems.filter(
    (item) => item.quantity > 0
  ).length;

  const totalQuantity = selectedItems.reduce(
    (sum, item) =>
      sum + (item.quantity || 0),
    0
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="min-h-screen  w-full">

        <div className="w-full space-y-6">

          <div className="rounded-xl border border-gray-100 shadow-sm bg-white">


            <div className="flex items-center gap-4 px-2 py-1">

              {/* Route */}
              <div className="flex items-center gap-2">

                <label className="text-sm text-gray-600 whitespace-nowrap">
                  Route
                </label>

                <Controller
                  control={form.control}
                  name="routeId"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="h-10 w-48 bg-white border border-gray-300 text-sm">
                        <SelectValue placeholder="Select route" />
                      </SelectTrigger>

                      <SelectContent>

                        {routes.map((route) => (
                          <SelectItem
                            key={route.id}
                            value={route.id}
                          >
                            {route.routeName}
                          </SelectItem>
                        ))}

                      </SelectContent>
                    </Select>
                  )}
                />

              </div>


              {/* Vehicle */}
              <div className="flex items-center gap-2">

                <label className="text-sm text-gray-600 whitespace-nowrap">
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
                      <SelectTrigger className="h-10 w-48 bg-white border border-gray-300 text-sm">
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>

                      <SelectContent>

                        {vehicles.map((vehicle) => (
                          <SelectItem
                            key={vehicle.id}
                            value={vehicle.id}
                          >
                            {vehicle.name} ({vehicle.locationCode})
                          </SelectItem>
                        ))}

                      </SelectContent>
                    </Select>
                  )}
                />

              </div>


              {/* Salesman */}
              <div className="flex items-center gap-2">

                <label className="text-sm text-gray-600 whitespace-nowrap">
                  Salesman
                </label>

            <Input
  value={selectedRoute?.salesmanName || ""}
  placeholder="Auto Selected"
  disabled
  className="h-10 w-48 bg-gray-100 text-sm"
/>

              </div>


              {/* Reference */}
              <div className="flex items-center gap-2">

                <label className="text-sm text-gray-600 whitespace-nowrap">
                  Ref
                </label>

                <Input
                  placeholder="Optional"
                  className="h-10 w-40 text-sm"
                />

              </div>


              {/* Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 bg-blue-600 hover:bg-blue-700 text-white px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add
                  </>
                )}
              </Button>

            </div>


            {/* <div className="flex items-center gap-4 px-2 py-1">

               
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 whitespace-nowrap">
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
                        <SelectTrigger className="h-10 w-48 bg-white border border-gray-300 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>

                        <SelectContent>
                          {vehicles.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {v.name} ({v.locationCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

            
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 whitespace-nowrap">
                    Driver
                  </label>

                  <Input
                    value={selectedVehicle?.responsiblePersonName || ""}
                    placeholder="Auto Selected"
                    disabled
                    className="h-10 w-48 bg-gray-100 text-sm"
                  />
                </div>

     
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600 whitespace-nowrap">
                    Ref
                  </label>

                  <Input
                    placeholder="Optional"
                    className="h-10 w-40 text-sm"
                  />
                </div>

               
               <Button
  type="submit"
  disabled={isSubmitting}
  className="h-10 bg-blue-600 hover:bg-blue-700 text-white px-4 disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isSubmitting ? (
    <>
      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      Loading...
    </>
  ) : (
    <>
      <Plus className="mr-2 h-4 w-4" />
      Add
    </>
  )}
</Button>

              </div> */}




          </div>

          {/* Products */}

          <Card className="rounded-xl border border-gray-100 shadow-sm bg-white">



            <div className="">

              <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">

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
                        Truck Stock
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

            </div>

          </Card>

          {/* Summary */}

          <Card className="rounded-3xl border border-gray-100 shadow-sm bg-white">

            <div className="p-6">

              <div className="flex justify-between items-center">

                <div className="space-y-1">

                  <p>
                    Total Products :
                    <strong> {totalProducts}</strong>
                  </p>

                  <p>
                    Total Quantity :
                    <strong> {totalQuantity} Kg</strong>
                  </p>

                </div>



                {/* <Button className="bg-slate-400" type="submit" size="lg">
                  <Truck className="mr-2 h-5 w-5 " />
                  Load Vehicle
                </Button> */}

              </div>

            </div>

          </Card>

        </div></div>
    </form>
  );
}