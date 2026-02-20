"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getTables, saveTables } from "@/app/(universal)/action/tables/dbOperations";
import { tableDataT } from "@/lib/types/tableType";


export default function TableSetupForm() {
  const [tableCount, setTableCount] = useState(12);
  const [tables, setTables] = useState<tableDataT[]>([]);
  const [area, setArea] = useState("Ground Floor");
  const [customArea, setCustomArea] = useState("");
  const [tablePrefix, setTablePrefix] = useState("Table");

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
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Restaurant Tables</h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
        <label className="font-medium text-sm">
          Table Name Prefix:
          <input
            type="text"
            className="border rounded-md px-3 py-2 ml-2"
            value={tablePrefix}
            onChange={(e) => setTablePrefix(e.target.value)}
            placeholder="e.g. Table, Booth, Seat"
          />
        </label>

        {/* Area Selector */}
        <label className="font-medium text-sm">
          Select Area:
          <select
            className="border rounded-md px-3 py-2 ml-2"
            value={area}
            onChange={(e) => setArea(e.target.value)}
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
        </label>

        {/* Custom Area Input */}
        <label className="font-medium text-sm">
          Or Enter Custom Area:
          <input
            type="text"
            className="border rounded-md px-3 py-2 ml-2"
            value={customArea}
            onChange={(e) => setCustomArea(e.target.value)}
            placeholder="e.g. VIP Lounge, Terrace"
          />
        </label>

        <Button type="submit" className="w-full">
          Create Tables
        </Button>
      </form>

      {/* Table List */}
      <div className="mt-8">
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
                <h3 className="text-md font-semibold mb-2 text-blue-700">
                  {areaName}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {areaTables.map((t) => (
                    <div
                      key={t.id}
                      className={`p-3 rounded-lg text-center text-sm border ${
                        t.status === "AVAILABLE"
                          ? "bg-green-50 border-green-300"
                          : "bg-yellow-50 border-yellow-300"
                      }`}
                    >
                      <p className="font-medium">{t.tableName}</p>
                      <p className="text-xs text-gray-500">
                        Sort: {t.sortOrder ?? "-"}
                      </p>
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

