"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FaSave } from "react-icons/fa";
import { updateProductField } from "@/app/(universal)/action/products/dbOperation";
import { ProductType } from "@/lib/types/productType";
import { useState } from "react";
import { categoryType } from "@/lib/types/categoryType";

export default function TableRows({
  product,
  categoryData = [],
}: {
  product: ProductType;
  categoryData?: categoryType[];
}) {
  const [isSaving, setIsSaving] = useState(false);

  const [editData, setEditData] = useState({
    searchCode: product.searchCode ?? "",
    name: product.name ?? "",
    categoryId: product.categoryId ?? "",
    price: product.price ?? 0,
    discountPrice: product.discountPrice ?? 0,
    taxRate: product.taxRate ?? 0,
    taxType: product.taxType ?? "inclusive",
    stockQty: product.stockQty ?? 0,
    sortOrder: product.sortOrder ?? 0,
  });

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateProductField(product.id!, {
        ...editData,
        name: editData.name.trim(),
        categoryId: editData.categoryId || product.categoryId || "",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <TableRow className="whitespace-nowrap transition rounded-xl text-slate-600 hover:bg-green-50">
       <TableCell>
        <Button
          size="sm"
          disabled={isSaving}
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-2"
        >
          {isSaving ? "Saving..." : <FaSave />}
        </Button>
      </TableCell>
      <TableCell>
        <input
          className="border rounded-md px-2 py-1 w-24 text-sm bg-red-50"
          value={editData.searchCode}
          onChange={(e) =>
            setEditData({ ...editData, searchCode: e.target.value })
          }
        />
      </TableCell>

      <TableCell>
        <input
          type="number"
          className="border rounded-md px-2 py-1 w-10 text-sm "
          value={editData.sortOrder}
          onChange={(e) =>
            setEditData({ ...editData, sortOrder: Number(e.target.value) })
          }
        />
      </TableCell>
        <TableCell>
        <input
          type="number"
          className="border rounded-md px-2 py-1 w-20 text-sm"
          value={editData.price}
          onChange={(e) =>
            setEditData({ ...editData, price: Number(e.target.value) })
          }
        />
      </TableCell>

      <TableCell>
        <input
          className="border rounded-md px-2 py-1 w-70 text-sm bg-green-50"
          value={editData.name}
          onChange={(e) =>
            setEditData({ ...editData, name: e.target.value })
          }
        />
      </TableCell>

      <TableCell>
        <select
          className="border rounded-md px-2 py-1 text-sm"
          value={editData.categoryId || product.categoryId || ""}
          onChange={(e) =>
            setEditData({ ...editData, categoryId: e.target.value })
          }
        >
          <option value="">Select Category</option>
          {categoryData.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </TableCell>

    

      <TableCell>
        <input
          type="number"
          className="border rounded-md px-2 py-1 w-20 text-sm"
          value={editData.discountPrice}
          onChange={(e) =>
            setEditData({
              ...editData,
              discountPrice: Number(e.target.value),
            })
          }
        />
      </TableCell>

      <TableCell>
        <input
          type="number"
          className="border rounded-md px-2 py-1 w-16 text-sm"
          value={editData.stockQty}
          onChange={(e) =>
            setEditData({ ...editData, stockQty: Number(e.target.value) })
          }
        />
      </TableCell>

      <TableCell>
        <input
          type="number"
          className="border rounded-md px-2 py-1 w-20 text-sm"
          value={editData.taxRate}
          onChange={(e) =>
            setEditData({ ...editData, taxRate: Number(e.target.value) })
          }
        />
      </TableCell>

     
    </TableRow>
  );
}
