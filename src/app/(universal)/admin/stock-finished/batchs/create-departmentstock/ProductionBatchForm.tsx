"use client";

import { useEffect, useState } from "react";

import {
  getDepartmentStock,
  type DepartmentStock,
} from "@/app/(universal)/action/production/departments/getDepartmentStock";
import {  createProductionBatchFromDpStock } from "@/app/(universal)/action/production/createProductionBatchFromDpStock";
import { Plus, Trash2, Package } from "lucide-react";
import { InventoryItemType } from "@/lib/types/InventoryItemType";
import toast from "react-hot-toast";
import Link from "next/link";

type Props = {
  departments: { id: string; name: string; employeeCount:number }[];
  inventoryItems: InventoryItemType[];
};

export default function ProductionBatchForm({
  departments,
  inventoryItems,
}: Props) {


  const [departmentStock, setDepartmentStock] = useState<DepartmentStock[]>([]);
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

        purchaseUnit: "",
        consumptionUnit: "",

        conversionFactor: 1,

        averageCost: 0,     // ✅ ADD THIS
        costPerUnit: 0,     // (derived)


      },
    ]);
  };
  const updateItem = (index: number, field: string, value: any) => {
    const updated = [...items];
    updated[index][field] = value;

    // ✅ When item selected
    if (field === "inventoryItemId") {
      const selected = departmentStock.find(
        (i) => i.inventoryItemId === value
      );

      if (selected) {
        updated[index].inventoryItemName = selected.inventoryItemName;
        updated[index].averageCost = selected.averageCost;

        updated[index].purchaseUnit = selected.purchaseUnit;
        updated[index].consumptionUnit = selected.consumptionUnit;
        updated[index].conversionFactor = selected.conversionFactor;
      }
    }



    setItems(updated);
  };


  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!departmentId) {
      toast.error("Select a department");
      return;
    }

    if (!items.length) {
      toast.error("Add at least one item");
      return;
    }

    setLoading(true);

    try {
      const dept = departments.find((d) => d.id === departmentId);

      

    const res =
  await createProductionBatchFromDpStock({
    departmentId,
    departmentName: dept?.name || "",
    employeeCount:
      dept?.employeeCount || 0,
    items,
    note,
  });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      toast.success("Batch created successfully");
      setItems([]);
      setNote("");
      setDepartmentId("");
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while creating the batch");
    } finally {
      setLoading(false);
    }
  };

const selectedDepartment = departments.find(
  (d) => d.id === departmentId
);
  useEffect(() => {
    async function loadDepartmentStock() {
      if (!departmentId) {
        setDepartmentStock([]);
        return;
      }

      try {
        const stock = await getDepartmentStock(departmentId);
        setDepartmentStock(stock);

        // Optional: clear previous items
        setItems([]);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load department stock");
      }
    }

    loadDepartmentStock();
  }, [departmentId]);

  return (
    <div className="p-6 max-w-5xl   space-y-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex items-center gap-3">


      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Package className="w-6 h-6 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">
            Production Batch
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Issue stock.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* <Link
                href="/admin/stock-finished/issue/add"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-red-600 px-5 font-medium text-white shadow-sm transition hover:bg-red-700"
              >
                Manual Production
              </Link> */}

          <Link
            href="/admin/stock-finished/batchs"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-red-200 bg-white px-5 font-medium text-red-600 shadow-sm transition hover:bg-red-50"
          >
            Production Batches
          </Link>
        </div>
      </div>


      {/* CARD */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5 shadow-sm">

        {/* Department */}
        <div className="flex gap-3">
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

{selectedDepartment && (
  <div className="mt-6 flex h-[42px] gap-3 items-center justify-between rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm">
    <span className="text-gray-600">
      Employee Count
    </span>

    <span className="font-semibold text-blue-700">
      {selectedDepartment.employeeCount}
    </span>
  </div>
)}
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
  value={item.inventoryItemId}
  className="border border-gray-300 rounded-md px-2 py-1 bg-white"
  onChange={(e) =>
    updateItem(index, "inventoryItemId", e.target.value)
  }
>
  <option value="">Select</option>

  {departmentStock.map((i) => (
    <option
      key={i.inventoryItemId}
      value={i.inventoryItemId}
    >
      {i.inventoryItemName} ({i.quantity} {i.purchaseUnit})
    </option>
  ))}
</select>

             <input
  type="number"
  value={item.quantity}
  placeholder="0"
  className="border border-gray-300 rounded-md px-2 py-1"
  onChange={(e) =>
    updateItem(index, "quantity", Number(e.target.value))
  }
/>

           <input
  readOnly
  value={item.purchaseUnit}
  className="border border-gray-300 rounded-md px-2 py-1 bg-gray-100"
/>
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