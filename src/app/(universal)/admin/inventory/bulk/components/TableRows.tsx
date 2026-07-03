"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FaSave } from "react-icons/fa";

 
import { categoryType } from "@/lib/types/categoryType";
import { InventoryItemType } from "@/lib/types/InventoryItemType";
 
 

export default function InventoryTableRows({
  item,
  categoryData = [],
}: {
  item: InventoryItemType;
  categoryData?: categoryType[];
}) {
  const [isSaving, setIsSaving] = useState(false);

  const [editData, setEditData] = useState({
    name: item.name ?? "",
    categoryId: item.categoryId ?? "",
    purchaseUnit: item.purchaseUnit,
    consumptionUnit: item.consumptionUnit,
    conversionFactor: item.conversionFactor ?? 1,
    currentStock: item.currentStock ?? 0,
    averageCost: item.averageCost ?? 0,
  });

  async function handleSave() {
    setIsSaving(true);

    // try {
    //   await updateInventoryItemField(item.id, editData);
    // } finally {
    //   setIsSaving(false);
    // }
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
          className="border rounded-md px-2 py-1 w-64 text-sm bg-green-50"
          value={editData.name}
          onChange={(e) =>
            setEditData({
              ...editData,
              name: e.target.value,
            })
          }
        />
      </TableCell>

      <TableCell>
        <select
          className="border rounded-md px-2 py-1 text-sm"
          value={editData.categoryId}
          onChange={(e) =>
            setEditData({
              ...editData,
              categoryId: e.target.value,
            })
          }
        >
          <option value="">Select Category</option>

          {categoryData.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </TableCell>

      {/* <TableCell>
        <select
          className="border rounded-md px-2 py-1"
          value={editData.purchaseUnit}
          onChange={(e) =>
            setEditData({
              ...editData,
              purchaseUnit: e.target.value as InventoryUnit,
            })
          }
        >
          {Object.values(InventoryUnit).map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </TableCell> */}

      {/* <TableCell>
        <select
          className="border rounded-md px-2 py-1"
          value={editData.consumptionUnit}
          onChange={(e) =>
            setEditData({
              ...editData,
              consumptionUnit: e.target.value as InventoryUnit,
            })
          }
        >
          {Object.values(InventoryUnit).map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </TableCell> */}

      {/* <TableCell>
        <input
          type="number"
          className="border rounded-md px-2 py-1 w-20"
          value={editData.conversionFactor}
          onChange={(e) =>
            setEditData({
              ...editData,
              conversionFactor: Number(e.target.value),
            })
          }
        />
      </TableCell> */}

      <TableCell>
        <input
          type="number"
          className="border rounded-md px-2 py-1 w-24"
          value={editData.currentStock}
          onChange={(e) =>
            setEditData({
              ...editData,
              currentStock: Number(e.target.value),
            })
          }
        />
      </TableCell>

      <TableCell>
        <input
          type="number"
          className="border rounded-md px-2 py-1 w-24"
          value={editData.averageCost}
          onChange={(e) =>
            setEditData({
              ...editData,
              averageCost: Number(e.target.value),
            })
          }
        />
      </TableCell>

    </TableRow>
  );
}