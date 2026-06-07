
"use client";
// name , category(liqued/non veg, bakery, veg, water, rice,readymade), Favorate,
//  Available, Modify date, Created modify by, Action (view detail in popup, edit)
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { InventoryItemType, newInventorySchema, TnewInventorySchema } from "@/lib/types/InventoryItemType";

import { InventoryCategory } from "@/lib/types/InventoryCategory";
import { SupplierType } from "@/lib/types/SupplierType";
import { updateInventoryItem } from "@/app/(universal)/action/inventory/updateInventoryItem";


type Props = {
    inventoryItem: InventoryItemType;

    categories: InventoryCategory[];

    suppliers: SupplierType[];
};

const InventoryEditForm = ({
    inventoryItem,
    categories,
    suppliers,
}: Props) => {


    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();
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

            purchaseUnit:
                inventoryItem.purchaseUnit,

            consumptionUnit:
                inventoryItem.consumptionUnit,

            conversionFactor:
                inventoryItem.conversionFactor,

            currentStock:
                inventoryItem.currentStock,

            minStock:
                inventoryItem.minStock,

            costPrice:
                inventoryItem.costPrice,

            sellingPrice:
                inventoryItem.sellingPrice || 0,

            categoryId:
                inventoryItem.categoryId || "",

          supplierIds:
  inventoryItem.supplierIds || [],

            isActive:
                inventoryItem.isActive,
        },
    });

    const purchaseUnit = watch("purchaseUnit");
    const consumptionUnit = watch("consumptionUnit");



    const displayStock =
        inventoryItem.purchaseUnit ===
            inventoryItem.consumptionUnit
            ? inventoryItem.currentStock
            : inventoryItem.currentStock /
            inventoryItem.conversionFactor;


    // const displayStock =
    //   purchaseUnit === consumptionUnit
    //     ? inventoryItem.currentStock
    //     : inventoryItem.currentStock /
    //       (watch("conversionFactor") || 1);

    useEffect(() => {
        if (purchaseUnit === consumptionUnit) {
            setValue("conversionFactor", 1);
            return;
        }

        const conversionMap: Record<string, number> = {
            "kg-gm": 1000,
            "ltr-ml": 1000,
            "dozen-pcs": 12,
            "pair-pcs": 2,
            "carton-pcs": 24,
        };

        const key = `${purchaseUnit}-${consumptionUnit}`;

        if (conversionMap[key]) {
            setValue("conversionFactor", conversionMap[key]);
        }
    }, [purchaseUnit, consumptionUnit, setValue]);
    useEffect(() => {
        if (
            purchaseUnit &&
            consumptionUnit &&
            purchaseUnit === consumptionUnit
        ) {
            setValue("conversionFactor", 1);
        }
    }, [purchaseUnit, consumptionUnit]);

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
                "purchaseUnit",
                data.purchaseUnit
            );

            formData.append(
                "consumptionUnit",
                data.consumptionUnit
            );

            formData.append(
                "conversionFactor",
                String(data.conversionFactor)
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
            className="max-w-7xl mx-auto p-4 md:p-6"
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Name */}
                            <div className="md:col-span-2">
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
                            <div>
                                {/* Purchase Unit */}
                                <div>
                                    <label className="label-style-4">
                                        Purchase Unit
                                    </label>

                                    <select
                                        {...register("purchaseUnit")}
                                        className="input-style-4 mt-1"
                                    >
                                        <option value="kg">Kilogram (kg)</option>
                                        <option value="gm">Gram (gm)</option>
                                        <option value="ltr">Liter (ltr)</option>
                                        <option value="ml">Milliliter (ml)</option>
                                        <option value="pcs">Pieces (pcs)</option>
                                        <option value="dozen">Dozen</option>
                                        <option value="pair">Pair</option>
                                        <option value="box">Box</option>
                                        <option value="pack">Pack</option>
                                        <option value="carton">Carton</option>
                                        <option value="bag">Bag</option>
                                        <option value="bottle">Bottle</option>
                                        <option value="can">Can</option>
                                        <option value="jar">Jar</option>
                                        <option value="roll">Roll</option>
                                        <option value="tray">Tray</option>


                                    </select>

                                    <p className="text-xs text-gray-500 mt-1">
                                        Unit used when purchasing stock
                                    </p>
                                </div>

                                {/* Consumption Unit */}
                                <div>
                                    <label className="label-style-4">
                                        Consumption Unit
                                    </label>

                                    <select
                                        {...register("consumptionUnit")}
                                        className="input-style-4 mt-1"
                                    >
                                        <option value="kg">Kilogram (kg)</option>
                                        <option value="gm">Gram (gm)</option>
                                        <option value="ltr">Liter (ltr)</option>
                                        <option value="ml">Milliliter (ml)</option>
                                        <option value="pcs">Pieces (pcs)</option>
                                        <option value="dozen">Dozen</option>
                                        <option value="pair">Pair</option>
                                        <option value="box">Box</option>
                                        <option value="pack">Pack</option>
                                        <option value="carton">Carton</option>
                                        <option value="bag">Bag</option>
                                        <option value="bottle">Bottle</option>
                                        <option value="can">Can</option>
                                        <option value="jar">Jar</option>
                                        <option value="roll">Roll</option>
                                        <option value="tray">Tray</option>
                                    </select>

                                    <p className="text-xs text-gray-500 mt-1">
                                        Unit used in recipes
                                    </p>
                                </div>

                                {/* Conversion Factor */}
                                <div>
                                    <label className="label-style-4">
                                        Conversion Factor
                                    </label>

                                    <input
                                        type="number"
                                        step="0.0001"
                                        {...register("conversionFactor")}
                                        className="input-style-4 mt-1"
                                        placeholder="1000"
                                    />

                                    <p className="text-xs text-gray-500 mt-1">
                                        Example: 1 kg = 1000 gm
                                    </p>

                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.conversionFactor?.message}
                                    </p>
                                </div>
                            </div>

                            {/* Current Stock */}
                            <div>
                                <label className="label-style-4">
                                    Current Stock
                                </label>
                                <div className="text-2xl font-bold text-blue-700">
                                    {displayStock.toFixed(2)} <span className="text-sm text-blue-600"> {purchaseUnit}</span>
                                </div>

                                {/* <div className="mt-1 rounded-xl border border-blue-100 bg-blue-50 p-4">
    <div className="text-2xl font-bold text-blue-700">
      {(
        inventoryItem.currentStock /
        inventoryItem.conversionFactor
      ).toLocaleString()}
    </div>

    <div className="text-sm text-blue-600">
      {inventoryItem.purchaseUnit}
    </div>
  </div> */}
                                <p className="text-xs text-gray-500 mt-1">
                                    Stock quantity can only be changed through Stock Adjustment transactions.
                                </p>
                                {/* <p className="text-xs text-gray-500 mt-1">
    Stored as {inventoryItem.currentStock}{" "}
    {inventoryItem.consumptionUnit}
  </p> */}
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

                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">

                            {suppliers.length > 0 ? (
                                suppliers.map((supplier) => (
                                    <label
                                        key={supplier.id}
                                        className="
            flex items-center gap-3
            rounded-xl border border-gray-100
            px-3 py-3
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
                                            <p className="font-medium text-sm text-gray-800">
                                                {supplier.companyName}
                                            </p>

                                            <p className="text-xs text-gray-500">
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




                    {/* Pricing */}
                    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Pricing Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Cost Price */}
                            <div>
                                <label className="label-style-4">
                                    Cost Price
                                </label>

                                <input
                                    {...register("costPrice")}
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    className="input-style-4 mt-1"
                                />

                                <p className="text-xs text-red-500 mt-1">
                                    {errors.costPrice?.message}
                                </p>
                            </div>

                            {/* Suppliers */}
                            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-800">
                                            Suppliers
                                        </h2>

                                        <p className="text-sm text-gray-500 mt-1">
                                            Link suppliers who provide this item
                                        </p>
                                    </div>

                                    <div className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                        {watch("supplierIds")?.length || 0} Selected
                                    </div>
                                </div>




                            </div>

                            {/* Selling Price */}
                            <div>
                                <label className="label-style-4">
                                    Selling Price
                                </label>

                                <input
                                    {...register("sellingPrice")}
                                    type="number"
                                    step="0.01"
                                    placeholder="0"
                                    className="input-style-4 mt-1"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col gap-5">
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

