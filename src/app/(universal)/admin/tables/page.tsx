"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { deleteTable, getTables, saveTables } from "@/app/(universal)/action/tables/dbOperations";
import { tableDataT } from "@/lib/types/tableType";


export default function TableSetupForm() {
  const [tableCount, setTableCount] = useState(12);
  const [tables, setTables] = useState<tableDataT[]>([]);
  const [area, setArea] = useState("Ground Floor");
  const [customArea, setCustomArea] = useState("");
  const [tablePrefix, setTablePrefix] = useState("Table");
const [isEditMode, setIsEditMode] = useState(false);


function handleEditArea(areaName: string, areaTables: tableDataT[]) {
  if (!areaTables.length) return;

  const firstName = areaTables[0].tableName || "Table";
  const prefix = firstName.replace(/\s*\d+$/, "");

  setArea(areaName);
  setCustomArea(areaName);
  setTablePrefix(prefix);
  setTableCount(areaTables.length);

  setIsEditMode(true); // ✅ ADD THIS

  window.scrollTo({ top: 0, behavior: "smooth" });
}
  async function handleDelete(tableId: string) {
  const confirmDelete = confirm("Delete this table?");
  if (!confirmDelete) return;

  try {
    await deleteTable(tableId);

    // Refresh list
    const data = await getTables();
    setTables(data);

  } catch (e) {
    alert("❌ Failed to delete table");
  }
}

  useEffect(() => {
    async function loadData() {
      const data = await getTables();
      setTables(data);
    }
    loadData();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const selectedArea = customArea.trim() !== "" ? customArea.trim() : area;

    const formData = new FormData();
    formData.append("tableCount", String(tableCount));
    formData.append("area", selectedArea);
    formData.append("tablePrefix", tablePrefix);

    const res = await saveTables(formData);

    if (res?.success) {
      alert(`✅ ${tableCount} tables created for ${selectedArea}`);
      const data = await getTables();
      setTables(data);
      setCustomArea("");
      setIsEditMode(false);
    } else {
      alert("❌ Failed to create tables");
    }
  }

  // ✅ Group tables by area
  const groupedTables = tables.reduce<Record<string, tableDataT[]>>((acc, t) => {
    if (!acc[t.area ?? "General"]) acc[t.area ?? "General"] = [];
    acc[t.area ?? "General"].push(t);
    return acc;
  }, {});

  return (
    <div className="w-full mx-auto px-6 py-1">
      <h1 className="text-2xl font-semibold mb-4">
  {isEditMode ? "Edit Tables" : "Create Tables"}
</h1>

    <form
  onSubmit={onSubmit}
  className="flex flex-col gap-4 bg-white shadow-md rounded-xl p-5 border"
>
        {/* Table Count */}
        <label className="font-medium text-sm">
          Number of Tables:
          <input
            type="number"
            className="border rounded-md px-3 py-2 ml-2 w-24"
            min={1}
            value={tableCount}
            onChange={(e) => setTableCount(Number(e.target.value))}
          />
        </label>

        {/* Table Prefix */}
         {/* Prefix */}
  <label className="font-medium text-sm flex items-center gap-2">
    Table Name Prefix:
    <input
      type="text"
      className="border rounded-md px-3 py-2"
      value={tablePrefix}
      onChange={(e) => setTablePrefix(e.target.value)}
      placeholder="e.g. Table, Booth, Seat"
    />
  </label>

  {/* Area + Custom */}
  <div>
  <label className="font-medium text-sm flex items-center gap-2 flex-wrap">
    Select Title:
    
   <select
  className="border rounded-md px-3 py-2"
  value={area}
  onChange={(e) => {
    setArea(e.target.value);
    setCustomArea(""); // ✅ clear custom when selecting
  }}
  disabled={customArea.trim() !== ""} // ✅ disable if custom filled
>
      <option>Restaurant</option>
      <option>Bar</option>
      <option>Party Hall</option>
      <option>Basement Hall</option>
      <option>Ground Floor</option>
      <option>First Floor</option>
      <option>Rooftop</option>
      <option>Outdoor</option>
    </select>

    <span className="text-gray-500">or</span>

   <input
  type="text"
  className="border rounded-md px-3 py-2"
  value={customArea}
  onChange={(e) => {
    setCustomArea(e.target.value);
  }}
  placeholder="e.g. VIP Lounge, Terrace"
/>
  </label>

</div>

       

       <Button
  type="submit"
  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-md transition"
>
  Create/Edit Tables
</Button>
      </form>

      {/* Table List */}
      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Current Tables by Area</h2>
        {!tables.length && <p>No tables found yet.</p>}

        {Object.keys(groupedTables)
          .sort()
          .map((areaName) => {
            const areaTables = groupedTables[areaName].sort(
              (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)
            );
            return (
              <div key={areaName} className="mb-6">
              <div className="flex items-center justify-between mb-2">
  <h3 className="text-md font-semibold text-blue-700">
    {areaName}
  </h3>

  <button
    onClick={() => handleEditArea(areaName, areaTables)}
    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
  >
    Edit
  </button>
</div>
         <div className="grid gap-2 place-items-center [grid-template-columns:repeat(auto-fill,minmax(100px,1fr))]">
                  {areaTables.map((t) => (
                  <div
  key={t.id}
  className={`relative w-[100px] h-[60px] flex flex-col justify-center items-center rounded-xl border shadow-sm hover:shadow-md transition ${
    t.status === "AVAILABLE"
      ? "bg-green-100 border-green-400"
      : "bg-yellow-100 border-yellow-400"
  }`}
>
  {/* ❌ Delete Button */}
  <button
    onClick={() => handleDelete(t.id)}
    className="absolute top-1 right-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-full px-1.5 text-[10px]"
  >
    ✕
  </button>
                    <p className="text-sm font-semibold">{t.tableName}</p>
<p className="text-[10px] text-gray-600">{t.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

