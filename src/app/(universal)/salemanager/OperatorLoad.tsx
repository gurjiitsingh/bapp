"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller, useForm } from "react-hook-form";
import { loadVehicle } from "@/app/(universal)/action/distribution/loadVehicle";
import { VehicleType } from "@/lib/types/distribution/VehicleType";
import { useEffect, useState } from "react";
import { getStockLocationsAll } from "@/app/(universal)/action/distribution/getStockLocationsAll";
import toast from "react-hot-toast";
import { StockLocationType } from "@/lib/types/distribution/StockLocationType";
import EditVanStockDialog from "./EditVanStockDialog";
import { Pencil } from "lucide-react";

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
  salemanId: string;
  remarks?: string;
  items: {
    productId: string;
    quantity: number;
    wholesalePrice: number;
  }[];
};

type Props = {
  vehicles?: VehicleType[];
  factoryStock?: StockLocationType[];
  routes?: RouteType[];
};
export default function LoadVehicleFormOeprator({
  factoryStock = [],
  vehicles = [],
  routes = [],
}: Props) {

  const [factoryData, setFactoryData] =
    useState<StockLocationType[]>(factoryStock);

  const [vanStock, setVanStock] =
    useState<StockLocationType[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingItem, setEditingItem] =
  useState<(StockLocationType & { vanQuantity: number }) | null>(null);
  
  const form = useForm<LoadVehicleFormType>({

    defaultValues: {
      routeId: "",
      vehicleId: "",
      salemanId: "",
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

  const selectedRoute = routes.find(
    (r) => r.id === routeId
  );

  const selectedVehicle = vehicles.find(
    (v) => v.id === vehicleId
  );


  useEffect(() => {
    if (!selectedRoute) {
      form.setValue("vehicleId", "");
      form.setValue("salemanId", "");
      return;
    }

    form.setValue(
      "vehicleId",
      selectedRoute.vehicleId || "",
      { shouldValidate: true }
    );

    form.setValue(
      "salemanId",
      selectedRoute.salesmanId || ""
    );
  }, [selectedRoute, form]);

  // =========================
  // Fetch Van Stock
  // =========================
  useEffect(() => {
    if (!vehicleId) {
      setVanStock([]);
      return;
    }

    (async () => {
      const result = await getStockLocationsAll({
        locationType: "TRUCK",
        locationRef: vehicleId,
      });
      setVanStock(result);
    })();
  }, [vehicleId]);

  // =========================
  // Merge stock
  // =========================
  const vanMap = new Map(
    vanStock.map((x) => [x.productId, x.quantity])
  );

  const rows = factoryData.map((item) => ({
    ...item,
    vanQuantity: vanMap.get(item.productId) ?? 0,
  }));

  // =========================
  // Submit
  // =========================
  const onSubmit = async (data: LoadVehicleFormType) => {
    if (isSubmitting) return;

    const items = data.items.filter(
      (x) => Number(x.quantity) > 0
    );

    // ==========================
    // VALIDATION
    // ==========================

    if (!data.routeId || !selectedRoute) {
      return toast.error("Please select a route");
    }

    if (!data.vehicleId || !selectedVehicle) {
      return toast.error("Please select a vehicle");
    }

    if (!items.length) {
      return toast.error("Enter quantity");
    }

    // ==========================
    // VALIDATE FACTORY STOCK
    // ==========================

    // for (const item of items) {
    //   const stock = factoryData.find(
    //     (s) => s.productId === item.productId
    //   );

    //   if (!stock || item.quantity > stock.quantity) {
    //     return toast.error(
    //       `Insufficient stock for ${
    //         stock?.productName || item.productId
    //       }`
    //     );
    //   }
    // }

    setIsSubmitting(true);

    try {
      console.log("Load Vehicle Submit:", data);

      // ==========================
      // SAVE LOADING
      // ==========================

      const result = await loadVehicle({
        routeId: data.routeId,
        routeName: selectedRoute.routeName,

        vehicleId: data.vehicleId,
        vehicleName: selectedVehicle.name,
        locationCode: selectedVehicle.locationCode,

        salesmanId: selectedRoute.salesmanId || "",
        salesmanName: selectedRoute.salesmanName || "",

        driverId: selectedRoute.salesmanId || "",
        driverName: selectedRoute.salesmanName || "",

        responsiblePerson:
          selectedRoute.salesmanName || "",

        remarks: data.remarks,

        items,
      });

      console.log("Load Vehicle Result:", result);

      if (!result?.success) {
        toast.error(
          result?.message || "Vehicle loading failed"
        );
        return;
      }

      // ==========================
      // UPDATE FACTORY STOCK
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
      // UPDATE VAN STOCK
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

      toast.success(result.message || "Loaded successfully");

      // ==========================
      // REFRESH VAN STOCK
      // ==========================

      const updatedVanStock = await getStockLocationsAll({
        locationType: "TRUCK",
        locationRef: data.vehicleId,
      });

      setVanStock(updatedVanStock);

      // ==========================
      // RESET QUANTITIES
      // ==========================

      form.reset({
        routeId: data.routeId,
        vehicleId: data.vehicleId,
        salemanId: selectedRoute.salesmanId || "",
        remarks: "",

        items: factoryData.map((item) => {
          const loaded = items.find(
            (i) => i.productId === item.productId
          );

          return {
            productId: item.productId,
            quantity: 0,
            wholesalePrice: item.wholesalePrice,
          };
        }),
      });

    } catch (error) {
      console.error("Load Vehicle Error:", error);
      toast.error("Something went wrong while loading vehicle");

    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedItems = form.watch("items");

  const totalProducts = selectedItems.filter(
    (i) => i.quantity > 0
  ).length;

  const totalQuantity = selectedItems.reduce(
    (sum, i) => sum + (i.quantity || 0),
    0
  );

  console.log("Stock item-----------",editingItem )
 

  return (
    <form
      onSubmit={form.handleSubmit(
        onSubmit,
        (errors) => {
          console.log("Form Validation Errors:", errors);
          toast.error("Please check the form values");
        }
      )}
    >
      {/* <div className="flex flex-col h-screen bg-gray-50"> */}
<div className="flex flex-col h-[100dvh] bg-slate-50">
        {/* 🔹 Header */}
        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-800">
                Load Vehicle
              </h1>
              <p className="text-xs text-slate-500">
                Transfer stock from factory to vehicle
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
              <span className="text-blue-600">🚚</span>
              <span className="text-xs font-semibold text-blue-700">
                Stock Loading
              </span>
            </div>
          </div>
        </div>

        {/* 🔹 Vehicle Row */}
        <div className="flex gap-2 p-2 bg-white border-b border-slate-200">

          {/* Route + Vehicle Row */}
          <div className="flex gap-2 p-2 bg-white border-b border-slate-200">

            {/* Route */}
            <div className="flex-1">
              <Controller
                control={form.control}
                name="routeId"
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="h-9 text-sm bg-white border border-slate-300">
                      <SelectValue placeholder="Select Route" />
                    </SelectTrigger>

                    <SelectContent className="z-[100] bg-white border border-slate-200 shadow-lg">
                      {routes.map((route) => (
                        <SelectItem key={route.id} value={route.id}>
                          {route.routeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Vehicle Dropdown */}
            <div className="flex-1">
              <Controller
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="h-9 text-sm bg-white border border-slate-300">
                      <SelectValue placeholder="Select Vehicle" />
                    </SelectTrigger>

                    <SelectContent className="z-[100] bg-white border border-slate-200 shadow-lg">
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Driver */}
            <div className="flex-1">
              <Input
                value={selectedRoute?.salesmanName || ""}
                placeholder="Driver"
                disabled
                className="h-9 text-sm bg-gray-100"
              />
            </div>

          </div>

          <div className="flex-1">
            <Input
              value={
                selectedVehicle?.responsiblePersonName || ""
              }
              placeholder="Driver"
              disabled
              className="h-9 text-sm bg-gray-100"
            />
          </div>
        </div>

        {/* 🔹 Product List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">

          {rows.map((item, index) => (

            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >

              {/* Product name */}
              <div className="font-semibold text-sm text-slate-800">
                {item.productName}
              </div>

              {/* Stock information */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs">

                <span className="text-slate-500">
                  Price:
                  <span className="ml-1 font-semibold text-slate-700">
                    ₹{item.wholesalePrice}
                  </span>
                </span>

                <span className="text-slate-500">
                  Factory:
                  <span className="ml-1 font-semibold text-slate-700">
                    {item.quantity}
                  </span>
                </span>

                <span className="text-blue-600">
                  Van:
                  <span className="ml-1 font-semibold">
                    {item.vanQuantity}
                  </span>
                </span>

                  <Button
    type="button"
    variant="outline"
    size="sm"
    className="h-8 px-2"
    disabled={item.vanQuantity <= 0}
 onClick={() => {
  console.log("EDIT CLICKED:", item.productName);
  setEditingItem(item);
}}
  >
    <Pencil size={14} className="mr-1" />
    Edit
  </Button>

              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">

                <span className="text-xs font-medium text-slate-500">
                  Load Quantity
                </span>

                <Input
                  type="number"
                  min={0}
                  className="h-10 w-28 text-center text-base font-semibold border-slate-300 bg-slate-50"
                  {...form.register(
                    `items.${index}.quantity`,
                    {
                      valueAsNumber: true,
                    }
                  )}
                  onFocus={(e) => {
                    if (e.target.value === "0") {
                      e.target.select();
                    }
                  }}
                />

              </div>

            </div>

          ))}

        </div>

        {/* 🔹 Bottom Bar */}
       <div className="sticky bottom-0 z-20 bg-white border-t border-slate-200 p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">

  <div className="flex items-center justify-between mb-3">

    <div>
      <p className="text-xs text-slate-500">
        Products Selected
      </p>
      <p className="text-lg font-bold text-slate-800">
        {totalProducts}
      </p>
    </div>

    <div className="text-right">
      <p className="text-xs text-slate-500">
        Total Quantity
      </p>
      <p className="text-lg font-bold text-blue-600">
        {totalQuantity}
      </p>
    </div>

  </div>

  <Button
    type="submit"
    disabled={isSubmitting}
    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg"
  >
    {isSubmitting ? "Loading..." : "🚚 Load Vehicle"}
  </Button>

</div>

      </div>

      {editingItem && (
  <EditVanStockDialog
    open={!!editingItem}
    onOpenChange={(open) => {
      if (!open) setEditingItem(null);
    }}
    productName={editingItem.productName}
  currentQuantity={editingItem.vanQuantity}
    onSave={async (newQuantity) => {
      // We will connect the stock update server action here.
    }}
  />
)}
    </form>
  );
}


