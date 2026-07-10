"use client";

import { useState } from "react";
import { createProductionBatch } from "@/app/(universal)/action/production/createProductionBatch";
import { Plus, Trash2, Package } from "lucide-react";
import { InventoryItemType } from "@/lib/types/InventoryItemType";

type Props = {
  departments: { id: string; name: string }[];
  inventoryItems: InventoryItemType[];
};

export default function ProductionBatchForm({
  departments,
  inventoryItems,
}: Props) {

  console.log("inventoryItems----------------", inventoryItems)

  const [departmentId, setDepartmentId] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

const addItem = () => {
  setItems([
    ...items,
    {
      inventoryItemId: "",
      inventoryItemName: "",

      quantity: 0,

      purchaseUnit: "", // ✅ NEW
      consumptionUnit: "", // ✅ NEW

      costPerUnit: 0,

      purchaseMappings: [], // ✅ NEW
    },
  ]);
};

const updateItem = (index: number, field: string, value: any) => {
  const updated = [...items];
  updated[index][field] = value;

  // ✅ When item selected
  if (field === "inventoryItemId") {
    const selected = inventoryItems.find((i) => i.id === value);

    if (selected) {
      updated[index].inventoryItemName = selected.name;

      updated[index].purchaseMappings =
        selected.purchaseMappings || [];

      updated[index].costPerUnit = selected.averageCost;

      // ✅ auto select FIRST unit
      const firstUnit = selected.purchaseMappings?.[0];

      if (firstUnit) {
        updated[index].purchaseUnit = firstUnit.purchaseUnit;
        updated[index].consumptionUnit =
          firstUnit.consumptionUnit;

        // ✅ ADD THIS HERE
        updated[index].conversionFactor = firstUnit.factor;
      }
    }
  }

  // ✅ When unit changes (👉 ADD/KEEP THIS BLOCK HERE)
  if (field === "purchaseUnit") {
    const mapping = updated[index].purchaseMappings.find(
      (m: any) => m.purchaseUnit === value
    );

    if (mapping) {
      updated[index].consumptionUnit =
        mapping.consumptionUnit;

      // ✅ THIS IS YOUR LINE — PUT HERE
      updated[index].conversionFactor = mapping.factor;
    }
  }

  setItems(updated);
};


  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!departmentId) return alert("Select department");
    if (!items.length) return alert("Add at least 1 item");

    setLoading(true);

    try {
      const dept = departments.find((d) => d.id === departmentId);

      const res = await createProductionBatch({
        departmentId,
        departmentName: dept?.name || "",
        items,
        note,
      });

      if (!res.success) {
        alert(res.message);
        return;
      }

      alert("Batch Created ✔");
      setItems([]);
      setNote("");
      setDepartmentId("");
    } catch (err) {
      console.error(err);
      alert("Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl   space-y-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Package className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-semibold text-gray-800">
          Production Batch
        </h1>
      </div>

      {/* CARD */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5 shadow-sm">

        {/* Department */}
        <div>
          <label className="text-sm text-gray-600">Department</label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* ITEMS */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="font-medium text-gray-700">Items</h2>

            <button
              onClick={addItem}
              className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
            {/* HEADER */}
            <div className="grid grid-cols-5 bg-gray-100 text-sm font-medium px-3 py-2 text-gray-600">
              <div>Item</div>
              <div>Qty</div>
              <div>Unit</div>
              <div>Cost</div>
              <div></div>
            </div>

            {/* ROWS */}
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-5 gap-2 px-3 py-2 border-t items-center"
              >
                <select
                  className="border border-gray-300 rounded-md px-2 py-1 bg-white"
                  onChange={(e) =>
                    updateItem(index, "inventoryItemId", e.target.value)
                  }
                >
                  <option value="">Select</option>
                  {inventoryItems.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="0"
                  className="border border-gray-300 rounded-md px-2 py-1"
                  onChange={(e) =>
                    updateItem(index, "quantity", Number(e.target.value))
                  }
                />

              <select
  value={item.purchaseUnit}
  onChange={(e) =>
    updateItem(index, "purchaseUnit", e.target.value)
  }
  className="border border-gray-300 rounded-md px-2 py-1 bg-white"
>
  <option value="">Select Unit</option>

  {item.purchaseMappings?.map((m: any, i: number) => (
    <option key={i} value={m.purchaseUnit}>
      {m.purchaseUnit}
    </option>
  ))}
</select>
{/* <div className="text-xs text-gray-500">
  {item.consumptionUnit}
</div> */}

                {/* <input
                  value={item.costPerUnit}
                  readOnly
                  className="border border-gray-200 rounded-md px-2 py-1 bg-gray-100"
                /> */}

                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}

            {!items.length && (
              <div className="text-center text-sm text-gray-400 py-4">
                No items added
              </div>
            )}
          </div>
        </div>

        {/* NOTE */}
        <div>
          <label className="text-sm text-gray-600">Note</label>
          <textarea
            placeholder="Optional note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition font-medium"
        >
          {loading ? "Creating..." : "Create Batch"}
        </button>
      </div>
    </div>
  );
}