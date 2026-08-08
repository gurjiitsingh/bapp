"use client";

import { useEffect, useState } from "react";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { ProductType } from "@/lib/types/productType";
import { addOnType } from "@/lib/types/addOnType";
import PosProductCard from "@/app/pos/component/PosProductCard";

export default function Products() {
  const {
    productCategoryIdG,
    settings,
    setAllProduct,
    productToSearchQuery,
    setProductToSearchQuery, // Ensure your Context exposes a setter, or use local state
  } = UseSiteContext();

  const [products, setProducts] = useState<ProductType[]>([]);
  const [allProducts, setAllProductsLocal] = useState<ProductType[]>([]);
  const [variant, setVariant] = useState<ProductType[]>([]);
  const [addOns, setAddOns] = useState<addOnType[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [localSearch, setLocalSearch] = useState("");

  // Initial category setup
  useEffect(() => {
    if (!settings?.display_category && !productCategoryIdG) return;

    setCategoryId(
      String(productCategoryIdG || settings.display_category || "")
    );
  }, [settings, productCategoryIdG]);

  // Load Products
  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/products");
        const data: ProductType[] = await res.json();

        const published = data
          .filter((p) => p.publishStatus === "published")
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

        if (!mounted) return;

        const parents = published.filter((p) => p.type === "parent");
        const variants = published.filter((p) => p.type === "variant");

        setVariant(variants);
        setAddOns([]);

        setAllProductsLocal(parents);
        setAllProduct(parents);

        setProducts(
          categoryId
            ? parents.filter((p) => p.categoryId === categoryId)
            : parents
        );
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [setAllProduct]);

  // Category Filter
  useEffect(() => {
    if (!categoryId) {
      setProducts(allProducts);
      return;
    }

    setProducts(allProducts.filter((p) => p.categoryId === categoryId));
  }, [categoryId, allProducts]);

  // Search Filter
  const activeSearch = productToSearchQuery || localSearch;

  useEffect(() => {
    if (!activeSearch) {
      if (!categoryId) {
        setProducts(allProducts);
      } else {
        setProducts(allProducts.filter((p) => p.categoryId === categoryId));
      }
      return;
    }

    setProducts(
      allProducts.filter((p) =>
        p.name.toLowerCase().includes(activeSearch.toLowerCase())
      )
    );
  }, [activeSearch, categoryId, allProducts]);

  return (
    <div className="flex flex-col h-full bg-slate-100/70 select-none">
      {/* Top Search Bar Header */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-3 shadow-2xs">
        <div className="relative flex items-center max-w-md">
          {/* Search Lens Icon */}
          <div className="absolute left-3.5 pointer-events-none text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>

          <input
            type="text"
            value={activeSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              if (setProductToSearchQuery) {
                setProductToSearchQuery(e.target.value);
              }
            }}
            placeholder="Search items by name or code..."
            className="w-full h-10 pl-10 pr-9 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition duration-150"
          />

          {/* Clear Search Input Button */}
          {activeSearch && (
            <button
              onClick={() => {
                setLocalSearch("");
                if (setProductToSearchQuery) setProductToSearchQuery("");
              }}
              className="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Canvas */}
      <div className="flex-1 overflow-y-auto  custom-scrollbar">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 ">
            {products.map((product) => (
              <PosProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty Search or Filter State */
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
            <div className="p-3 bg-slate-200/50 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 text-slate-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
            </div>
            <p className="font-semibold text-slate-700 text-sm">No items found</p>
            <p className="text-xs text-slate-400">
              Try adjusting your category filter or search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}