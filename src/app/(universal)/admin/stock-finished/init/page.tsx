"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function ProductStockSetupPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [copyLoading, setCopyLoading] = useState(false);

  // ✅ Load data
  useEffect(() => {
    async function loadData() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);

        const productsJson = await productsRes.json();
        const categoriesJson = await categoriesRes.json();

        setProducts(productsJson || []);
        setCategories(categoriesJson || []);
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
      const res = await fetch(
        "/api/init-inventory-items/copy-category-itmes",
        {
          method: "POST",
          body: JSON.stringify({
            categoryId: selectedCategory,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert(`✅ ${data.count} items copied`);
      } else {
        alert("No items found");
      }
    } catch (err) {
      console.error(err);
      alert("Error copying");
    }

    setCopyLoading(false);
  }

  if (loading) return <p>Loading...</p>;

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
                ${
                  active
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
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-600">
          {filtered.length} products in this category
        </p>

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