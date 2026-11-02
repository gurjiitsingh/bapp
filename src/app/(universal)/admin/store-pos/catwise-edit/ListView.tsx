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
import { updateDiscountEligibleForCategory } from "@/app/(universal)/action/products/updateDiscountEligibleForCategory";
import { updateTaxTypeForCategory } from "@/app/(universal)/action/products/updateTaxTypeForCategory";
import { updateTaxRateForCategory } from "@/app/(universal)/action/products/updateTaxRateForCategory";
import { updateTaxCategoryForCategory } from "@/app/(universal)/action/products/updateTaxCategoryForCategory";
import toast from "react-hot-toast";

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
  const [discountEligible, setDiscountEligible] =
    useState(true);

  const [updatingDiscountEligible, setUpdatingDiscountEligible] =
    useState(false);

  const [taxType, setTaxType] = useState<"inclusive" | "exclusive">("exclusive");
  const [taxType1, setTaxType1] = useState<"inclusive" | "exclusive">("exclusive");

  const [updatingTaxType, setUpdatingTaxType] =
    useState(false);



  const [taxRate, setTaxRate] = useState<number>(5);
  const [taxRate1, setTaxRate1] = useState<number>(10);
  const [updatingTaxRate, setUpdatingTaxRate] = useState(false);

  const [taxCategory, setTaxCategory] =
    useState<"LIQUOR_VAT" | "FOOD_GST">("FOOD_GST");

  const [updatingTaxCategory, setUpdatingTaxCategory] =
    useState(false);

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



  async function handleApplyDiscountEligible() {
    if (!urlCategory) {
      toast.error("Please select a category first.");
      return;
    }

    try {
      setUpdatingDiscountEligible(true);

      const result =
        await updateDiscountEligibleForCategory(
          urlCategory,
          discountEligible
        );

      if (!result.success) {
        toast.error(
          result.error || "Failed to update products"
        );
        return;
      }

      toast.success(
        `${result.updatedCount} products updated`
      );

      // Refresh current product list
      const updatedProducts =
        await fetchProductsForList({
          categoryId: urlCategory,
          search: "",
        });

      setProducts(updatedProducts);

    } catch (error) {
      console.error(error);
      toast.error("Failed to update products");
    } finally {
      setUpdatingDiscountEligible(false);
    }
  }


  async function handleApplyTaxType() {
    if (!urlCategory) {
      toast.error("Please select a category first.");
      return;
    }

    try {
      setUpdatingTaxType(true);

      const result = await updateTaxTypeForCategory(
        urlCategory,
        taxType,
        taxType1
      );

      if (!result.success) {
        toast.error(
          result.error || "Failed to update tax types"
        );
        return;
      }

      toast.success(
        `Both tax types updated for ${result.updatedCount} products`
      );

      // Refresh the current category's products
      const updatedProducts = await fetchProductsForList({
        categoryId: urlCategory,
        search: "",
      });

      setProducts(updatedProducts);

    } catch (error) {
      console.error("Failed to update category tax types:", error);
      toast.error("Failed to update tax types");
    } finally {
      setUpdatingTaxType(false);
    }
  }


  async function handleApplyTaxRate() {
    if (!urlCategory) {
      toast.error("Please select a category first.");
      return;
    }

    try {
      setUpdatingTaxRate(true);

      const result = await updateTaxRateForCategory(
        urlCategory,
        taxRate,
        taxRate1
      );

      if (!result.success) {
        toast.error(result.error || "Failed to update tax rates");
        return;
      }

      toast.success(
        `Tax rates updated for ${result.updatedCount} products`
      );

      const updatedProducts = await fetchProductsForList({
        categoryId: urlCategory,
        search: "",
      });

      setProducts(updatedProducts);
    } catch (error) {
      console.error("Failed to update category tax rates:", error);
      toast.error("Failed to update tax rates");
    } finally {
      setUpdatingTaxRate(false);
    }
  }


  async function handleApplyTaxCategory() {
    if (!urlCategory) {
      toast.error("Please select a category first.");
      return;
    }

    try {
      setUpdatingTaxCategory(true);

      const result = await updateTaxCategoryForCategory(
        urlCategory,
        taxCategory
      );

      if (!result.success) {
        toast.error(
          result.error || "Failed to update tax category"
        );
        return;
      }

      toast.success(
        `Tax category updated for ${result.updatedCount} products`
      );

      const updatedProducts = await fetchProductsForList({
        categoryId: urlCategory,
        search: "",
      });

      setProducts(updatedProducts);

    } catch (error) {
      console.error("Failed to update tax category:", error);
      toast.error("Failed to update tax category");
    } finally {
      setUpdatingTaxCategory(false);
    }
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

      <div className="flex flex-col  gap-5 py-10 pl-5">

                  <div className="flex items-center gap-2">

  <label className="text-sm font-medium whitespace-nowrap">
    Tax Category
  </label>

  <select
    value={taxCategory}
    onChange={(e) =>
      setTaxCategory(
        e.target.value as "LIQUOR_VAT" | "FOOD_GST"
      )
    }
    className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00897b]/20"
  >
    <option value="FOOD_GST">Food GST</option>
    <option value="LIQUOR_VAT">Liquor VAT</option>
  </select>

  <Button
    type="button"
    onClick={handleApplyTaxCategory}
    disabled={updatingTaxCategory}
    className="h-10 rounded-xl bg-purple-600 text-white shadow-none hover:bg-purple-700"
  >
    {updatingTaxCategory
      ? "Saving..."
      : "Apply Tax Category"}
  </Button>

</div>
   

        <div className="flex flex-wrap items-center gap-5 border-slate-400">

          {/* First Tax Type */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">
              Tax Type
            </label>

            <select
              value={taxType}
              onChange={(e) =>
                setTaxType(
                  e.target.value as "inclusive" | "exclusive"
                )
              }
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00897b]/20"
            >
              <option value="inclusive">Inclusive</option>
              <option value="exclusive">Exclusive</option>
            </select>
          </div>

          {/* Second Tax Type */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium whitespace-nowrap">
              Tax Type Second
            </label>

            <select
              value={taxType1}
              onChange={(e) =>
                setTaxType1(
                  e.target.value as "inclusive" | "exclusive"
                )
              }
              className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00897b]/20"
            >
              <option value="inclusive">Inclusive</option>
              <option value="exclusive">Exclusive</option>
            </select>
          </div>

          {/* Apply Both */}
          <Button
            type="button"
            onClick={handleApplyTaxType}
            disabled={updatingTaxType}
            className="h-10 rounded-xl bg-blue-600 text-white shadow-none hover:bg-blue-700"
          >
            {updatingTaxType ? "Saving..." : "Apply Both Tax Types"}
          </Button>

        </div>


        <div className="flex flex-wrap items-center gap-5 border-slate-400">
          <div className="flex items-center gap-1">
            <label
              htmlFor="category-tax-rate"
              className="text-sm font-medium whitespace-nowrap"
            >
              Tax Rate
            </label>

            <input
              id="category-tax-rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="h-10 w-20 rounded-xl border border-gray-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00897b]/20"
            />
            <span className="text-sm">%</span>
          </div>

          <div className="flex items-center gap-1">
            <label
              htmlFor="category-tax-rate1"
              className="text-sm font-medium whitespace-nowrap"
            >
              Tax Rate Second
            </label>

            <input
              id="category-tax-rate1"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={taxRate1}
              onChange={(e) => setTaxRate1(Number(e.target.value))}
              className="h-10 w-20 rounded-xl border border-gray-200 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00897b]/20"
            />
            <span className="text-sm">%</span>
          </div>

          <Button
            type="button"
            onClick={handleApplyTaxRate}
            disabled={updatingTaxRate}
            className="h-10 rounded-xl bg-[#00897b] text-white shadow-none hover:bg-[#00796b]"
          >
            {updatingTaxRate ? "Saving..." : "Apply Both Rates"}
          </Button>
        </div>

     {urlCategory && (
          <div className="flex items-center gap-5 border-slate-400">
            <span>Discount </span>
            <select
              value={discountEligible ? "true" : "false"}
              onChange={(e) =>
                setDiscountEligible(e.target.value === "true")
              }
              className="
        h-10
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
              <option value="true">
                Eligible
              </option>

              <option value="false">
                Not Eligible
              </option>
            </select>

            <Button
              type="button"
              onClick={handleApplyDiscountEligible}
              disabled={updatingDiscountEligible}
              className="
        h-10
        rounded-xl
        bg-[#00897b]
        text-white
        shadow-none
        hover:bg-[#00796b]
      "
            >
              {updatingDiscountEligible
                ? "Saving..."
                : "Apply to All"}
            </Button>

          </div>
        )}

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
                Tax Category
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Tax
              </TableHead>
              <TableHead className="font-semibold text-gray-700">
                Tax(Second)
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