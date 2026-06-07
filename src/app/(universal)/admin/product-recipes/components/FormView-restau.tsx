"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  ChefHat,
  Plus,
  Search,
  Package2,
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
  recipes: ProductRecipeType[];
};

export default function FormView({
  products,
  inventoryItems,
  recipes,
}: Props) {
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // =====================================================
  // PRODUCT SEARCH
  // =====================================================

  const [productSearch, setProductSearch] =
    useState("");

  const [showProducts, setShowProducts] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<ProductType | null>(null);

  const searchRef =
    useRef<HTMLDivElement>(null);

  // =====================================================
  // INVENTORY SEARCH
  // =====================================================

  const [
    inventorySearch,
    setInventorySearch,
  ] = useState("");

  const [
    showInventory,
    setShowInventory,
  ] = useState(false);

  const [
    selectedInventory,
    setSelectedInventory,
  ] =
    useState<InventoryItemType | null>(
      null
    );

  const inventoryRef =
    useRef<HTMLDivElement>(null);

  // =====================================================
  // FORM
  // =====================================================

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

  // =====================================================
  // AUTO SET UNIT
  // =====================================================

  useEffect(() => {
    if (!selectedInventoryId) return;

    const inventory =
      inventoryItems.find(
        (item) =>
          item.id === selectedInventoryId
      );

    if (inventory) {
      setValue("unit",  inventory.consumptionUnit);
    }
  }, [
    selectedInventoryId,
    inventoryItems,
    setValue,
  ]);

  // =====================================================
  // FILTERED PRODUCTS
  // =====================================================

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim())
      return [];

    return products
      .filter((product) =>
        product.name
          ?.toLowerCase()
          .includes(
            productSearch
              .trim()
              .toLowerCase()
          )
      )
      .slice(0, 20);
  }, [productSearch, products]);

  // =====================================================
  // FILTERED INVENTORY
  // =====================================================

  const filteredInventory = useMemo(() => {
    if (!inventorySearch.trim())
      return [];

    return inventoryItems
      .filter((item) =>
        item.name
          ?.toLowerCase()
          .includes(
            inventorySearch
              .trim()
              .toLowerCase()
          )
      )
      .slice(0, 30);
  }, [
    inventorySearch,
    inventoryItems,
  ]);

  // =====================================================
  // CURRENT PRODUCT RECIPES
  // =====================================================

  const currentRecipes = useMemo(() => {
    if (!selectedProduct) return [];

    return recipes.filter(
      (recipe) =>
        recipe.productId ===
        selectedProduct.id
    );
  }, [recipes, selectedProduct]);

  // =====================================================
  // CLOSE DROPDOWNS
  // =====================================================

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {
      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target as Node
        )
      ) {
        setShowProducts(false);
      }

      if (
        inventoryRef.current &&
        !inventoryRef.current.contains(
          event.target as Node
        )
      ) {
        setShowInventory(false);
      }
    }

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setShowProducts(false);
        setShowInventory(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // =====================================================
  // SUBMIT
  // =====================================================

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
        reset({
          productId: data.productId,
          quantity: 0,
          unit: "",
          inventoryItemId: "",
        });

        setInventorySearch("");
      }
    } catch (error) {
      console.error(error);

      alert("Something went wrong");
    }

    setIsSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">

        {/* TOP SEARCH */}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sticky top-4 z-30">

          <div className="flex items-center gap-4 mb-5">
            <div className="h-14 w-14 rounded-2xl bg-rose-100 flex items-center justify-center">
              <ChefHat
                className="text-rose-600"
                size={26}
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Product Recipes
              </h1>

              <p className="text-sm text-gray-500">
                Search product and manage recipe ingredients
              </p>
            </div>
          </div>

          {/* PRODUCT SEARCH */}

          <div
            className="relative"
            ref={searchRef}
          >
            {!productSearch.trim() && (
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={18}
              />
            )}

            <input
              type="text"
              value={productSearch}
              onChange={(e) => {
                setProductSearch(
                  e.target.value
                );

                setShowProducts(true);
              }}
              onFocus={() => {
                if (
                  productSearch.trim()
                    .length > 0
                ) {
                  setShowProducts(true);
                }
              }}
              placeholder="Search product..."
              className={`input-style-4 pr-4 ${
                !productSearch.trim()
                  ? "pl-12"
                  : "pl-4"
              }`}
            />

            {showProducts &&
              productSearch.trim()
                .length > 0 && (
                <div className="absolute z-50 mt-2 w-full max-h-80 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">

                  {filteredProducts.length >
                  0 ? (
                    filteredProducts.map(
                      (product) => (
                        <button
                          type="button"
                          key={product.id}
                          onClick={() => {
                            setSelectedProduct(
                              product
                            );

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
                            {
                              product.productCat
                            }
                          </div>
                        </button>
                      )
                    )
                  ) : (
                    <div className="p-4 text-sm text-gray-400">
                      No products found
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* CONTENT */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* LEFT */}

          <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Recipe Ingredients
                  </h2>

                  <p className="text-sm text-gray-500">
                    {selectedProduct
                      ? selectedProduct.name
                      : "Select product to view recipe"}
                  </p>
                </div>

                {selectedProduct && (
                  <div className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-xl">
                    {
                      currentRecipes.length
                    }{" "}
                    ingredients
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">

              {!selectedProduct ? (
                <div className="h-[350px] flex flex-col items-center justify-center text-center">

                  <Package2
                    size={50}
                    className="text-gray-300 mb-4"
                  />

                  <h3 className="text-lg font-semibold text-gray-600">
                    No Product Selected
                  </h3>

                  <p className="text-sm text-gray-400 mt-1">
                    Search and select product from top search bar
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">

                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 text-sm font-semibold text-gray-600">
                          Ingredient
                        </th>

                        <th className="text-left py-3 text-sm font-semibold text-gray-600">
                          Quantity
                        </th>

                        <th className="text-left py-3 text-sm font-semibold text-gray-600">
                          Unit
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentRecipes.map(
                        (recipe) => (
                          <tr
                            key={recipe.id}
                            className="border-b border-gray-50 hover:bg-gray-50"
                          >
                            <td className="py-4 font-medium text-gray-800">
                              {
                                recipe.inventoryItemName
                              }
                            </td>

                            <td className="py-4 text-gray-600">
                              {
                                recipe.quantity
                              }
                            </td>

                            <td className="py-4 text-gray-600">
                              {recipe.unit}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>

                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-fit">

            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-xl font-bold text-gray-800">
                Add Ingredient
              </h2>

              <p className="text-sm text-gray-500">
                {selectedProduct
                  ? selectedProduct.name
                  : "Select product first"}
              </p>
            </div>

            <form
              onSubmit={handleSubmit(
                onSubmit
              )}
              className="p-6 flex flex-col gap-5"
            >
              <input
                type="hidden"
                {...register(
                  "productId"
                )}
              />

              {/* INVENTORY SEARCH */}

              <div className="flex flex-col gap-2">

                <label className="label-style-4">
                  Inventory Item
                </label>

                <div
                  className="relative"
                  ref={inventoryRef}
                >
                  {!inventorySearch.trim() && (
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={18}
                    />
                  )}

                  <input
                    type="text"
                    disabled={!selectedProduct}
                    value={inventorySearch}
                    onChange={(e) => {
                      setInventorySearch(
                        e.target.value
                      );

                      setShowInventory(true);
                    }}
                    onFocus={() => {
                      if (
                        inventorySearch.trim()
                          .length > 0
                      ) {
                        setShowInventory(
                          true
                        );
                      }
                    }}
                    placeholder="Search inventory item..."
                    className={`input-style-4 pr-4 ${
                      !inventorySearch.trim()
                        ? "pl-12"
                        : "pl-4"
                    } ${
                      !selectedProduct
                        ? "opacity-60 cursor-not-allowed"
                        : ""
                    }`}
                  />

                  <input
                    type="hidden"
                    {...register(
                      "inventoryItemId"
                    )}
                  />

                  {showInventory &&
                    inventorySearch.trim()
                      .length > 0 && (
                      <div className="absolute z-50 mt-2 w-full max-h-80 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl">

                        {filteredInventory.length >
                        0 ? (
                          filteredInventory.map(
                            (item) => (
                              <button
                                type="button"
                                key={item.id}
                                onClick={() => {
                                  setSelectedInventory(
                                    item
                                  );

                                  setValue(
                                    "inventoryItemId",
                                    item.id
                                  );

                                  setValue(
                                    "unit",
                                   item.consumptionUnit
                                  );

                                  setInventorySearch(
                                    item.name
                                  );

                                  setShowInventory(
                                    false
                                  );
                                }}
                                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition border-b border-gray-100 last:border-0"
                              >
                                <div className="font-medium text-gray-800">
                                  {item.name}
                                </div>

                                <div className="text-xs text-gray-400">
                                  { item.consumptionUnit}
                                </div>
                              </button>
                            )
                          )
                        ) : (
                          <div className="p-4 text-sm text-gray-400">
                            No inventory items found
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>

              {/* QTY */}

              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Quantity
                </label>

                <input
                  type="number"
                  step="0.001"
                  disabled={!selectedProduct}
                  {...register(
                    "quantity"
                  )}
                  className="input-style-4"
                  placeholder="0.25"
                />
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

              {/* BUTTON */}

              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !selectedProduct
                }
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
    </div>
  );
}