// app/admin/product-recipes/ListView.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Search, ChefHat } from "lucide-react";

import { ProductRecipeType } from "@/lib/types/ProductRecipeType";

type Props = {
  recipes: ProductRecipeType[];
};

export default function ListView({
  recipes,
}: Props) {
  const [search, setSearch] =
    useState("");

  const groupedProducts =
    useMemo(() => {
      const map = new Map();

      recipes.forEach((recipe) => {
        if (
          !map.has(recipe.productId)
        ) {
          map.set(recipe.productId, {
            productId:
              recipe.productId,

            productName:
              recipe.productName,

            items: [],
          });
        }

        map.get(
          recipe.productId
        ).items.push(recipe);
      });

      return Array.from(
        map.values()
      );
    }, [recipes]);

  const filteredProducts =
    useMemo(() => {
      if (!search.trim()) {
        return groupedProducts;
      }

      return groupedProducts.filter(
        (product: any) =>
          product.productName
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );
    }, [
      groupedProducts,
      search,
    ]);

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
      <div className="w-full flex flex-col gap-6">

        {/* HEADER */}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Product Recipe
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Search product to view Recipes/components
            </p>
          </div>

          <Link
            href="/admin/inventory/product-recipes/new/recipes"
            className="btn-save-4"
          >
            Add Recipe
          </Link>
        </div>

        {/* SEARCH */}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search product..."
              className="input-style-4 pl-12"
            />
          </div>
        </div>

        {/* TABLE */}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 ">
                <tr>
                  <th className="text-left px-5 py-4 text-sm font-semibold">
                    Product
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold">
                    Ingredients
                  </th>

                  <th className="text-left px-5 py-4 text-sm font-semibold">
                    Preview
                  </th>

                  <th className="text-right px-5 py-4 text-sm font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center py-16 text-gray-400"
                    >
                      No Recipe found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(
                    (
                      product: any
                    ) => (
                      <tr
                        key={
                          product.productId
                        }
                        className="whitespace-nowrap hover:bg-green-50 dark:hover:bg-zinc-100 transition"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                              <ChefHat
                                size={18}
                                className="text-blue-600"
                              />
                            </div>

                            <div>
                              <div className="font-semibold text-gray-800">
                                {
                                  product.productName
                                }
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-medium">
                            {
                              product
                                .items
                                .length
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="max-w-[350px] truncate text-sm text-gray-500">
                            {product.items
                              .slice(
                                0,
                                4
                              )
                              .map(
                                (
                                  item: ProductRecipeType
                                ) =>
                                  item.inventoryItemName
                              )
                              .join(
                                ", "
                              )}

                            {product.items
                              .length >
                              4 &&
                              " ..."}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <Link
                          href={`/admin/inventory/product-recipes/edit/${product.productId}`}
                            className="inline-flex items-center rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
                          >
                            View/Edit
                          </Link>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}