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
      <div className="flex flex-col h-screen bg-gray-50">

        {/* 🔹 Header */}
        <div className="p-3 bg-white border-b border-slate-200 sticky top-0 z-10">
          <h1 className="text-lg font-semibold">
            Load Vehicle
          </h1>
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
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {rows.map((item, index) => (
            <div
              key={item.id}
              className="border border-slate-200 rounded-lg p-2 bg-white"
            >
              {/* Row 1 */}
              <div className="flex justify-between text-sm font-medium">
                <span>{item.productName}</span>

                <div className="flex gap-2 text-xs text-gray-500">
                  <span>₹ {item.wholesalePrice}</span>
                  <span>Stock: {item.quantity}</span>
                </div>
              </div>

              {/* Row 2 */}
              <div className="flex items-center justify-between mt-1 text-xs gap-2">
                <span>Van: {item.vanQuantity}</span>

              <Input
  type="number"
  min={0}
  //max={item.quantity}
  className="h-8 w-26 border border-slate-200 text-center"
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

                <span className="text-red-500">🗑</span>
              </div>
            </div>
          ))}
        </div>
 
        {/* 🔹 Bottom Bar */}
        <div className="p-3 bg-white border-t border-slate-200 sticky bottom-0">
          <div className="flex justify-between text-sm mb-2">
            <span>Items: {totalProducts}</span>
            <span>Qty: {totalQuantity}</span>
          </div>

        <Button
  type="submit"
  disabled={isSubmitting}
  className="w-full h-10 bg-slate-200"
>
  {isSubmitting ? "Loading..." : "🚚 Load Vehicle"}
</Button>
        </div>

      </div>
    </form>
  );
}


// "use client";

// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Textarea } from "@/components/ui/textarea";
// import { Plus, Trash2, Truck } from "lucide-react";

// import { StockLocationType } from "@/lib/types/distribution/StockLocationType";
// import { Controller, useForm } from "react-hook-form";
// import { loadVehicle } from "@/app/(universal)/action/distribution/loadVehicle";
// import { VehicleType } from "@/lib/types/distribution/VehicleType";
// import { useEffect, useState } from "react";
// import { getStockLocationsAll } from "@/app/(universal)/action/distribution/getStockLocationsAll";
// import toast from "react-hot-toast";


// type LoadVehicleFormType = {
//   vehicleId: string;
//   remarks?: string;
//   name: string;

//   items: {
//     productId: string;
//     quantity: number;
//     wholesalePrice:number;
//   }[];
// };

// type Props = {
//   vehicles: VehicleType[];
//   factoryStock: StockLocationType[];
// };

// export default function LoadVehicleFormOeprator({
//   factoryStock,
//   vehicles,
// }: Props) {




//   const form = useForm<LoadVehicleFormType>({
//     defaultValues: {
//       vehicleId: "",
//       remarks: "",
//    items: factoryStock.map((item)=>({
//   productId:item.productId,
//   quantity:0,
//   wholesalePrice:item.wholesalePrice,
// }))
//     },
//   });



//   const vehicleId = form.watch("vehicleId");
//   console.log("vehicleId:", vehicleId);
//   const [factoryData, setFactoryData] =
//     useState<StockLocationType[]>(factoryStock);

//   const [vanStock, setVanStock] =
//     useState<StockLocationType[]>([]);

//   const fetchVanStock = async (vanId: string) => {
//     console.log("vehicleId =", vehicleId);
//     if (!vanId) {
//       setVanStock([]);
//       return;
//     }

//     const result = await getStockLocationsAll({
//       locationType: "TRUCK",
//       locationRef: vanId,
//     });

//     setVanStock(result);
//   };

//   useEffect(() => {
//     fetchVanStock(vehicleId);
//   }, [vehicleId]);

//   const selectedVehicle = vehicles.find(
//     (v) => v.id === vehicleId
//   );
//   console.log("selectedVehicle:", selectedVehicle);

//   const vanMap = new Map(
//     vanStock.map((x) => [x.productId, x.quantity])
//   );

//   const rows = factoryData.map((item) => ({
//     ...item,
//     vanQuantity: vanMap.get(item.productId) ?? 0,
//   }));

//   const onSubmit = async (data: LoadVehicleFormType) => {

//     const items = data.items.filter((x) => x.quantity > 0);



//     if (!data.vehicleId) {
//       toast.error("Please select a vehicle.");
//       return;
//     }

//     if (!selectedVehicle?.name) {
//       toast.error("Selected vehicle not found.");
//       return;
//     }

//     if (items.length === 0) {
//       toast.error("Please enter at least one quantity.");
//       return;
//     }

//     const result = await loadVehicle({
//       vehicleId: data.vehicleId,
//       vehicleName: selectedVehicle.name,
//       locationCode: selectedVehicle.locationCode,
//       responsiblePerson: selectedVehicle.responsiblePersonName,
//       remarks: data.remarks,
//       items,
//     });

//     console.log(result);

//     if (!result.success) {
//       toast.error(result.message);
//       return;
//     }

//     // ==========================
//     // Update Factory Stock
//     // ==========================

//     setFactoryData((prev) =>
//       prev.map((stock) => {
//         const loaded = items.find(
//           (i) => i.productId === stock.productId
//         );

//         if (!loaded) return stock;

//         return {
//           ...stock,
//           quantity: stock.quantity - loaded.quantity,
//         };
//       })
//     );

//     // ==========================
//     // Update Van Stock
//     // ==========================

//     setVanStock((prev) => {
//       const updated = [...prev];

//       for (const loaded of items) {
//         const index = updated.findIndex(
//           (x) => x.productId === loaded.productId
//         );

//         if (index >= 0) {
//           updated[index] = {
//             ...updated[index],
//             quantity:
//               updated[index].quantity + loaded.quantity,
//           };
//         } else {
//           const product = factoryData.find(
//             (x) => x.productId === loaded.productId
//           );

//           if (product) {
//             updated.push({
//               ...product,
//               id: `${product.productId}_VAN_${data.vehicleId}`,
//               locationType: "TRUCK",
//               locationRef: data.vehicleId,
//               quantity: loaded.quantity,
//               wholesalePrice: loaded.wholesalePrice,
//             });
//           }
//         }
//       }

//       return updated;
//     });

//     toast.success(result.message);

//     await fetchVanStock(data.vehicleId);

//     form.reset({
//       vehicleId: data.vehicleId,
//       remarks: "",
//    items: factoryData.map((item)=>({
//   productId:item.productId,
//   quantity:0,
//   wholesalePrice:item.wholesalePrice,
// }))
//     });
//   };

// const selectedItems = form.watch("items");

// const totalProducts = selectedItems.filter(
//   (item) => item.quantity > 0
// ).length;

// const totalQuantity = selectedItems.reduce(
//   (sum, item) =>
//     sum + (item.quantity || 0),
//   0
// );

//  return (
//   <form onSubmit={form.handleSubmit(onSubmit)}>
//     <div className="p-3 bg-white min-h-screen space-y-4 text-sm">

//       {/* Header */}
//       <div>
//         <h1 className="text-lg font-semibold">Load Vehicle</h1>
//         <p className="text-xs text-gray-500">
//           Transfer products
//         </p>
//       </div>

//       {/* Vehicle Select */}
//     <div className="flex items-center gap-2">

//   {/* Label */}
//   <label className="text-xs text-gray-500 whitespace-nowrap">
//     Vehicle
//   </label>

//   {/* Vehicle Select */}
//   <div className="flex-1">
//     <Controller
//       control={form.control}
//       name="vehicleId"
//       render={({ field }) => (
//         <Select
//           value={field.value}
//           onValueChange={field.onChange}
//         >
//           <SelectTrigger className="h-9 text-sm">
//             <SelectValue placeholder="Select Vehicle" />
//           </SelectTrigger>

//           <SelectContent>
//             {vehicles.map((v) => (
//               <SelectItem key={v.id} value={v.id}>
//                 {v.name}
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       )}
//     />
//   </div>

//   {/* Driver */}
//   <div className="flex-1">
//     <Input
//       value={selectedVehicle?.responsiblePersonName || ""}
//       placeholder="Driver"
//       disabled
//       className="h-9 text-sm bg-gray-100"
//     />
//   </div>

// </div>

//       {/* Products */}
//       <div className="space-y-3">

//    {rows.map((item, index) => (
//   <div key={item.id} className="border border-slate-200 rounded-lg p-2 space-y-1">
    
//     {/* 🔹 Row 1 */}
//     <div className="flex justify-between text-sm font-medium">
//       <span>{item.productName}</span>

//       <div className="flex gap-3 text-xs text-gray-600">
//         <span>₹ {item.wholesalePrice}</span>
//         <span>Stock: {item.quantity}</span>
//       </div>
//     </div>

//     {/* 🔹 Row 2 */}
//     <div className="flex items-center justify-between text-xs gap-2">
      
//       <span>Van: {item.vanQuantity}</span>

//       <Input
//         type="number"
//         min={0}
//         max={item.quantity}
//         className="h-8 w-26 text-center border border-slate-200 text-xs"
//         {...form.register(`items.${index}.quantity`, {
//           valueAsNumber: true,
//         })}
//       />

//       <Button size="icon" variant="ghost" className="h-8 w-8">
//         🗑
//       </Button>
//     </div>

//   </div>
// ))}

//       </div>

//       {/* Summary */}
//       <div className="flex justify-between text-sm pt-2 border-t">
//         <div>
//           <p>Items: {totalProducts}</p>
//           <p>Qty: {totalQuantity}</p>
//         </div>

//         <Button
//           type="submit"
//           className="h-9 px-4"
//         >
//           Load
//         </Button>
//       </div>

//     </div>
//   </form>
// );
// }