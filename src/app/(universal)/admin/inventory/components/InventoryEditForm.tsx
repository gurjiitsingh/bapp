
"use client";
// name , category(liqued/non veg, bakery, veg, water, rice,readymade), Favorate,
//  Available, Modify date, Created modify by, Action (view detail in popup, edit)
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { InventoryItemType, newInventorySchema, TnewInventorySchema } from "@/lib/types/InventoryItemType";
import { InventoryCategory } from "@/lib/types/InventoryCategory";
import { SupplierType } from "@/lib/types/SupplierType";
import { updateInventoryItem } from "@/app/(universal)/action/inventory/updateInventoryItem";
import { displayStock } from "@/utils/inventory/displayStock";
import { UnitConversion } from "@/lib/types/UnitConversion";

type Props = {
    inventoryItem: InventoryItemType;
    categories: InventoryCategory[];
    suppliers: SupplierType[];
    unitConversions: UnitConversion[];
};

const InventoryEditForm = ({
    inventoryItem,
    categories,
    suppliers,
    unitConversions,
}: Props) => {

    console.log("inventoryItem----------", inventoryItem)
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    const [selectedConversions, setSelectedConversions] =
        useState<string[]>([]);

    const {
        register,
        watch,
        setValue,
        formState: { errors },
        handleSubmit,
        reset,
    } = useForm<TnewInventorySchema>({
        resolver: zodResolver(newInventorySchema),
        defaultValues: {
            name: inventoryItem.name,

            sku: inventoryItem.sku || "",
            barcode: inventoryItem.barcode || "",

            // purchaseMappings:
            //     inventoryItem.purchaseMappings?.length
            //         ? inventoryItem.purchaseMappings
            //         : [
            //             {
            //                 purchaseUnit: inventoryItem.consumptionUnit,
            //                 factor: 1,
            //             },
            //         ],

            purchaseMappings: [
                {
                    purchaseUnit: inventoryItem.consumptionUnit,
                    factor: 1,
                },
            ],

            consumptionUnit:
                inventoryItem.consumptionUnit,

            currentStock:
                inventoryItem.currentStock!,

            minStock:
                inventoryItem.minStock!,

            // costPrice:
            //     inventoryItem.costPrice,

            // sellingPrice:
            //     inventoryItem.sellingPrice || 0,

            categoryId:
                inventoryItem.categoryId || "",

            supplierIds:
                inventoryItem.supplierIds || [],

            isActive:
                inventoryItem.isActive,
        },
    });


    const purchaseMappings = watch("purchaseMappings");
    const consumptionUnit = watch("consumptionUnit");

    const selectedCategory = categories.find(
        (cat) =>
            cat.id === watch("categoryId")
    );

    const primaryMapping =
        inventoryItem.purchaseMappings?.[0];

    const displayStockValue = displayStock(
        inventoryItem.currentStock!,
        primaryMapping?.purchaseUnit ??
        inventoryItem.consumptionUnit,
        inventoryItem.consumptionUnit,
        primaryMapping?.factor ?? 1
    );

    const consumptionUnits = useMemo(
        () =>
            Array.from(
                new Set(
                    unitConversions
                        .filter((u) => u.isActive !== false)
                        .map((u) => u.consumptionUnit)
                )
            ).sort(),
        [unitConversions]
    );

    const availableMappings = useMemo(() => {
        return unitConversions
            .filter(
                (u) =>
                    u.consumptionUnit === consumptionUnit &&
                    u.isActive !== false
            )
            .sort((a, b) =>
                a.purchaseUnit.localeCompare(b.purchaseUnit)
            );
    }, [unitConversions, consumptionUnit]);

    useEffect(() => {
        if (!inventoryItem.purchaseMappings?.length) return;

        const selectedIds = unitConversions
            .filter((conversion) =>
                inventoryItem.purchaseMappings.some(
                    (mapping) =>
                        mapping.purchaseUnit === conversion.purchaseUnit &&
                        mapping.consumptionUnit === conversion.consumptionUnit &&
                        mapping.factor === conversion.factor
                )
            )
            .map((conversion) => conversion.id);

        setSelectedConversions(selectedIds);
    }, [inventoryItem, unitConversions]);


    useEffect(() => {
        const mappings = unitConversions
            .filter((item) =>
                selectedConversions.includes(item.id)
            )
            .map((item) => ({
                purchaseUnit: item.purchaseUnit,
                consumptionUnit: item.consumptionUnit,
                factor: item.factor,
            }));

        setValue("purchaseMappings", mappings);
    }, [
        selectedConversions,
        unitConversions,
        setValue,
    ]);

    useEffect(() => {
        setSelectedConversions([]);
    }, [consumptionUnit]);


    useEffect(() => {
  if (!inventoryItem.purchaseMappings?.length) return;

  const selectedIds = unitConversions
    .filter((conversion) =>
      inventoryItem.purchaseMappings.some(
        (mapping) =>
          mapping.purchaseUnit === conversion.purchaseUnit &&
          mapping.consumptionUnit === conversion.consumptionUnit &&
          mapping.factor === conversion.factor
      )
    )
    .map((conversion) => conversion.id);

  setSelectedConversions(selectedIds);
}, [inventoryItem, unitConversions]);

    async function onSubmit(
        data: TnewInventorySchema
    ) {
        if (isSubmitting) return;

        setIsSubmitting(true);


        try {
            const formData = new FormData();

            formData.append("name", data.name);
            formData.append("sku", data.sku || "");
            formData.append("barcode", data.barcode || "");


            formData.append(
                "consumptionUnit",
                data.consumptionUnit
            );

            formData.append(
                "purchaseMappings",
                JSON.stringify(data.purchaseMappings)
            );
            formData.append(
                "currentStock",
                String(data.currentStock ?? 0)
            );

            formData.append(
                "minStock",
                String(data.minStock ?? 0)
            );

            formData.append(
                "costPrice",
                String(data.costPrice ?? 0)
            );

            formData.append(
                "sellingPrice",
                String(data.sellingPrice ?? 0)
            );

            formData.append(
                "categoryId",
                data.categoryId || ""
            );

            data.supplierIds?.forEach(
                (supplierId) => {
                    formData.append(
                        "supplierIds",
                        supplierId
                    );
                }
            );

            formData.append(
                "isActive",
                data.isActive ? "true" : "false"
            );


            const result =
                await updateInventoryItem(
                    inventoryItem.id,
                    formData
                );


            if (!result?.errors) {
                // alert(
                //     "Inventory item updated successfully"
                // );
            } else {
                alert(
                    result.errors.general ||
                    "Failed to update inventory item"
                );
            }
            if (!result?.errors) {
                // alert(
                //     "Inventory item updated successfully"
                // );

                router.push("/admin/inventory");
                router.refresh();
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }


    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className=" w-full  p-4 md:p-6"
        >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Update Inventory Item
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Manage raw materials, stock items and inventory
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                {/* LEFT */}
                <div className="xl:col-span-2 flex flex-col gap-5">
                    {/* Inventory Details */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Inventory Details
                        </h2>

                        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div className="md:col-span-1">
                                <label className="label-style-4">
                                    Item Name
                                </label>

                                <input
                                    {...register("name")}
                                    placeholder="e.g. Burger Bun"
                                    className="input-style-4 mt-1"
                                />

                                <p className="text-xs text-red-500 mt-1">
                                    {errors.name?.message}
                                </p>
                            </div>

                            {/* Current Stock */}
                            <div>
                                <label className="label-style-4">
                                    Category
                                </label>

                                <select
                                    {...register("categoryId")}
                                    className="input-style-4 mt-1"
                                >
                                    <option value="">
                                        Select Category
                                    </option>

                                    {categories.map((category) => (
                                        <option
                                            key={category.id}
                                            value={category.id}
                                        >
                                            {category.name}
                                        </option>
                                    ))}
                                </select>

                                {selectedCategory && (
                                    <div className="mt-2">
                                        <span
                                            className="
                inline-flex items-center
                rounded-full
                bg-blue-50
                text-blue-700
                px-3 py-1
                text-xs
                font-medium
            "
                                        >
                                            Selected:
                                            {" "}
                                            {selectedCategory.name}
                                        </span>
                                    </div>
                                )}

                                <p className="text-xs text-gray-500 mt-1">
                                    Group inventory items into categories
                                </p>

                            </div>

                            {/* SKU */}
                            <div>
                                <label className="label-style-4">
                                    SKU
                                </label>

                                <input
                                    {...register("sku")}
                                    placeholder="Optional SKU"
                                    className="input-style-4 mt-1"
                                />
                            </div>

                            {/* Barcode */}
                            <div>
                                <label className="label-style-4">
                                    Barcode
                                </label>

                                <input
                                    {...register("barcode")}
                                    placeholder="Barcode"
                                    className="input-style-4 mt-1"
                                />
                            </div>

                            {/* Unit */}



                            {/* Consumption Unit */}
                            <div>
                                <label className="label-style-4">
                                    Consumption Unit
                                </label>

                                <select
                                    {...register("consumptionUnit")}
                                    className="input-style-4 mt-1"
                                >
                                    <option value="">
                                        Select Consumption Unit
                                    </option>

                                    {consumptionUnits.map((unit) => (
                                        <option
                                            key={unit}
                                            value={unit}
                                        >
                                            {unit.toUpperCase()}
                                        </option>
                                    ))}
                                </select>

                                <p className="text-xs text-gray-500 mt-1">
                                    Unit used in recipes
                                </p>
                            </div>



                            {/* Min Stock */}
                            <div>
                                <label className="label-style-4">
                                    Minimum Stock Alert
                                </label>

                                <input
                                    {...register("minStock")}
                                    type="number"
                                    placeholder="0"
                                    className="input-style-4 mt-1"
                                />

                                <p className="text-xs text-red-500 mt-1">
                                    {errors.minStock?.message}
                                </p>
                            </div>
                        </div>


                    </div>


                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Supplier Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">

                                {suppliers.length > 0 ? (
                                    suppliers.map((supplier) => (

                                        <label
                                            key={supplier.id}
                                            className="
        flex items-center gap-2
        rounded-lg border border-gray-100
        px-2 py-2
        hover:bg-slate-50
        cursor-pointer
        transition
    "
                                        >
                                            <input
                                                type="checkbox"
                                                value={supplier.id}
                                                {...register("supplierIds")}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />

                                            <div className="flex-1">
                                                <p className="font-medium text-xs text-gray-800 leading-tight">
                                                    {supplier.companyName}
                                                </p>

                                                <p className="text-[11px] text-gray-500 leading-tight">
                                                    {supplier.phone || "No phone"}
                                                </p>
                                            </div>
                                        </label>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-400 text-center py-6">
                                        No suppliers found
                                    </div>
                                )}

                            </div>

                        </div>
                    </div>

 {/* Status Card */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Settings
                        </h2>

                        <div className="flex items-center gap-3">
                            <input
                                {...register("isActive")}
                                type="checkbox"
                                className="h-4 w-4"
                            />

                            <label className="label-style-4">
                                Active Inventory Item
                            </label>
                        </div>
                    </div>


                </div>

                {/* RIGHT */}
                <div className="flex flex-col gap-5">

                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Purchase Unit Mapping
                        </h2>

                        <table className="w-full">
                            <thead className="bg-gray-100  ">
                                <tr>
                                    <th className="p-3 text-left">Select</th>
                                    <th className="p-3 text-left">Purchase Unit</th>
                                    <th className="p-3 text-left">Consumption Unit</th>
                                    <th className="p-3 text-right">Factor</th>
                                </tr>
                            </thead>

                            <tbody>
                                {availableMappings.map((conversion) => (
                                    <tr
                                        key={conversion.id}
                                        className="whitespace-nowrap hover:bg-green-50  transition rounded-xl"
                                    >
                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedConversions.includes(
                                                    conversion.id
                                                )}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedConversions((prev) => [
                                                            ...prev,
                                                            conversion.id,
                                                        ]);
                                                    } else {
                                                        setSelectedConversions((prev) =>
                                                            prev.filter(
                                                                (id) => id !== conversion.id
                                                            )
                                                        );
                                                    }
                                                }}
                                            />
                                        </td>

                                        <td className="p-3">
                                            {conversion.purchaseUnit}
                                        </td>

                                        <td className="p-3">
                                            {conversion.consumptionUnit}
                                        </td>

                                        <td className="p-3 text-right">
                                            {conversion.factor}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {purchaseMappings?.length === 0 && (
                            <p className="text-red-500 text-sm mt-3">
                                Please select at least one purchase unit.
                            </p>
                        )}
                    </div>

                   

                    {/* Save */}
                    <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-2xl shadow-sm p-5">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Update Inventory
                        </h3>

                        <p className="text-sm text-gray-500 mt-1 mb-5">
                            Update this inventory item in your system
                        </p>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-save-4 w-full"
                        >
                            {isSubmitting
                                ? "Updating Inventory..."
                                : "Update Inventory Item"}
                        </Button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default InventoryEditForm;





