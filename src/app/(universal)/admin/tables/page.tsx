"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { getTables, saveTables } from "@/app/(universal)/action/tables/dbOperations";
import { tableDataT } from "@/lib/types/tableType";


export default function TableSetupForm() {
  const [tableCount, setTableCount] = useState(12);
  const [tables, setTables] = useState<tableDataT[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await getTables();
      setTables(data);
    }
    loadData();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("tableCount", String(tableCount));

    const res = await saveTables(formData);

    if (res?.success) {
      alert(`✅ ${tableCount} tables created successfully`);
      const data = await getTables();
      setTables(data);
    } else {
      alert("❌ Failed to create tables");
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create Restaurant Tables</h1>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <label className="font-medium text-sm">
          Number of Tables to Create:
          <input
            type="number"
            className="border rounded-md px-3 py-2 ml-2 w-24"
            min={1}
            value={tableCount}
            onChange={(e) => setTableCount(Number(e.target.value))}
          />
        </label>

        <Button type="submit" className="w-full">
          Create Tables
        </Button>
      </form>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-2">Current Tables</h2>

        {!tables.length && <p>No tables found yet.</p>}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tables.map((t) => (
            <div
              key={t.id}
              className={`p-3 rounded-lg text-center text-sm border ${
                t.status === "AVAILABLE"
                  ? "bg-green-50 border-green-300"
                  : "bg-yellow-50 border-yellow-300"
              }`}
            >
              <p className="font-medium">{t.tableName}</p>
              <p className="text-xs text-gray-600">{t.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
