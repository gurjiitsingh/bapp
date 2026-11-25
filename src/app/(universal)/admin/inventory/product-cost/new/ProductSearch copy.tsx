
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
  const [showResults, setShowResults] = useState(true);

  const searchRef = useRef<HTMLDivElement>(null);

  // FILTER PRODUCTS FROM FIRST CHARACTER
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    // No search text: show all products
    if (!query) {
      return products;
    }

    // Search from the beginning of the product name
    return products
      .filter((product) =>
        (product.name || "").toLowerCase().startsWith(query)
      )
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );
  }, [search, products]);

  // CLOSE OUTSIDE
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowResults(false);
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
    setShowResults(false);
    onSelect(product);
  }

  // CLEAR SEARCH
  function handleClear() {
    setSearch("");
    setShowResults(true);
  }

  return (
    <div className="relative mx-w-[300px] h-[85dvh]" ref={searchRef}>
      {!search.trim() && (
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          size={18}
        />
      )}

      <input
        type="text"
        value={search}
        disabled={disabled}
        onChange={(e) => {
          setSearch(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
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

      {showResults && (
        <div className="absolute z-50 mt-2 w-full h-[85dvh] overflow-y-auto   border border-gray-200 bg-white  ">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <button
                type="button"
                key={product.id}
                onClick={() => handleSelect(product)}
                className={`w-full text-left px-1 py-1 hover:bg-rose-50 transition border-b border-gray-100 last:border-0 ${
                  selectedProductId === product.id
                    ? "bg-rose-50"
                    : ""
                }`}
              >
                <div className="font-medium text-gray-800">
                  {product.name}
                </div>

                {/* <div className="text-xs text-gray-400">
                  {product.categoryName}
                </div> */}
              </button>
            ))
          ) : (
            <div className="p-4 text-sm text-gray-400">
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
