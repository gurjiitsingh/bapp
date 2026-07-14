"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FaSave } from "react-icons/fa";
import { deleteProductBulk, updateProductField } from "@/app/(universal)/action/products/dbOperation";
import { ProductType } from "@/lib/types/productType";
import { useState } from "react";
import { categoryType } from "@/lib/types/categoryType";

import { FaTrash } from "react-icons/fa";

export default function TableRows({
  product,
  categoryData = [],
}: {
  product: ProductType;
  categoryData?: categoryType[];
}) {
  const [isSaving, setIsSaving] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
const [editData, setEditData] = useState({
  searchCode: product.searchCode ?? "",
  name: product.name ?? "",
  categoryId: product.categoryId ?? "",
  price: product.price ?? 0,
  sortOrder: product.sortOrder ?? 0,
});


function capitalizeWords(text: string) {
  return text
    .toLowerCase()
    .replace(/\b\w/g, char => char.toUpperCase());
}
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

async function handleDelete() {
  if (!confirm("Delete this product?")) return;

  setIsDeleting(true);
  try {
    await deleteProductBulk(product.id!);

    // remove row from UI without reload
    const row = document.getElementById(`row-${product.id}`);
    row?.remove();
  } finally {
    setIsDeleting(false);
  }
}

  return (
     <TableRow
    id={`row-${product.id}`}
    className="whitespace-nowrap transition rounded-xl text-slate-600 hover:bg-green-50"
  >
        <TableCell>
  <Button
    size="sm"
    disabled={isDeleting}
    onClick={handleDelete}
    className="bg-red-600 hover:bg-red-700 text-white px-2"
  >
    {isDeleting ? "..." : <FaTrash />}
  </Button>
</TableCell>


<TableCell className="px-2 py-1">
  {capitalizeWords(editData.name)}
</TableCell>


 {/* <TableCell>
        <input
          className="border rounded-md px-2 py-1 w-70 text-sm bg-green-50"
          value={editData.name}
          onChange={(e) =>
            setEditData({ ...editData, name: e.target.value })
          }
        />
      </TableCell> */}
    
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
      <TableCell>
  {categoryData.find(c => c.id === product.categoryId)?.name || "-"}
</TableCell>
      </TableCell>

    

     


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
     
    </TableRow>
  );
}
