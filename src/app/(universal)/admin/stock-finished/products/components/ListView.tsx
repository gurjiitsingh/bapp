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
import Link from "next/link";
import { Button } from "@/components/ui/button";

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


        setProducts(productsJson ?? []);
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





  useEffect(() => {
    let list = [...products];

    // Only parent products
    list = list.filter((p) => p.type === "parent");

    // Filter by category
    if (urlCategory) {
      list = list.filter((p) => p.categoryId === urlCategory);
    }

    // Filter by search safely
    if (urlSearch) {
      const search = urlSearch.toLowerCase();
      list = list.filter((p) => (p.name ?? "").toString().toLowerCase().includes(search));
    }

    // Sort by sortOrder
    list = list.sort(
      (a: ProductType, b: ProductType) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
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
      <div className="mb-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white rounded-2xl p-4 shadow-sm">

          {/* Left Side */}
          <div className="flex flex-col sm:flex-row gap-3">

            {/* Category */}
            <select
              value={urlCategory}
              onChange={(e) => updateURL("category", e.target.value)}
              className="
          h-10
          min-w-[180px]
          rounded-xl
          border border-gray-200
          bg-white
          px-3
          text-sm
          focus:outline-none
          focus:ring-2
          focus:ring-[#00897b]/20
        "
            >
              <option value="">All Categories</option>

              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Search */}
            <input
              type="text"
              value={urlSearch}
              onChange={(e) => updateURL("search", e.target.value)}
              placeholder="Search products..."
              className="
          h-10
          w-full
          sm:w-72
          rounded-xl
          border border-gray-200
          px-4
          text-sm
          focus:outline-none
          focus:ring-2
          focus:ring-[#00897b]/20
        "
            />
          </div>

          {/* Right Side */}
          <Link href="/admin/stock-finished/products/add">
            <Button
              className="
          h-10
          rounded-xl
          bg-slate-400
          hover:bg-[#00796b]
          text-white
          shadow-none
        "
            >
              + Add Product
            </Button>
          </Link>

        </div>
      </div>

      <h3 className="text-2xl mb-4 font-semibold">Products</h3>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead className="font-semibold text-gray-700">
                Search Code
              </TableHead>

              <TableHead className="font-semibold text-gray-700">
                Image
              </TableHead>

              <TableHead className="font-semibold text-gray-700">
                Name
              </TableHead>

              <TableHead className="font-semibold text-gray-700">
                Master Category
              </TableHead>

              <TableHead className="font-semibold text-gray-700">
                Category
              </TableHead>

              <TableHead className="font-semibold text-gray-700">
                Price
              </TableHead>

              <TableHead className="font-semibold text-gray-700">
                Discount
              </TableHead>

              <TableHead className="font-semibold text-gray-700">
                Tax
              </TableHead>

              <TableHead className="font-semibold text-gray-700">
                Status
              </TableHead>

              <TableHead className="font-semibold text-gray-700">
                Desc
              </TableHead>

              <TableHead className="font-semibold text-gray-700">
                Variant
              </TableHead>

              <TableHead className="font-semibold text-gray-700">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((product, index) => (
              <TableRows
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
