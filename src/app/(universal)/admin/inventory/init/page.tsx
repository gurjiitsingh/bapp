"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getConsumptionOptions_, getConversionFactor, getDefaultUnitPair, } from "@/utils/inventory/unitConversion";

const inventoryUnits = [
  "pcs",
  "kg",
  "gm",
  "ltr",
  "ml",
  "dozen",
  "pair",
  "box",
  "pack",
  "carton",
  "bag",
  "bottle",
  "can",
  "jar",
  "roll",
  "tray",
] as const;



export default function ProductStockSetupPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesInventory, setCategoriesInventory] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [copyLoading, setCopyLoading] = useState(false);

  const [purchaseUnit, setPurchaseUnit] = useState("kg");
  const [consumptionUnit, setConsumptionUnit] = useState("gm");
  const [conversionFactor, setConversionFactor] = useState(1000);
  const [minStock, setMinStock] = useState<number | undefined>(5);
  const [currentStock, setCurrentStock] = useState<number | undefined>(0);
 const [selectedInventoryCategory, setSelectedInventoryCategory] = useState<string>("");


  useEffect(() => {
    const options = getConsumptionOptions_(purchaseUnit);

    if (!options.length) return;

    const exists = options.some(
      (o) => o.unit === consumptionUnit
    );

    if (exists) {
      const factor = getConversionFactor(
        purchaseUnit,
        consumptionUnit
      );
      setConversionFactor(factor);
    } else {
      const defaultPair = getDefaultUnitPair(purchaseUnit);

      if (defaultPair) {
        setConsumptionUnit(defaultPair.unit);
        setConversionFactor(defaultPair.factor);
      }
    }
  }, [purchaseUnit, consumptionUnit]);
  // ✅ Load data
  useEffect(() => {
    async function loadData() {
      try {
        const [
          productsRes,
          categoriesRes,
          inventoryCategoriesRes
        ] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
          fetch("/api/inventory/categories"),
        ]);

        const productsJson = await productsRes.json();
        const categoriesJson = await categoriesRes.json();
        const inventoryCategoriesJson = await inventoryCategoriesRes.json();

        setProducts(productsJson || []);
        setCategories(categoriesJson || []);
        setCategoriesInventory(inventoryCategoriesJson || []);
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    }

    loadData();
  }, []);

  // ✅ Filter products when category changes
  useEffect(() => {
    if (!selectedCategory) {
      setFiltered([]);
      return;
    }

    let list = products.filter((p) => {
      return (
        String(p.categoryId) === String(selectedCategory) &&
        p.type === "parent"
      );
    });

    setFiltered(list);
  }, [selectedCategory, products]);

  // ✅ Copy function
async function handleCopy() {
  if (!selectedCategory) {
    alert("Select category first");
    return;
  }

  setCopyLoading(true);

  try {
    const payload: any = {
      categoryId: selectedCategory,
      purchaseUnit,
      consumptionUnit,
      conversionFactor,
      minStock,
      currentStock,
    };

    if (selectedInventoryCategory) {
      payload.inventoryCategoryId = selectedInventoryCategory;
    }

    const res = await fetch(
      "/api/init-inventory-items/copy-category-items",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) throw new Error("API failed"); // ✅ add this

    const data = await res.json();

    if (data.success) {
      alert(`✅ ${data.count} items copied`);
    } else {
      alert(data.message || "No items found");
    }

  } catch (err) {
    console.error(err);
    alert("Error copying");
  } finally {
    setCopyLoading(false); // ✅ CORRECT PLACE
  }
}


  if (loading) return <p>Loading...</p>;
  const consumptionOptions = getConsumptionOptions_(purchaseUnit);
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Product Stock Setup
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Select a category and generate stock items
        </p>
      </div>

      {/* CATEGORY SELECT */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
        <p className="text-sm font-medium text-gray-600 mb-3">
          Categories
        </p>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                px-4 py-2 rounded-full text-sm transition-all
                border
                ${active
                    ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                    : "bg-gray-100 border-transparent text-gray-700 hover:bg-gray-200"
                  }
              `}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* INFO + ACTION */}
      {selectedCategory && (
        <div className="flex flex-col items-start justify-between mb-5">
          <p className="text-sm text-gray-600">
            {filtered.length} products in this category
          </p>

          <div className="bg-white rounded-2xl shadow-sm p-4 mb-5">
            <h3 className="font-semibold text-gray-800 mb-4">
              Inventory Settings
            </h3>

            <div className="grid md:grid-cols-3 gap-4">

              {/* Purchase Unit */}
              <div>
                <label className="text-sm text-gray-600">
                  Purchase Unit
                </label>

                <select
                  value={purchaseUnit}
                  onChange={(e) => {
                    console.log("Selected Purchase:", e.target.value);
                    setPurchaseUnit(e.target.value);
                  }}
                  className="input-style-4 mt-1"
                >
                  {inventoryUnits.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              {/* Consumption Unit */}
              <div>
                <label className="text-sm text-gray-600">
                  Consumption Unit
                </label>

                <select
                  value={consumptionUnit}
                  onChange={(e) => setConsumptionUnit(e.target.value)}
                  className="input-style-4 mt-1"
                >
                  {consumptionOptions.map((opt) => (
                    <option key={opt.unit} value={opt.unit}>
                      {opt.unit}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conversion */}
              <div>
                <label className="text-sm text-gray-600">
                  Conversion Factor
                </label>

                <input
                  type="number"
                  value={conversionFactor}
                  onChange={(e) =>
                    setConversionFactor(Number(e.target.value))
                  }
                  className="input-style-4 mt-1"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            {/* Min Stock */}
            <div>
              <label className="text-sm text-gray-600">
                Min Stock
              </label>

              <input
                type="number"
                value={minStock ?? ""}
                onChange={(e) =>
                  setMinStock(
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
                className="input-style-4 mt-1"
              />
            </div>

            {/* Current Stock */}
            <div>
              <label className="text-sm text-gray-600">
                Current Stock
              </label>

              <input
                type="number"
                value={currentStock ?? ""}
                onChange={(e) =>
                  setCurrentStock(
                    e.target.value === "" ? undefined : Number(e.target.value)
                  )
                }
                className="input-style-4 mt-1"
              />
            </div>

            <div>
              {/* Current Stock */}
              <div>
                <label className="label-style-4">
                  Category
                </label>

                <select
                  value={selectedInventoryCategory}
                  onChange={(e) => setSelectedInventoryCategory(e.target.value)}
                  className="input-style-4 mt-1"
                >
                  <option value="">
                    Select Category
                  </option>

                  {categoriesInventory.map((category) => (
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
            </div>
            <div className="flex flex-col pt-7">

              <Button
                onClick={handleCopy}
                disabled={!selectedCategory || copyLoading}
                className="
            rounded-xl
            bg-indigo-600
            hover:bg-indigo-700
            text-white
            px-5
            h-10
            shadow-sm
          "
              >
                {copyLoading ? "Generating..." : "Generate Stock"}
              </Button>
            </div></div>
        </div>
      )}

      {/* PRODUCT LIST */}
      {selectedCategory && (
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-4">
            Products
          </h3>

          {filtered.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No products found
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {filtered.map((p) => (
                <div
                  key={p.id}
                  className="
                  flex items-center justify-between
                  border border-gray-100
                  rounded-xl p-3
                  hover:shadow-sm transition
                "
                >
                  {/* LEFT */}
                  <div>
                    <p className="font-medium text-gray-800">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      ₹{p.price}
                    </p>
                  </div>

                  {/* RIGHT BADGE */}
                  <span
                    className="
                    text-xs
                    px-2 py-1
                    rounded-full
                    bg-gray-100
                    text-gray-600
                  "
                  >
                    {p.productMode || "simple"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}