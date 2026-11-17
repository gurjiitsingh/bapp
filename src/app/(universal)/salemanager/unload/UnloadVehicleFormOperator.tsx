
"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Truck, Pencil } from "lucide-react";
 
import { unloadVehicle  } from "@/app/(universal)/action/distribution/unloadVehicle";
import { getStockLocationsAll } from "@/app/(universal)/action/distribution/getStockLocationsAll";

import { VehicleType } from "@/lib/types/distribution/VehicleType";
import { StockLocationType } from "@/lib/types/distribution/StockLocationType";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EditVanStockDialog from "../EditVanStockDialog";
import { DistributionRoute } from "../../action/distribution/sale-route/getRoutes";

 

type UnloadVehicleFormType = {
  vehicleId: string;
  remarks?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
};

 
type Props = {
  vehicles?: VehicleType[];
  factoryStock?: StockLocationType[];
  routes?: DistributionRoute[];
};

type EditingItemType = StockLocationType & {
  vanQuantity: number;
};

export default function UnloadVehicleFormOperator({
  vehicles = [],
  factoryStock = [],
  routes = [],
}: Props) {
  const [factoryData, setFactoryData] =
    useState<StockLocationType[]>(factoryStock);

  const [vanStock, setVanStock] =
    useState<StockLocationType[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editingItem, setEditingItem] =
    useState<EditingItemType | null>(null);

  const form = useForm<UnloadVehicleFormType>({
    defaultValues: {
      vehicleId: "",
      remarks: "",
      items: [],
    },
  });

  const vehicleId = form.watch("vehicleId");

  const selectedVehicle = vehicles.find(
    (v) => v.id === vehicleId
  );

  // =========================
  // Fetch Vehicle Stock
  // =========================

  useEffect(() => {
    let cancelled = false;

    if (!vehicleId) {
      setVanStock([]);
      form.setValue("items", []);
      return;
    }

    const fetchStock = async () => {
      try {
        const result = await getStockLocationsAll({
          locationType: "TRUCK",
          locationRef: vehicleId,
        });

        if (cancelled) return;

        setVanStock(result);

        form.setValue(
          "items",
          result.map((item) => ({
            productId: item.productId,
            quantity: 0,
          }))
        );
      } catch (error) {
        console.error("Fetch Vehicle Stock Error:", error);
        toast.error("Unable to load vehicle stock");
      }
    };

    fetchStock();

    return () => {
      cancelled = true;
    };
  }, [vehicleId, form]);

  // =========================
  // Merge Factory Stock
  // =========================

  const factoryMap = new Map(
    factoryData.map((item) => [
      item.productId,
      item.quantity,
    ])
  );

  const rows = vanStock.map((item) => ({
    ...item,
    factoryQuantity: factoryMap.get(item.productId) ?? 0,
    vanQuantity: item.quantity,
  }));

  // =========================
  // Submit
  // =========================

  const onSubmit = async (data: UnloadVehicleFormType) => {
    if (isSubmitting) return;

    if (!data.vehicleId || !selectedVehicle) {
      return toast.error("Please select a vehicle");
    }

    const items = data.items.filter(
      (item) => Number(item.quantity) > 0
    );

    if (!items.length) {
      return toast.error("Please enter return quantity");
    }

    // =========================
    // Validate Vehicle Stock
    // =========================

    for (const item of items) {
      const stock = vanStock.find(
        (x) => x.productId === item.productId
      );

      if (!stock || item.quantity > stock.quantity) {
        return toast.error(
          `Insufficient vehicle stock for ${
            stock?.productName || item.productId
          }`
        );
      }
    }

    setIsSubmitting(true);

    try {
      console.log("Unload Vehicle Submit:", data);

      const result = await unloadVehicle({
        vehicleId: data.vehicleId,
        vehicleName: selectedVehicle.name,
        locationCode: selectedVehicle.locationCode,
        responsiblePerson:
          selectedVehicle.responsiblePersonName,
        remarks: data.remarks,
        items,
      });

      console.log("Unload Vehicle Result:", result);

      if (!result?.success) {
        toast.error(
          result?.message || "Vehicle return failed"
        );
        return;
      }

      // =========================
      // Update Factory Stock
      // =========================

      setFactoryData((prev) =>
        prev.map((stock) => {
          const returned = items.find(
            (item) => item.productId === stock.productId
          );

          if (!returned) return stock;

          return {
            ...stock,
            quantity: stock.quantity + returned.quantity,
          };
        })
      );

      // =========================
      // Refresh Vehicle Stock
      // =========================

      const updatedVanStock = await getStockLocationsAll({
        locationType: "TRUCK",
        locationRef: data.vehicleId,
      });

      setVanStock(updatedVanStock);

      // =========================
      // Reset Return Quantities
      // =========================

      form.reset({
        vehicleId: data.vehicleId,
        remarks: "",
        items: updatedVanStock.map((item) => ({
          productId: item.productId,
          quantity: 0,
        })),
      });

      toast.success(
        result.message || "Vehicle stock returned successfully"
      );
    } catch (error) {
      console.error("Unload Vehicle Error:", error);

      toast.error(
        "Something went wrong while returning vehicle stock"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // Summary
  // =========================

  const selectedItems = form.watch("items") || [];

  const totalProducts = selectedItems.filter(
    (item) => Number(item.quantity) > 0
  ).length;

  const totalReturnQuantity = selectedItems.reduce(
    (sum, item) =>
      sum + (
        Number.isFinite(item.quantity)
          ? item.quantity
          : 0
      ),
    0
  );

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
      <div className="flex flex-col h-[100dvh] bg-slate-50">

        {/* =========================
            HEADER
        ========================= */}

        <div className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-slate-800">
                Return Vehicle Stock
              </h1>

              <p className="text-xs text-slate-500">
                Transfer remaining stock from vehicle to factory
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2">
              <Truck className="h-4 w-4 text-blue-600" />

              <span className="text-xs font-semibold text-blue-700">
                Stock Return
              </span>
            </div>
          </div>
        </div>

        {/* =========================
            VEHICLE INFORMATION
        ========================= */}

        <div className="flex gap-2 p-2 bg-white border-b border-slate-200">

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
                      <SelectItem
                        key={vehicle.id}
                        value={vehicle.id}
                      >
                        {vehicle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex-1">
            <Input
              value={
                selectedVehicle?.responsiblePersonName || ""
              }
              placeholder="Responsible Person"
              disabled
              className="h-9 text-sm bg-gray-100"
            />
          </div>
          
        </div>

        {/* =========================
            REMARKS
        ========================= */}

        <div className="p-2 bg-white border-b border-slate-200">
          <Textarea
            placeholder="Remarks (optional)"
            className="min-h-9 h-9 resize-none text-sm"
            {...form.register("remarks")}
          />
        </div>

        {/* =========================
            MOBILE PRODUCT LIST
        ========================= */}

        <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 md:hidden">

          {rows.map((item, index) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="font-semibold text-sm text-slate-800">
                {item.productName}
              </div>

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
                    {item.factoryQuantity}
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
                    setEditingItem(item);
                  }}
                >
                  <Pencil size={14} className="mr-1" />
                  Edit
                </Button>
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                <span className="text-xs font-medium text-slate-500">
                  Return Quantity
                </span>

                <Input
                  type="number"
                  min={0}
                  max={item.vanQuantity}
                  step={1}
                  className="h-10 w-28 text-center text-base font-semibold border-slate-300 bg-slate-50"
                  {...form.register(
                    `items.${index}.quantity`,
                    {
                      valueAsNumber: true,
                      min: 0,
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

          {rows.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              {vehicleId
                ? "No products found in vehicle"
                : "Please select a vehicle"}
            </div>
          )}
        </div>

        {/* =========================
            TABLET / DESKTOP PRODUCT LIST
        ========================= */}

        <div className="hidden md:block flex-1 min-h-0 overflow-y-auto p-4">

          <div className="w-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">

            <div className="min-w-[850px]">

              {/* TABLE HEADER */}

              <div className="grid grid-cols-[minmax(200px,2fr)_1fr_1fr_1fr_140px_160px] items-center gap-3 bg-slate-100 border-b border-slate-200 px-5 py-3">

                <div className="text-sm font-bold text-slate-600">
                  Product Name
                </div>

                <div className="text-sm font-bold text-slate-600 text-center">
                  Price
                </div>

                <div className="text-sm font-bold text-slate-600 text-center">
                  Factory Stock
                </div>

                <div className="text-sm font-bold text-blue-700 text-center">
                  Vehicle Stock
                </div>

                <div className="text-sm font-bold text-slate-600 text-center">
                  Action
                </div>

                <div className="text-sm font-bold text-slate-600 text-center">
                  Return Quantity
                </div>
              </div>

              {/* TABLE BODY */}

              {rows.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[minmax(200px,2fr)_1fr_1fr_1fr_140px_160px] items-center gap-3 px-5 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-b-0"
                >
                  <div className="font-semibold text-sm text-slate-800">
                    {item.productName}
                  </div>

                  <div className="text-center text-sm font-semibold text-slate-700">
                    ₹{item.wholesalePrice}
                  </div>

                  <div className="text-center">
                    <span className="inline-flex items-center justify-center min-w-12 rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                      {item.factoryQuantity}
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="inline-flex items-center justify-center min-w-12 rounded-md bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                      {item.vanQuantity}
                    </span>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 w-24 border-blue-200 text-blue-700 hover:bg-blue-50"
                      disabled={item.vanQuantity <= 0}
                      onClick={() => {
                        setEditingItem(item);
                      }}
                    >
                      <Pencil size={15} className="mr-2" />
                      Edit
                    </Button>
                  </div>

                  <div className="flex justify-center">
                    <Input
                      type="number"
                      min={0}
                      max={item.vanQuantity}
                      step={1}
                      className="h-11 w-32 text-center text-base font-bold border-slate-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      {...form.register(
                        `items.${index}.quantity`,
                        {
                          valueAsNumber: true,
                          min: 0,
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

              {rows.length === 0 && (
                <div className="py-12 text-center text-sm text-slate-500">
                  {vehicleId
                    ? "No products found in vehicle"
                    : "Please select a vehicle"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================
            BOTTOM SUMMARY
        ========================= */}

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
                Total Return Quantity
              </p>

              <p className="text-lg font-bold text-blue-600">
                {totalReturnQuantity}
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || !vehicleId}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg"
          >
            {isSubmitting
              ? "Returning..."
              : "↩ Return Stock to Factory"}
          </Button>
        </div>
      </div>

      {/* =========================
          EDIT VEHICLE STOCK DIALOG
      ========================= */}

      {editingItem && (
        <EditVanStockDialog
          open={!!editingItem}
          onOpenChange={(open) => {
            if (!open) setEditingItem(null);
          }}
          productName={editingItem.productName}
          currentQuantity={editingItem.vanQuantity}
          onSave={async (newQuantity) => {
            // Connect the vehicle stock update server action here.
          }}
        />
      )}
    </form>
  );
}
