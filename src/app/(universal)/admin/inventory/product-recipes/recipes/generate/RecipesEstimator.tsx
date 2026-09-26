"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Package,
  Search,
} from "lucide-react";
import { InventoryItemType } from "@/lib/types/InventoryItemType";
import toast from "react-hot-toast";
import Link from "next/link";
import { ProductStockType } from "@/lib/types/productStockType";
import { manualStockProduction } from "@/app/(universal)/action/production/manualStockProduction";
import { newRecipesEstimatorAction } from "@/app/(universal)/action/productRecipes/newRecipesEstimatorAction";
import { addProductRecipe } from "@/app/(universal)/action/productRecipes/dbOperations";

type Props = {
  products: ProductStockType[];
  inventoryItems: InventoryItemType[];
};

type CalculatedRecipeItem = {
  inventoryItemId: string;
  inventoryItemName: string;
  quantity: number;
  requiedInvetroyItemAmount: number;
  purchaseUnit: string;
  consumptionUnit: string;
};

export default function RecipesEstimator({
  products,
  inventoryItems,
}: Props) {
  const router = useRouter();

  // --------------------------------------------------
  // FINISHED PRODUCT
  // --------------------------------------------------

  const [selectedProduct, setSelectedProduct] =
    useState<ProductStockType | null>(null);

  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [finishedProductQuantity, setFinishedProductQuantity] =
    useState<number>(1);
  // --------------------------------------------------
  // RAW MATERIALS
  // --------------------------------------------------

  const [items, setItems] = useState<any[]>([]);

  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipeResult, setRecipeResult] = useState<
    CalculatedRecipeItem[]
  >([]);
  // --------------------------------------------------
  // PRODUCT SEARCH
  // --------------------------------------------------

  const filteredProducts = products.filter((item) =>
    item.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // --------------------------------------------------
  // ADD RAW MATERIAL
  // --------------------------------------------------

  const addItem = () => {
    setItems([
      ...items,
      {
        inventoryItemId: "",
        inventoryItemName: "",

        quantity: 0,

        purchaseUnit: "",
        consumptionUnit: "",

        conversionFactor: 1,

        averageCost: 0,
        costPerUnit: 0,
      },
    ]);
  };

  // --------------------------------------------------
  // UPDATE RAW MATERIAL
  // --------------------------------------------------

  const updateItem = (
    index: number,
    field: string,
    value: any
  ) => {
    const updated = [...items];

    updated[index][field] = value;

    // When raw material is selected
    if (field === "inventoryItemId") {
      const selected = inventoryItems.find(
        (i) => i.id === value
      );

      if (selected) {
        updated[index].inventoryItemName =
          selected.name;

        updated[index].averageCost =
          Number(selected.averageCost) || 0;

        updated[index].purchaseUnit =
          selected.purchaseUnit || "";

        updated[index].consumptionUnit =
          selected.consumptionUnit || "";

        updated[index].conversionFactor =
          Number(selected.conversionFactor) || 1;
      }
    }

    setItems(updated);
  };

  // --------------------------------------------------
  // REMOVE RAW MATERIAL
  // --------------------------------------------------

  const removeItem = (index: number) => {
    setItems(
      items.filter((_, i) => i !== index)
    );
  };

  // --------------------------------------------------
  // SUBMIT
  // --------------------------------------------------

  const handleSubmit = async () => {
    if (!selectedProduct) {
      toast.error("Select a finished product");
      return;
    }

    if (!items.length) {
      toast.error("Add at least one raw material");
      return;
    }

    if (finishedProductQuantity <= 0) {
      toast.error(
        "Enter a valid finished product quantity"
      );
      return;
    }

    const invalidItem = items.some(
      (item) =>
        !item.inventoryItemId ||
        Number(item.quantity) <= 0
    );

    if (invalidItem) {
      toast.error(
        "Select raw material and enter valid quantity"
      );
      return;
    }

    setLoading(true);

    try {
      const res = await newRecipesEstimatorAction({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        finishedProductQuantity,
        items,
        note,
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      setRecipeResult(res.recipe);

      toast.success("Recipe calculated successfully");

      setRecipeResult(res.recipe);

      toast.success("Recipe calculated successfully");

      setItems([]);
      setNote("");


    } catch (err) {
      console.error(err);

      toast.error(
        "An error occurred while creating the batch"
      );
    } finally {
      setLoading(false);
    }
  };


  const addCalculatedRecipeItem = async (
    item: CalculatedRecipeItem
  ) => {
    if (!selectedProduct) {
      toast.error("Select a finished product");
      return;
    }

    try {
      const formData = new FormData();

      formData.append(
        "productId",
        selectedProduct.id
      );

      formData.append(
        "inventoryItemId",
        item.inventoryItemId
      );

      // IMPORTANT:
      // Save the calculated PER KG quantity
      formData.append(
        "quantity",
        String(
          item.requiedInvetroyItemAmount
        )
      );

      formData.append(
        "unit",
        item.consumptionUnit ||
        item.purchaseUnit ||
        ""
      );

      const result =
        await addProductRecipe(formData);

      if (result?.errors) {
        const errorMessage =
          result.errors.duplicate ||
          result.errors.inventory ||
          result.errors.product ||
          result.errors.general ||
          "Could not add recipe";

        toast.error(errorMessage);
        return;
      }

      toast.success(
        `${item.inventoryItemName} added to recipe`
      );
    } catch (error) {
      console.error(
        "Add calculated recipe error:",
        error
      );

      toast.error(
        "Could not add recipe item"
      );
    }
  };


  return (
    <div className="p-6 max-w-5xl space-y-6 bg-gray-50 min-h-screen">

      {/* HEADER */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

        <div className="flex items-center gap-2">

          <Package className="w-6 h-6 text-blue-600" />

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Recipe Estimator
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Select a finished product and add its raw
              materials.
            </p>
          </div>

        </div>



      </div>

{/* ================================================== */}
{/* CALCULATED RECIPE */}
{/* ================================================== */}

{recipeResult.length > 0 && (
  <div className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">

    {/* HEADER */}

    <div className="px-4 py-4 border-b border-gray-200">

      <h2 className="text-lg font-semibold text-gray-800">
        Calculated Recipe
      </h2>

      <div className="mt-1 text-sm text-gray-600">
        Finished Product:{" "}
        <span className="font-semibold text-gray-800">
          {selectedProduct?.name}
        </span>
      </div>

      <p className="text-xs text-gray-500 mt-1">
        Recipe requirement per 1 kg of finished product.
      </p>

    </div>


    {/* TABLE HEADER */}

    <div className="w-full grid grid-cols-4 bg-gray-100 text-sm font-medium px-4 py-3 text-gray-600">

      <div>
        Inventory Item
      </div>

      <div>
        Required Quantity
      </div>

      <div>
        Unit
      </div>

      <div>
        Action
      </div>

    </div>


    {/* TABLE ROWS */}

    {recipeResult.map((item) => (

      <div
        key={item.inventoryItemId}
        className="w-full grid grid-cols-4 gap-2 px-4 py-3 border-t border-gray-100 items-center"
      >

        {/* INVENTORY ITEM */}

        <div className="font-medium text-gray-800">
          {item.inventoryItemName}
        </div>


        {/* REQUIRED PER KG */}

        <div className="text-blue-600 font-semibold">
          {item.requiedInvetroyItemAmount}
        </div>


        {/* UNIT */}

        <div className="text-gray-600">
          {item.consumptionUnit ||
            item.purchaseUnit}
        </div>


        {/* ADD */}

        <div>

          <button
            type="button"
            onClick={() =>
              addCalculatedRecipeItem(item)
            }
            className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Add
          </button>

        </div>

      </div>

    ))}

  </div>
)}
      {/* CARD */}

      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-6 shadow-sm">


        {/* ================================================== */}
        {/* FINISHED PRODUCT */}
        {/* ================================================== */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* FINISHED PRODUCT */}

          <div className="md:col-span-2 flex flex-col gap-2">

            <label className="text-sm font-medium text-gray-700">
              Finished Product
            </label>

            <div className="relative">

              {!search.trim() && (
                <Search
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              )}

              <input
                value={search}
                onChange={(e) => {
                  const value = e.target.value;

                  setSearch(value);
                  setShowDropdown(true);

                  if (
                    selectedProduct &&
                    value !== selectedProduct.name
                  ) {
                    setSelectedProduct(null);
                  }
                }}
                onFocus={() => {
                  setShowDropdown(true);
                }}
                placeholder="Search finished product..."
                className={`w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 ${!search.trim()
                    ? "pr-12"
                    : "pr-4"
                  }`}
              />

              {/* PRODUCT DROPDOWN */}

              {showDropdown &&
                search.trim() &&
                filteredProducts.length > 0 && (
                  <div className="absolute z-50 mt-2 w-full max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl">

                    {filteredProducts.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedProduct(item);
                          setSearch(item.name);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="font-medium text-gray-800">
                          {item.name}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          Current Stock:{" "}
                          {item.currentStock ?? 0}
                        </div>
                      </button>
                    ))}

                  </div>
                )}

            </div>

          </div>


          {/* FINISHED PRODUCT QUANTITY */}

          <div className="flex flex-col gap-2">

            <label className="text-sm font-medium text-gray-700">
              Finished Product Quantity
            </label>

            <input
              type="number"
              min="0"
              step="any"
              value={finishedProductQuantity}
              onChange={(e) =>
                setFinishedProductQuantity(
                  Number(e.target.value)
                )
              }
              placeholder="Enter quantity"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

        </div>


        {/* ================================================== */}
        {/* RAW MATERIALS */}
        {/* ================================================== */}

        <div className="space-y-3">

          <div className="flex justify-between items-center">

            <div>
              <h2 className="font-medium text-gray-700">
                Raw Materials
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Add the raw materials used for this
                finished product.
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={16} />
              Add Item
            </button>

          </div>


          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">

            {/* HEADER */}

            <div className="grid grid-cols-5 bg-gray-100 text-sm font-medium px-3 py-2 text-gray-600">

              <div>
                Raw Material
              </div>

              <div>
                Qty
              </div>

              <div>
                Unit
              </div>



              <div></div>

            </div>


            {/* ROWS */}

            {items.map((item, index) => (

              <div
                key={index}
                className="grid grid-cols-5 gap-2 px-3 py-2 border-t items-center"
              >

                {/* RAW MATERIAL */}

                <select
                  value={item.inventoryItemId}
                  className="border border-gray-300 rounded-md px-2 py-1.5 bg-white"
                  onChange={(e) =>
                    updateItem(
                      index,
                      "inventoryItemId",
                      e.target.value
                    )
                  }
                >

                  <option value="">
                    Select
                  </option>

                  {inventoryItems.map(
                    (inventoryItem) => (
                      <option
                        key={inventoryItem.id}
                        value={inventoryItem.id}
                      >
                        {inventoryItem.name}
                      </option>
                    )
                  )}

                </select>


                {/* QUANTITY */}

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={item.quantity}
                  placeholder="0"
                  className="border border-gray-300 rounded-md px-2 py-1.5"
                  onChange={(e) =>
                    updateItem(
                      index,
                      "quantity",
                      Number(e.target.value)
                    )
                  }
                />


                {/* UNIT */}

                <input
                  readOnly
                  value={item.purchaseUnit}
                  className="border border-gray-300 rounded-md px-2 py-1.5 bg-gray-100"
                />





                {/* DELETE */}

                <button
                  type="button"
                  onClick={() =>
                    removeItem(index)
                  }
                  className="text-red-500 hover:text-red-700 flex justify-center"
                >
                  <Trash2 size={18} />
                </button>

              </div>

            ))}


            {!items.length && (
              <div className="text-center text-sm text-gray-400 py-6">
                No raw materials added
              </div>
            )}

          </div>

        </div>







        {/* ================================================== */}
        {/* SUBMIT */}
        {/* ================================================== */}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
        >
          {loading
            ? "Creating..."
            : "Calculate Recipes"}
        </button>

      </div>

    </div>
  );
}

