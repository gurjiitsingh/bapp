"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TableRows from "./TableRows";
import { categoryType } from "@/lib/types/categoryType";
import { ProductType } from "@/lib/types/productType";
import { fetchProductsForList } from "@/app/(universal)/action/products/fetchProductsForList";


type ListViewProps = {
  categories: categoryType[];
};

export default function ListView({
  categories,
}: ListViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // =====================================================
  // URL STATE
  // =====================================================

  const urlCategory = searchParams.get("category") || "";
  const urlSearch = searchParams.get("search") || "";

  useEffect(() => {
    // If category is selected, search box must always be empty
    if (urlCategory) {
      setSearchText("");
      return;
    }

    // Otherwise sync search from URL
    setSearchText(urlSearch);
  }, [urlCategory, urlSearch]);

  // =====================================================
  // UPDATE URL
  // =====================================================

  // =====================================================
  // CATEGORY CHANGE
  // Selecting category clears search
  // =====================================================

  function handleCategoryChange(value: string) {
    // FIRST: immediately clear the visible search box
    setSearchText("");

    // Build URL with category ONLY
    const params = new URLSearchParams();

    if (value) {
      params.set("category", value);
    }

    // IMPORTANT:
    // Do NOT put search back into params
    router.push("?" + params.toString());
  }





  // =====================================================
  // SEARCH CHANGE
  // Typing search clears category
  // =====================================================

  function handleSearchChange(value: string) {
    // Update input immediately
    setSearchText(value);

    const params = new URLSearchParams(searchParams.toString());

    // Searching → remove category
    params.delete("category");

    if (value.trim()) {
      params.set("search", value);
    } else {
      params.delete("search");
    }

    router.push("?" + params.toString());
  }

  // =====================================================
  // FETCH PRODUCTS
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      // -------------------------------------------------
      // No category + no search
      // Do NOT fetch products
      // -------------------------------------------------

      if (!urlCategory && !urlSearch.trim()) {
        setProducts([]);
        return;
      }

      try {
        setLoading(true);

        const result = await fetchProductsForList({
          categoryId: urlCategory,
          search: urlCategory ? "" : urlSearch,
        });
        if (!cancelled) {
          setProducts(result);
        }
      } catch (error) {
        console.error(
          "Failed to load products:",
          error
        );

        if (!cancelled) {
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [urlCategory, urlSearch]);

  return (
    <div className="mt-2">

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="flex flex-col gap-3 rounded-2xl mx-1 bg-slate-100 mb-1 p-4 shadow-sm md:flex-row md:items-center md:justify-between">

        {/* Left Side */}

        <div className="flex flex-col gap-3  sm:flex-row sm:items-center">

          <h3 className="text-2xl font-semibold whitespace-nowrap">
            Products
          </h3>

          {/* Category */}

          <select
            value={urlCategory}
            onChange={(e) =>
              handleCategoryChange(e.target.value)
            }
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
            <option value="">
              Select Category
            </option>

            {categories.map((c) => (
              <option
                key={c.id}
                value={c.id}
              >
                {c.name}
              </option>
            ))}
          </select>

          {/* Search */}

          {/* <input
            type="text"
            value={searchText}
            onChange={(e) =>
              handleSearchChange(e.target.value)
            }
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
          /> */}

        </div>

        {/* =====================================================
            RIGHT SIDE BUTTONS
        ===================================================== */}

        <div className="flex flex-col gap-2 sm:flex-row md:justify-end">

          <Link href="/admin/store-pos/products/bulk">
            <Button
              className="
                h-10
                rounded-xl
                bg-slate-400
                text-white
                shadow-none
                hover:bg-[#00796b]
              "
            >
              Quick Edit
            </Button>
          </Link>

          <Link href="/admin/store-pos/products/add">
            <Button
              className="
                h-10
                rounded-xl
                bg-[#00897b]
                text-white
                shadow-none
                hover:bg-[#00796b]
              "
            >
              + Add Product
            </Button>
          </Link>

        </div>

      </div>

      {/* =====================================================
          PRODUCT TABLE
      ===================================================== */}

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

            {loading ? (
              <TableRow>
                <td
                  colSpan={12}
                  className="py-10 text-center text-sm text-gray-500"
                >
                  Loading products...
                </td>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <td
                  colSpan={12}
                  className="py-10 text-center text-sm text-gray-500"
                >
                  {urlCategory || urlSearch
                    ? "No products found."
                    : "Select a category or search for a product."}
                </td>
              </TableRow>
            ) : (
              products.map((product, index) => (
                <TableRows
                  key={product.id}
                  product={product}
                  index={index}
                />
              ))
            )}

          </TableBody>

        </Table>

      </div>

    </div>
  );
}