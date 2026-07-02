
"use client";
// name , category(liqued/non veg, bakery, veg, water, rice,readymade), Favorate,
//  Available, Modify date, Created modify by, Action (view detail in popup, edit)
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";



import { Button } from "@/components/ui/button";
import { newInventorySchema, TnewInventorySchema } from "@/lib/types/InventoryItemType";
import { InventoryCategory } from "@/lib/types/InventoryCategory";
import { SupplierType } from "@/lib/types/SupplierType";
import { addNewInventoryItem } from "@/app/(universal)/action/inventory/addNewInventoryItem";
import { UnitConversion } from "@/lib/types/UnitConversion";
import Link from "next/link";




type Props = {
  categories: InventoryCategory[];
  suppliers: SupplierType[];
  unitConversions: UnitConversion[];
};

export default function NewInventoryForm({
  categories,
  suppliers,
  unitConversions,
}: Props) {
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const {
    register,
    watch,
    setValue,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm<TnewInventorySchema>({
    resolver: zodResolver(
      newInventorySchema
    ),

    defaultValues: {
      isActive: true,
    },
  });



  const purchaseUnit = watch("purchaseUnit");
  const consumptionUnit =
    watch("consumptionUnit");

  // =====================================
  // PURCHASE UNITS
  // =====================================

  const purchaseUnits = useMemo(
    () =>
      Array.from(
        new Set(
          unitConversions
            .filter(
              (item) =>
                item.isActive !== false
            )
            .map(
              (item) =>
                item.purchaseUnit
            )
        )
      ),
    [unitConversions]
  );

  // =====================================
  // AVAILABLE CONVERSIONS
  // =====================================

  const availableConversions =
    useMemo(
      () =>
        unitConversions.filter(
          (item) =>
            item.purchaseUnit ===
            purchaseUnit &&
            item.isActive !== false
        ),
      [
        unitConversions,
        purchaseUnit,
      ]
    );




  // =====================================
  // SET DEFAULT PURCHASE UNIT
  // =====================================

  useEffect(() => {
    if (
      !purchaseUnit &&
      purchaseUnits.length > 0
    ) {
      setValue(
        "purchaseUnit",
        purchaseUnits[0]
      );
    }
  }, [
    purchaseUnit,
    purchaseUnits,
    setValue,
  ]);

  // =====================================
  // AUTO SET CONSUMPTION UNIT + FACTOR
  // =====================================

  useEffect(() => {
    if (
      availableConversions.length === 0
    ) {
      return;
    }

    const selectedConversion =
      availableConversions.find(
        (item) =>
          item.consumptionUnit ===
          consumptionUnit
      );

    if (selectedConversion) {
      setValue(
        "conversionFactor",
        selectedConversion.factor
      );
    } else {
      setValue(
        "consumptionUnit",
        availableConversions[0]
          .consumptionUnit
      );

      setValue(
        "conversionFactor",
        availableConversions[0]
          .factor
      );
    }
  }, [
    consumptionUnit,
    availableConversions,
    setValue,
  ]);

  // =====================================
  // SUBMIT
  // =====================================



  async function onSubmit(
    data: TnewInventorySchema
  ) {
    const selectedConversion =
      unitConversions.find(
        (x) =>
          x.purchaseUnit === data.purchaseUnit &&
          x.consumptionUnit === data.consumptionUnit
      );

    if (!selectedConversion) {
      alert("Invalid unit conversion");
      return;
    }

    setIsSubmitting(true);

    const supplierIds = Array.isArray(data.supplierIds)
      ? data.supplierIds
      : data.supplierIds
        ? [data.supplierIds]
        : [];



    try {
      const formData = new FormData();

      formData.append(
        "name",
        data.name
      );

      formData.append(
        "sku",
        data.sku || ""
      );

      formData.append(
        "barcode",
        data.barcode || ""
      );

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
        String(
          data.conversionFactor
        )
      );

      formData.append(
        "currentStock",
        String(
          data.currentStock ?? 0
        )
      );

      formData.append(
        "minStock",
        String(
          data.minStock ?? 0
        )
      );

      formData.append(
        "costPrice",
        String(
          data.costPrice ?? 0
        )
      );

      formData.append(
        "sellingPrice",
        String(
          data.sellingPrice ?? 0
        )
      );

      formData.append(
        "categoryId",
        data.categoryId || ""
      );

      supplierIds.forEach((supplierId) => {
        formData.append("supplierIds", supplierId);
      });

      formData.append(
        "isActive",
        data.isActive
          ? "true"
          : "false"
      );

      const result =
        await addNewInventoryItem(
          formData
        );

      if (!result?.errors) {
        reset({
          name: "",
          sku: "",
          barcode: "",
          currentStock: 0,
          minStock: 0,
          costPrice: 0,
          sellingPrice: 0,

          purchaseUnit:
            purchaseUnits[0] || "",

          consumptionUnit:
            unitConversions.find(
              (x) =>
                x.purchaseUnit ===
                purchaseUnits[0]
            )?.consumptionUnit || "",

          conversionFactor:
            unitConversions.find(
              (x) =>
                x.purchaseUnit ===
                purchaseUnits[0]
            )?.factor || 1,

          supplierIds: [],
          isActive: true,
        });
      } else {
        console.error(
          result.errors
        );

        alert(
          "Failed to save inventory item"
        );
      }
    } catch (error) {
      console.error(error);
    }

    setIsSubmitting(false);
  }

  const values = watch();

  useEffect(() => {
    console.log(
      "FORM VALUES ================="
    );

    console.log(values);
  }, [values]);

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit,
        (errors) => {
          console.log(
            "FORM VALIDATION ERRORS ================="
          );

          console.log(errors);

          Object.entries(errors).forEach(
            ([key, value]) => {
              console.log(key, value?.message);
            }
          );
        }
      )}
    >
      {/* Header */}
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

              {/* Purchase Unit */}
              <div>
                <label className="label-style-4">
                  Purchase Unit
                </label>

                <select
                  {...register("purchaseUnit")}
                  className="input-style-4 mt-1"
                >
                  <option value="">
                    Select Purchase Unit
                  </option>

                  {purchaseUnits.map((unit) => (
                    <option
                      key={unit}
                      value={unit}
                    >
                      {unit.toUpperCase()}
                    </option>
                  ))}
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
                  {availableConversions.length === 0 ? (
                    <option value="">
                      Select Purchase Unit First
                    </option>
                  ) : (
                    availableConversions.map(
                      (conversion) => (
                        <option
                          key={`${conversion.purchaseUnit}-${conversion.consumptionUnit}`}
                          value={
                            conversion.consumptionUnit
                          }
                        >
                          {conversion.consumptionUnit.toUpperCase()}
                        </option>
                      )
                    )
                  )}
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
                  Auto-filled from unit conversion setup
                </p>

                <p className="text-xs text-red-500 mt-1">
                  {errors.conversionFactor?.message}
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

  {suppliers.length === 0 ? (
    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
      <h3 className="text-lg font-semibold text-gray-800">
        No Suppliers Found
      </h3>

      <p className="mt-2 text-sm text-gray-500">
        You haven't added any suppliers yet. Add a supplier first to link it with this inventory item.
      </p>

      <Link
        href="/admin/inventory/supplier/new"
        className="inline-flex mt-5 items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700 transition"
      >
        + Add New Supplier
      </Link>
    </div>
  ) : (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
        {suppliers.map((supplier) => (
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
              checked={
                watch("supplierIds")?.includes(supplier.id) || false
              }
              onChange={(e) => {
                const checked = e.target.checked;
                const value = supplier.id;

                const current = watch("supplierIds") || [];

                if (checked) {
                  setValue("supplierIds", [...current, value]);
                } else {
                  setValue(
                    "supplierIds",
                    current.filter((v) => v !== value)
                  );
                }
              }}
              className="h-4 w-4 rounded border-gray-300 shrink-0"
            />

            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs text-gray-800 truncate leading-tight">
                {supplier.companyName}
              </p>

              <p className="text-[11px] text-gray-500 truncate leading-tight">
                {supplier.phone || "No phone"}
              </p>
            </div>
          </label>
        ))}
      </div>

      {errors.supplierIds && (
        <p className="text-red-500 text-sm mt-2">
          {errors.supplierIds.message}
        </p>
      )}
    </>
  )}
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



