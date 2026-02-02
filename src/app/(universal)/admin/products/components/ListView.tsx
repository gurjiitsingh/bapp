"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import TableRows from "./TableRows";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductType } from "@/lib/types/productType";

export default function ListView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  //  URL state
  const urlCategory = searchParams.get("category") || "";
  const urlSearch = searchParams.get("search") || "";

  //  Component state
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  //  Fetch product + category only once
useEffect(() => {
  async function loadData() {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
      ]);

      const productsJson = await productsRes.json();
      const categoriesJson = await categoriesRes.json();


      setProducts(productsJson?? []);
      setCategories(categoriesJson ?? []);
    } catch (error) {
      console.error("Failed to load data:", error);
      setProducts([]);
      setCategories([]);
    }

    setLoading(false);
  }

  loadData();
}, []); //  run once


  //  Filter when URL state or products change
  // useEffect(() => {
  //   let list = [...products];

  //   if (urlCategory) {
  //     list = list.filter((p) => p.categoryId === urlCategory);
  //   }

  //   if (urlSearch) {
  //     list = list.filter((p) =>
  //       p.name.toLowerCase().includes(urlSearch.toLowerCase())
  //     );
  //   }

  //   setFiltered(list);
  // }, [urlCategory, urlSearch, products]);



  useEffect(() => {
  let list = [...products];

   list = list.filter((p) => p.type === "parent");
  if (urlCategory) {
    list = list.filter((p) => p.categoryId === urlCategory);
  }

  if (urlSearch) {
    list = list.filter((p) =>
      p.name.toLowerCase().includes(urlSearch.toLowerCase())
    );
  }

  // ⭐ Sort by sortOrder (undefined → 0)
  list = list.sort(
    (a: ProductType, b: ProductType) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
  );

  setFiltered(list);
}, [urlCategory, urlSearch, products]);

  //  Update URL without refreshing
  function updateURL(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(key, value);
    else params.delete(key);

    router.push("?" + params.toString());
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="mt-2">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">

        {/*  Category Filter */}
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={urlCategory}
            onChange={(e) => updateURL("category", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/*  Search Filter */}
        <div className="w-full md:w-1/2">
          <label className="block text-sm font-medium mb-1">Search</label>
          <input
            type="text"
            value={urlSearch}
            onChange={(e) => updateURL("search", e.target.value)}
            placeholder="Search by name..."
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      <h3 className="text-2xl mb-4 font-semibold">Products</h3>

      <div className="bg-slate-50 rounded-lg p-1 overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-zinc-800">
            <TableRow>
               <TableHead>Search Code</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Tax</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Desc</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((product) => (
              <TableRows key={product.id} product={product} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
