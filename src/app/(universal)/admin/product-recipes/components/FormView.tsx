"use client";

import React, {
  useEffect,
  useState,
} from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  ChefHat,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  ProductRecipeType,
  TnewProductRecipeSchema,
  newProductRecipeSchema,
} from "@/lib/types/ProductRecipeType";

import { ProductType } from "@/lib/types/productType";

import { InventoryItemType } from "@/lib/types/InventoryItemType";

import { addProductRecipe } from "@/app/(universal)/action/productRecipes/dbOperations";

type Props = {
  products: ProductType[];

  inventoryItems: InventoryItemType[];
};

export default function FormView({
  products,
  inventoryItems,
}: Props) {

  console.log("products---------------",products)
  console.log("inventoryItemss---------------",inventoryItems)
  const [isSubmitting, setIsSubmitting] =
    useState(false);

    const [productSearch, setProductSearch] =
  useState("");

const [showProducts, setShowProducts] =
  useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TnewProductRecipeSchema>({
    resolver: zodResolver(
      newProductRecipeSchema
    ),
  });

  const selectedInventoryId = watch(
    "inventoryItemId"
  );

  // AUTO SET UNIT
  useEffect(() => {
    if (!selectedInventoryId) return;

    const inventory =
      inventoryItems.find(
        (item) =>
          item.id === selectedInventoryId
      );

    if (inventory) {
      setValue("unit", inventory.unit);
    }
  }, [
    selectedInventoryId,
    inventoryItems,
    setValue,
  ]);

  async function onSubmit(
    data: TnewProductRecipeSchema
  ) {
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append(
        "productId",
        data.productId
      );

      formData.append(
        "inventoryItemId",
        data.inventoryItemId
      );

      formData.append(
        "quantity",
        String(data.quantity)
      );

      formData.append(
        "unit",
        data.unit
      );

      const result =
        await addProductRecipe(
          formData
        );

      if (!result?.errors) {
        alert(
          "Recipe ingredient added"
        );

        reset({
          quantity: 0,
        });
      }
    } catch (error) {
      console.error(error);

      alert("Something went wrong");
    }

    setIsSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* HEADER */}
          <div className="border-b border-gray-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center">
                <ChefHat
                  className="text-rose-600"
                  size={22}
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Product Recipe
                </h1>

                <p className="text-sm text-gray-500">
                  Connect product with
                  inventory ingredients
                </p>
              </div>
            </div>
          </div>

          {/* FORM */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 flex flex-col gap-5"
          >
            {/* PRODUCT */}
            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Product
              </label>

     <div className="relative">
  {/* SEARCH INPUT */}
  <input
    type="text"
    value={productSearch}
    onChange={(e) => {
      setProductSearch(
        e.target.value
      );

      setShowProducts(true);
    }}
    onFocus={() =>
      setShowProducts(true)
    }
    placeholder="Search product..."
    className="input-style-4"
  />

  {/* HIDDEN RHF INPUT */}
  <input
    type="hidden"
    {...register("productId")}
  />

  {/* DROPDOWN */}
  {showProducts && (
    <div className="absolute z-50 mt-2 w-full max-h-72 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">
      {products
        .filter((product) =>
          product.name
            ?.toLowerCase()
            .includes(
              productSearch.toLowerCase()
            )
        )
        .slice(0, 20)
        .map((product) => (
          <button
            type="button"
            key={product.id}
            onClick={() => {
              setValue(
                "productId",
                product.id
              );

              setProductSearch(
                product.name
              );

              setShowProducts(
                false
              );
            }}
            className="w-full text-left px-4 py-3 hover:bg-rose-50 transition border-b border-gray-100 last:border-0"
          >
            <div className="font-medium text-gray-800">
              {product.name}
            </div>

            <div className="text-xs text-gray-400">
              {product.productCat}
            </div>
          </button>
        ))}

      {products.filter((product) =>
        product.name
          ?.toLowerCase()
          .includes(
            productSearch.toLowerCase()
          )
      ).length === 0 && (
        <div className="p-4 text-sm text-gray-400">
          No products found
        </div>
      )}
    </div>
  )}
</div>

              <p className="text-sm text-rose-500">
                {
                  errors.productId
                    ?.message
                }
              </p>
            </div>

            {/* INVENTORY */}
            <div className="flex flex-col gap-2">
              <label className="label-style-4">
                Inventory Item
              </label>

              <select
                {...register(
                  "inventoryItemId"
                )}
                className="input-style-4"
              >
                <option value="">
                  Select Inventory Item
                </option>

                {inventoryItems.map((item) => (
                  <option
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}
              </select>

              <p className="text-sm text-rose-500">
                {
                  errors.inventoryItemId
                    ?.message
                }
              </p>
            </div>

            {/* QTY + UNIT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* QTY */}
              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Quantity
                </label>

                <input
                  type="number"
                  step="0.001"
                  {...register(
                    "quantity"
                  )}
                  className="input-style-4"
                  placeholder="0.25"
                />

                <p className="text-sm text-rose-500">
                  {
                    errors.quantity
                      ?.message
                  }
                </p>
              </div>

              {/* UNIT */}
              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Unit
                </label>

                <input
                  {...register("unit")}
                  readOnly
                  className="input-style-4 bg-gray-50"
                />
              </div>
            </div>

            {/* BUTTON */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="btn-save-4 h-11 flex items-center gap-2"
            >
              <Plus size={18} />

              {isSubmitting
                ? "Saving..."
                : "Add Ingredient"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}