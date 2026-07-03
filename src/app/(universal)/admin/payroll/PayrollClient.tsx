"use client";

import React, { useMemo, useState } from "react";
import {
  Search,
  IndianRupee,
  Users,
  AlertTriangle,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";

type Payroll = {
  id: string;
  employeeName: string;
  month: string;
  salary: number;
  paidAmount: number;
  status: "PAID" | "PENDING";
};

const mockData: Payroll[] = [
  {
    id: "1",
    employeeName: "Gurjit Singh",
    month: "June 2026",
    salary: 25000,
    paidAmount: 25000,
    status: "PAID",
  },
  {
    id: "2",
    employeeName: "Rahul",
    month: "June 2026",
    salary: 20000,
    paidAmount: 10000,
    status: "PENDING",
  },
];

export default function PayrollDashboard() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return mockData.filter((p) =>
      p.employeeName.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const totalSalary = filtered.reduce((sum, p) => sum + p.salary, 0);
  const totalPaid = filtered.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalPending = totalSalary - totalPaid;

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <h1 className="text-2xl font-bold">Employee Payroll</h1>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="p-4 bg-white rounded-xl shadow flex items-center gap-3">
          <IndianRupee className="text-green-600" />
          <div>
            <p className="text-sm text-gray-500">Total Salary</p>
            <p className="text-lg font-semibold">₹ {totalSalary}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl shadow flex items-center gap-3">
          <Users className="text-blue-600" />
          <div>
            <p className="text-sm text-gray-500">Paid</p>
            <p className="text-lg font-semibold">₹ {totalPaid}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl shadow flex items-center gap-3">
          <AlertTriangle className="text-red-600" />
          <div>
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-lg font-semibold">₹ {totalPending}</p>
          </div>
        </div>

      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white w-full md:w-1/3">
        <Search size={16} />
        <input
          placeholder="Search employee..."
          className="outline-none w-full text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((p) => {
              const due = p.salary - p.paidAmount;

              return (
                <TableRow
                  key={p.id}
                  className="odd:bg-zinc-50 even:bg-zinc-100 hover:bg-blue-50"
                >
                  <TableCell className="font-medium">
                    {p.employeeName}
                  </TableCell>

                  <TableCell>{p.month}</TableCell>

                  <TableCell>₹ {p.salary}</TableCell>

                  <TableCell>₹ {p.paidAmount}</TableCell>

                  <TableCell className="text-red-600">
                    ₹ {due}
                  </TableCell>

                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        p.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}