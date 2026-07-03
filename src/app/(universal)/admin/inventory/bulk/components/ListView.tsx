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
import InventoryTableRows from "./TableRows";
import { InventoryItemType } from "@/lib/types/InventoryItemType";

type Props = {
  inventoryItems: InventoryItemType[]
}

export default function ListView({
  inventoryItems,
}: Props) {

  console.log("inventroy item-------------------",inventoryItems)
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlCategory = searchParams.get("category") || "";
  const urlSearch = searchParams.get("search") || "";

  const [categories, setCategories] = useState<categoryType[]>([]);
const [filtered, setFiltered] = useState<InventoryItemType[]>([]);
   

  // 🔥 fast typing state
  const [searchInput, setSearchInput] = useState(urlSearch);

  // sync URL → input
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // load categories


  // load products


useEffect(() => {
  let list = [...inventoryItems];

  if (urlCategory) {
    list = list.filter(
      (i) => i.categoryId === urlCategory
    );
  }

  if (urlSearch) {
    const q = urlSearch.toLowerCase();

    list = list.filter((i) =>
      i.name.toLowerCase().includes(q)
    );
  }

  setFiltered(list);
}, [inventoryItems, urlCategory, urlSearch]);

useEffect(() => {
  const t = setTimeout(() => {
    updateURL("search", searchInput);
  }, 500);

  return () => clearTimeout(t);
}, [searchInput]);

  function updateURL(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push("?" + params.toString());
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

      <div className="bg-slate-50 rounded-lg p-1 overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="p-4 text-gray-400 italic">No products found</p>
        ) : (
          <Table>
          <TableHeader>
  <TableRow>
    <th>Save</th>
    <th>Name</th>
    <th>Category</th>
    {/* <th>Purchase Unit</th>
    <th>Consumption Unit</th>
    <th>Conversion</th> */}
    <th>Current Stock</th>
    <th>Average Cost</th>
  </TableRow>
</TableHeader>

           <TableBody>
  {filtered.map((item) => (
    <InventoryTableRows
      key={item.id}
      item={item}
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
