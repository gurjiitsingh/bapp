"use client";

import { useEffect, useMemo, useState } from "react";
import { Package2, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  TnewProductRecipeSchema,
  ProductRecipeType,
} from "@/lib/types/ProductRecipeType";

import { InventoryItemType } from "@/lib/types/InventoryItemType";
import { ProductStockType } from "@/lib/types/productStockType";
import { fetchProductRecipesByProductId } from "@/app/(universal)/action/productRecipes/fetchProductRecipesByProductId";
import { MdDeleteForever } from "react-icons/md";
import { Pencil, Save, X } from "lucide-react";
import { deleteProductRecipeFast } from "@/app/(universal)/action/productRecipes/deleteProductRecipeFast";
import { updateProductRecipe } from "@/app/(universal)/action/productRecipes/updateProductRecipe";
// Import your actual server action here


type Props = {
  selectedProduct: ProductStockType | null;
  inventoryItems: InventoryItemType[];
  isSubmitting?: boolean;
  onSubmit: (data: TnewProductRecipeSchema) => Promise<void>;
};

export default function AddComponentForm({
  selectedProduct,
  inventoryItems,
  isSubmitting = false,
  onSubmit,
}: Props) {
  const [search, setSearch] = useState("");

  const [quantities, setQuantities] = useState<
    Record<string, string>
  >({});

  const [currentRecipes, setCurrentRecipes] = useState<
    ProductRecipeType[]
  >([]);

  const [loadingRecipes, setLoadingRecipes] = useState(false);

  const [savingItemId, setSavingItemId] = useState<string | null>(null);
const [editingItemId, setEditingItemId] = useState<string | null>(null);

const [editQuantity, setEditQuantity] = useState("");
  // FETCH RECIPES FOR SELECTED PRODUCT
  useEffect(() => {
    if (!selectedProduct?.id) {
      setCurrentRecipes([]);
      setQuantities({});
      return;
    }

    let active = true;

    async function loadRecipes() {
      setLoadingRecipes(true);

      // Clear previous product quantities
      setQuantities({});
      setCurrentRecipes([]);

      try {
        if (!selectedProduct) return;
        const result = await fetchProductRecipesByProductId(
          selectedProduct.id
        );

        if (!active) return;

        setCurrentRecipes(result);

        // Fill saved recipe quantities
        const savedQuantities: Record<string, string> = {};

        result.forEach((recipe) => {
          savedQuantities[recipe.inventoryItemId] =
            String(recipe.quantity);
        });

        setQuantities(savedQuantities);
      } catch (error) {
        console.error("Failed to fetch product recipes:", error);

        if (active) {
          setCurrentRecipes([]);
          setQuantities({});
        }
      } finally {
        if (active) {
          setLoadingRecipes(false);
        }
      }
    }

    loadRecipes();

    return () => {
      active = false;
    };
  }, [selectedProduct?.id]);

  // FILTER INVENTORY
  const filteredInventory = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return inventoryItems;

    return inventoryItems
      .filter((item) =>
        (item.name || "").toLowerCase().startsWith(query)
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [search, inventoryItems]);

  // UPDATE QUANTITY
  function handleQuantityChange(
    itemId: string,
    value: string
  ) {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  }

  // ADD INVENTORY ITEM
  async function handleAdd(item: InventoryItemType) {
    if (!selectedProduct) return;

    const quantity = Number(quantities[item.id] || 0);

    if (!Number.isFinite(quantity) || quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    setSavingItemId(item.id);

    try {
      await onSubmit({
        productId: selectedProduct.id,
        inventoryItemId: item.id,
        quantity,
        unit: item.consumptionUnit,
      });

      setQuantities((prev) => ({
        ...prev,
        [item.id]: "",
      }));
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setSavingItemId(null);
    }
  }

  async function handleUpdateRecipe(recipe: ProductRecipeType) {
  if (!selectedProduct) return;

  const quantity = Number(editQuantity);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    alert("Please enter a valid quantity");
    return;
  }

  setSavingItemId(recipe.inventoryItemId);

  try {
    const result = await updateProductRecipe({
      productId: selectedProduct.id,
      inventoryItemId: recipe.inventoryItemId,
      quantity,
      unit: recipe.unit,
    });

    if (!result.success) {
      alert(result.message);
      return;
    }

    // Update recipe list immediately
    setCurrentRecipes((prev) =>
      prev.map((item) =>
        item.inventoryItemId === recipe.inventoryItemId
          ? { ...item, quantity }
          : item
      )
    );

    // Update quantity in the left inventory panel
    setQuantities((prev) => ({
      ...prev,
      [recipe.inventoryItemId]: String(quantity),
    }));

    setEditingItemId(null);
    setEditQuantity("");

  } catch (error) {
    console.error("Update recipe error:", error);
    alert("Failed to update recipe quantity.");
  } finally {
    setSavingItemId(null);
  }
}


async function handleDeleteRecipe(recipe: ProductRecipeType) {
  if (!selectedProduct) return;

  if (!confirm(`Delete ${recipe.inventoryItemName} from this recipe?`)) {
    return;
  }

  setSavingItemId(recipe.inventoryItemId);

  try {
    const result = await deleteProductRecipeFast({
      productId: selectedProduct.id,
      inventoryItemId: recipe.inventoryItemId,
    });

    if (!result.success) {
      alert(result.message);
      return;
    }

    // Remove from right panel
    setCurrentRecipes((prev) =>
      prev.filter(
        (item) =>
          item.inventoryItemId !== recipe.inventoryItemId
      )
    );

    // Clear its quantity from left panel
    setQuantities((prev) => {
      const updated = { ...prev };
      delete updated[recipe.inventoryItemId];
      return updated;
    });

    if (editingItemId === recipe.inventoryItemId) {
      setEditingItemId(null);
      setEditQuantity("");
    }

  } catch (error) {
    console.error("Delete recipe error:", error);
    alert("Failed to delete recipe.");
  } finally {
    setSavingItemId(null);
  }
}

  return (
    <div className="bg-white flex-1 border border-gray-100 shadow-sm overflow-hidden h-[85dvh]">

      {/* HEADER */}
      <div className="border-b border-gray-100 px-1 py-1">
        <h2 className="text-xl font-bold text-gray-800">
          Add Component
        </h2>

        <p className="text-sm text-gray-500">
          {selectedProduct
            ? selectedProduct.name
            : "Select product first"}
        </p>
      </div>

      {/* SEARCH */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <Search
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />

          <input
            type="text"
            value={search}
            disabled={!selectedProduct}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inventory item..."
            className="input-style-4 pl-10 w-full"
          />
        </div>
      </div>

      {/* INVENTORY LIST */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-3 w-full">
        <div className="max-h-[600px] overflow-y-auto">

          {/* COLUMN HEADINGS */}
          <div className="hidden md:grid grid-cols-[minmax(0,1fr)_120px_110px_100px] gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500">
            <div>Inventory Item</div>
            <div>Quantity</div>
            <div>Unit</div>
            <div>Action</div>
          </div>

          {loadingRecipes ? (
            <div className="p-8 text-center text-sm text-gray-400">
              Loading product recipes...
            </div>
          ) : filteredInventory.length > 0 ? (
            filteredInventory.map((item) => {
              const isSaving = savingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_120px_110px_100px] gap-2 md:gap-3 items-center px-5 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  {/* ITEM NAME */}
                  <div className="font-medium text-gray-800">
                    {item.name}
                  </div>

                  {/* QUANTITY */}
                  <div>
                    <label className="md:hidden text-xs text-gray-500">
                      Quantity
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.001"
                      disabled={!selectedProduct || isSaving}
                      value={quantities[item.id] ?? ""}
                      onChange={(e) =>
                        handleQuantityChange(item.id, e.target.value)
                      }
                      placeholder="0.000"
                      className="input-style-4 w-full"
                    />
                  </div>

                  {/* UNIT */}
                  <div>
                    <label className="md:hidden text-xs text-gray-500">
                      Unit
                    </label>

                    <input
                      type="text"
                      readOnly
                      value={item.consumptionUnit}
                      className="input-style-4 w-full bg-gray-50"
                    />
                  </div>

                  {/* ADD BUTTON */}
                  <div>
                    <Button
                      type="button"
                      disabled={
                        !selectedProduct ||
                        isSubmitting ||
                        isSaving ||
                        loadingRecipes
                      }
                      onClick={() => handleAdd(item)}
                      className="btn-save-4 h-10 w-full flex items-center justify-center gap-1"
                    >
                      {isSaving ? "Saving..." : <Plus size={16} />}
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-sm text-gray-400">
              No inventory items found
            </div>
          )}
        </div>

          {/* RIGHT: RECIPE COMPONENTS */}
    <div className="bg-white w-full h-[85dvh] border border-gray-100 shadow-sm overflow-hidden">

      {/* HEADER */}
      <div className="border-b border-gray-100 px-3 py-2">
        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Recipe Components
            </h2>

            <p className="text-sm text-gray-500">
              {selectedProduct
                ? selectedProduct.name
                : "Select product to view Recipe"}
            </p>
          </div>

          {selectedProduct && (
            <div className="text-sm bg-blue-50 text-blue-700 px-3 py-2 rounded-xl">
              {currentRecipes.length} Components
            </div>
          )}
        </div>
      </div>

      {/* RECIPE LIST */}
      <div className="p-3 overflow-y-auto max-h-[calc(85dvh-70px)]">

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
        ) : loadingRecipes ? (
          <div className="py-10 text-center text-sm text-gray-400">
            Loading recipes...
          </div>
        ) : currentRecipes.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            No recipe components added yet
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 text-xs font-semibold text-gray-600">
                    Ingredient
                  </th>

                  <th className="text-left py-3 text-xs font-semibold text-gray-600">
                    Qty
                  </th>

                  <th className="text-left py-3 text-xs font-semibold text-gray-600">
                    Unit
                  </th>

                  <th className="text-right py-3 text-xs font-semibold text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>

            
<tbody>
  {currentRecipes.map((recipe) => {
    const isEditing =
      editingItemId === recipe.inventoryItemId;

    const isSaving =
      savingItemId === recipe.inventoryItemId;

    return (
      <tr
        key={recipe.inventoryItemId}
        className="border-b border-gray-50 hover:bg-gray-50"
      >
        {/* INGREDIENT */}
        <td className="py-3 text-sm font-medium text-gray-800">
          {recipe.inventoryItemName}
        </td>

        {/* QUANTITY */}
        <td className="py-3 text-sm text-gray-600">
          {isEditing ? (
          <input
  type="number"
  value={editQuantity}
  onChange={(e) => setEditQuantity(e.target.value)}
  className="input-style-4 !w-16 min-w-0 px-1 py-1 text-sm"
  autoFocus
/>
          ) : (
            recipe.quantity
          )}
        </td>

        {/* UNIT */}
        <td className="py-3 text-sm text-gray-600">
          {recipe.unit}
        </td>

        {/* ACTION */}
        <td className="py-3 text-right">
          <div className="flex items-center justify-end gap-1">

            {isEditing ? (
              <>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleUpdateRecipe(recipe)}
                  className="p-2 rounded-lg bg-green-500 hover:bg-green-700 text-white"
                  title="Save"
                >
                  {isSaving ? (
                    "..."
                  ) : (
                    <Save size={16} />
                  )}
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setEditingItemId(null);
                    setEditQuantity("");
                  }}
                  className="p-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-700"
                  title="Cancel"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  disabled={savingItemId !== null}
                  onClick={() => {
                    setEditingItemId(recipe.inventoryItemId);
                    setEditQuantity(String(recipe.quantity));
                  }}
                  className="p-2 rounded-lg bg-blue-400 hover:bg-blue-600 text-white"
                  title="Edit quantity"
                >
                  <Pencil size={16} />
                </button>

                <button
                  type="button"
                  disabled={savingItemId !== null}
                  onClick={() => handleDeleteRecipe(recipe)}
                  className="p-2 rounded-lg bg-rose-400 hover:bg-rose-700 text-white"
                  title="Delete ingredient"
                >
                  <MdDeleteForever size={18} />
                </button>
              </>
            )}

          </div>
        </td>
      </tr>
    );
  })}
</tbody>


            </table>
          </div>
        )}
      </div>
    </div>
      </div>
      {/* FOOTER */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-sm text-gray-500">
        Showing {filteredInventory.length} of {inventoryItems.length} inventory items
      </div>
    </div>
  );
}