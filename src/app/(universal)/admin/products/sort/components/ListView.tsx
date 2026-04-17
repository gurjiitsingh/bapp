"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TableRows from "./TableRows";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductType } from "@/lib/types/productType";
import { categoryType } from "@/lib/types/categoryType";

export default function ListView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlCategory = searchParams.get("category") || "";
  const urlSearch = searchParams.get("search") || "";

  const [categories, setCategories] = useState<categoryType[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [filtered, setFiltered] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 fast typing state
  const [searchInput, setSearchInput] = useState(urlSearch);

  // sync URL → input
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // load categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/categories");
        const json = await res.json();
        setCategories(json ?? []);
      } catch {
        setCategories([]);
      }
    }
    loadCategories();
  }, []);

  // load products
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await fetch("/api/products");
        const json = await res.json();
        setProducts(json ?? []);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  // ⏳ delayed URL update (search only)
  useEffect(() => {
    const t = setTimeout(() => {
      updateURL("search", searchInput);
    }, 500);

    return () => clearTimeout(t);
  }, [searchInput]);

  // filter
  useEffect(() => {
    let list = [...products];

    if (urlCategory) {
      list = list.filter(p => p.categoryId === urlCategory);
    }

    if (urlSearch) {
      const q = urlSearch.toLowerCase();
      list = list.filter(p =>
        (p.name ?? "").toLowerCase().includes(q)
      );
    }

  list.sort((a, b) =>
  (a.name ?? "").localeCompare(b.name ?? "", undefined, {
    sensitivity: "base",
  })
);

    setFiltered(list);
  }, [urlCategory, urlSearch, products]);

  function updateURL(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push("?" + params.toString());
  }

  if (loading) {
    return <p className="p-4 text-gray-500">Loading products...</p>;
  }

  return (
    <div className="mt-2">
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={urlCategory}
            onChange={(e) => updateURL("category", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium mb-1">Search</label>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name..."
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      <h3 className="text-2xl mb-4 font-semibold">Products</h3>
<h3 className="text-2xl mb-1 font-semibold">
  Products ({products.length})
</h3>
      <div className="bg-slate-50 rounded-lg p-1 overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="p-4 text-gray-400 italic">No products found</p>
        ) : (
          <Table>
         <TableHeader>
  <TableRow>
   
    <th>Delete</th>
     <th>Product Name</th>
    <th>Search Code</th>
    <th>Sort</th>
    <th>Price</th>
   
    <th>Category</th>
     <th>Save</th>
  </TableRow>
</TableHeader>

            <TableBody>
              {filtered.map(product => (
                <TableRows
                  key={product.id}
                  product={product}
                  categoryData={categories}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
