
"use client";
// name , category(liqued/non veg, bakery, veg, water, rice,readymade), Favorate,
//  Available, Modify date, Created modify by, Action (view detail in popup, edit)
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";



import { Button } from "@/components/ui/button";
import { newInventorySchema, TnewInventorySchema } from "@/lib/types/InventoryItemType";
import { InventoryCategory } from "@/lib/types/InventoryCategory";
import { SupplierType } from "@/lib/types/SupplierType";
import { addNewInventoryItem } from "@/app/(universal)/action/inventory/addNewInventoryItem";



type Props = {
  categories: InventoryCategory[];
  suppliers: SupplierType[];
};

const UNIT_PAIRS: Record<
  string,
  {
    unit: string;
    factor: number;
  }[]
> = {
  kg: [
    { unit: "kg", factor: 1 },
    { unit: "gm", factor: 1000 },
  ],

  gm: [
    { unit: "gm", factor: 1 },
  ],

  ltr: [
    { unit: "ltr", factor: 1 },
    { unit: "ml", factor: 1000 },
  ],

  ml: [
    { unit: "ml", factor: 1 },
  ],

  dozen: [
    { unit: "dozen", factor: 1 },
    { unit: "pcs", factor: 12 },
    { unit: "bottle", factor: 12 },
    { unit: "can", factor: 12 },
  ],

  pair: [
    { unit: "pair", factor: 1 },
    { unit: "pcs", factor: 2 },
  ],

  carton: [
    { unit: "carton", factor: 1 },
    { unit: "pcs", factor: 24 },
    { unit: "bottle", factor: 24 },
    { unit: "can", factor: 24 },
  ],

  box: [
    { unit: "box", factor: 1 },
    { unit: "pcs", factor: 10 },
  ],

  pack: [
    { unit: "pack", factor: 1 },
    { unit: "pcs", factor: 6 },
  ],

  bag: [
    { unit: "bag", factor: 1 },
    { unit: "gm", factor: 5000 },
  ],

  bottle: [
    { unit: "bottle", factor: 1 },
    { unit: "ml", factor: 1000 },
  ],

  can: [
    { unit: "can", factor: 1 },
    { unit: "ml", factor: 330 },
  ],

  jar: [
    { unit: "jar", factor: 1 },
    { unit: "gm", factor: 500 },
  ],

  tray: [
    { unit: "tray", factor: 1 },
    { unit: "pcs", factor: 30 },
  ],

  roll: [
    { unit: "roll", factor: 1 },
    { unit: "pcs", factor: 1 },
  ],

  pcs: [
    { unit: "pcs", factor: 1 },
  ],
};


export default function NewInventoryForm({
  categories,
  suppliers
}: Props) {

  const [isSubmitting, setIsSubmitting] = useState(false);


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
      //currentStock: 0,
      // minStock: 0,
      // costPrice: 0,
      // sellingPrice: 0,

      // purchaseUnit: "kg",
      // consumptionUnit: "gm",
      //conversionFactor: 1000,

      isActive: true,
    },
  });

  const purchaseUnit = watch("purchaseUnit");
  const consumptionUnit = watch("consumptionUnit");


  // AUTO SET CONSUMPTION UNIT + FACTOR
  useEffect(() => {
    const pairs =
      UNIT_PAIRS[purchaseUnit] || [];

    const selectedPair =
      pairs.find(
        (item) =>
          item.unit ===
          consumptionUnit
      );

    if (selectedPair) {
      setValue(
        "conversionFactor",
        selectedPair.factor
      );
    } else if (pairs.length > 0) {
      setValue(
        "consumptionUnit",
        pairs[0].unit as any
      );

      setValue(
        "conversionFactor",
        pairs[0].factor
      );
    }
  }, [
    purchaseUnit,
    consumptionUnit,
    setValue,
  ]);


  async function onSubmit(data: TnewInventorySchema) {
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

      const result = await addNewInventoryItem(formData);

      if (!result?.errors) {
        reset({
          name: "",
          sku: "",
          barcode: "",
          currentStock: 0,
          minStock: 0,
          costPrice: 0,
          sellingPrice: 0,
          purchaseUnit: "kg",
          consumptionUnit: "gm",
          conversionFactor: 1000,
       //   supplierIds: [],
          isActive: true,
        });
      } else {
        console.error(result.errors);
        alert("Failed to save inventory item");
      }
    } catch (error) {
      console.error(error);
    }

    setIsSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full  p-4 md:p-6"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Create Inventory Item
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage raw materials, stock items and inventory
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* LEFT */}
        <div className="md:col-span-2 flex flex-col gap-5">
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
              <div>  <label className="label-style-4">
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
                </p></div>

              {/* <div>  <label className="label-style-4">
                Supplier
              </label>

                <select
                  {...register("supplierIds")}
                  className="input-style-4 mt-1"
                >
                  <option value="">
                    Select Supplier
                  </option>

                  {suppliers.map((supplier) => (
                    <option
                      key={supplier.id}
                      value={supplier.id}
                    >
                      {supplier.companyName}
                    </option>
                  ))}
                </select>

                <p className="text-xs text-gray-500 mt-1">
                  Group inventory items into categories
                </p></div> */}





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
                    {(
                      UNIT_PAIRS[purchaseUnit] || []
                    ).map((item) => (
                      <option
                        key={item.unit}
                        value={item.unit}
                      >
                        {item.unit}
                      </option>
                    ))}
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
              {/* <div>
                <label className="label-style-4">
                  Current Stock
                </label>

                <input
                  {...register("currentStock")}
                  type="number"
                  placeholder="0"
                  className="input-style-4 mt-1"
                />

                <p className="text-xs text-red-500 mt-1">
                  {errors.currentStock?.message}
                </p>
              </div> */}

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


        </div>

        <div>


          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold mb-4">
              Suppliers
            </h2>

            <div className="space-y-3">
              {suppliers.map(
                (supplier) => (
                  <label
                    key={supplier.id}
                    className="flex items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      value={
                        supplier.id
                      }
                      {...register(
                        "supplierIds"
                      )}
                    />

                    <span>
                      {
                        supplier.companyName
                      }
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Pricing */}
          {/* <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Pricing Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             
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
          </div> */}

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
              Save Inventory
            </h3>

            <p className="text-sm text-gray-500 mt-1 mb-5">
              Save this inventory item to your system
            </p>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-save-4 w-full"
            >
              {isSubmitting
                ? "Saving Inventory..."
                : "Save Inventory Item"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};



