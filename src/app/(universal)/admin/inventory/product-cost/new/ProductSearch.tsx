
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { ProductStockType } from "@/lib/types/productStockType";

type Props = {
  products: ProductStockType[];
  onSelect: (product: ProductStockType) => void;
  placeholder?: string;
  selectedProductId?: string;
  disabled?: boolean;
};

export default function ProductSearch({
  products,
  onSelect,
  placeholder = "Search product...",
  selectedProductId,
  disabled = false,
}: Props) {
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  // ALWAYS SHOW ALL PRODUCTS.
  // Matching products appear first when searching.
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return [...products].sort((a, b) => {
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();

      const aStarts = nameA.startsWith(query);
      const bStarts = nameB.startsWith(query);

      const aContains = nameA.includes(query);
      const bContains = nameB.includes(query);

      // Exact beginning matches first
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // Other matching products next
      if (aContains && !bContains) return -1;
      if (!aContains && bContains) return 1;

      // Keep remaining products alphabetically sorted
      return nameA.localeCompare(nameB);
    });
  }, [search, products]);

  // CLOSE ONLY WHEN CLICKING OUTSIDE
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        // Do not hide the product list
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        // Keep product list visible
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // SELECT PRODUCT
  function handleSelect(product: ProductStockType) {
    setSearch(product.name);
    onSelect(product);
  }

  // CLEAR SEARCH
  function handleClear() {
    setSearch("");
  }

  return (
    <div
      className="relative w-[260px] bg-white"
      ref={searchRef}
    >


  <div className="border-b border-gray-100 px-1 py-1 mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          Products
        </h2>

        <p className="text-sm text-gray-500">
        Seach 
        </p>
      </div>

      {!search.trim() && (
        <Search
          className="absolute right-4 mt-4 -translate-y-1/2 text-gray-400 pointer-events-none"
          size={18}
        />
      )}

      <input
        type="text"
        value={search}
        disabled={disabled}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        className={`input-style-4 pr-10 ${
          !search.trim() ? "pl-12" : "pl-4"
        }`}
      />

      {search && (
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-600"
        >
          <X size={17} />
        </button>
      )}

      {/* ALWAYS VISIBLE PRODUCT LIST */}
      <div className="mt-0 w-full h-[81dvh] overflow-y-auto border border-gray-200 bg-white rounded-lg shadow-sm">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <button
              type="button"
              key={product.id}
              disabled={disabled}
              onClick={() => handleSelect(product)}
              className={`w-full text-left px-3 py-2 hover:bg-rose-50 transition border-b border-gray-100 last:border-0 ${
                selectedProductId === product.id
                  ? "bg-rose-50 border-l-4 border-l-rose-500"
                  : ""
              }`}
            >
              <div className="font-medium text-gray-800">
                {product.name}
              </div>
            </button>
          ))
        ) : (
          <div className="p-4 text-sm text-gray-400">
            No products found
          </div>
        )}
      </div>
    </div>
  );
}
