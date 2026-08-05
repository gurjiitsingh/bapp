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

    list.sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
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
<div className="mb-4 flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
  {/* Title */}
  <div className="w-full md:w-auto">
    <h3 className="text-2xl font-semibold">Products</h3>
  </div>

  {/* Category */}
  <div className="w-full md:w-64">
    <label className="mb-1 block text-sm font-medium">
      Category
    </label>

    <select
      value={urlCategory}
      onChange={(e) =>
        updateURL("category", e.target.value)
      }
      className="w-full rounded border border-gray-300 px-3 py-2"
    >
      <option value="">All Categories</option>

      {categories.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
        </option>
      ))}
    </select>
  </div>

  {/* Search */}
  <div className="w-full md:w-80">
    <label className="mb-1 block text-sm font-medium">
      Search
    </label>

    <input
      type="text"
      value={searchInput}
      onChange={(e) => setSearchInput(e.target.value)}
      placeholder="Search by name..."
      className="w-full rounded border border-gray-300 p-2"
    />
  </div>
</div>

   

      <div className="bg-slate-50 rounded-lg p-1 overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="p-4 text-gray-400 italic">No products found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                   <th>Save</th>
                <th>Search Code</th>
               
                <th>Sort</th>
                <th>Price</th>
                <th>Product Name</th>
                <th>Category</th>
                
                <th>Discount Price</th>
                {/* <th>Qty</th> */}
                <th>Tax</th>
              
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
