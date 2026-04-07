"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { getAllClients, updateClient } from "./action/client/dbOperations";

type Client = {
  clientId: string;
  projectId: string;
  status: string;
  renewDate: any;
  maxWaiters: number;
  maxPOS: number;
  clientKey: string;
};

export default function ClientListPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const data = await getAllClients();
    setClients(data);
    setLoading(false);
  };

  const handleUpdate = async (clientId: string, field: string, value: any) => {
    await updateClient(clientId, { [field]: value });
    loadClients();
  };

  return (
    <div className="p-5">
      <h1 className="text-xl font-semibold mb-4">Clients</h1>

      <div className="overflow-x-auto bg-white shadow rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Renew</TableHead>
              <TableHead>Waiters</TableHead>
              <TableHead>POS</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : clients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No clients found
                </TableCell>
              </TableRow>
            ) : (
              clients.map((c) => (
                <TableRow key={c.clientId}>
                  <TableCell>{c.clientId}</TableCell>
                  <TableCell>{c.projectId}</TableCell>

                  {/* STATUS */}
                  <TableCell>
                    <select
                      value={c.status}
                      onChange={(e) =>
                        handleUpdate(c.clientId, "status", e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="active">Active</option>
                      <option value="expired">Expired</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </TableCell>

                  {/* RENEW DATE */}
                  <TableCell>
                    <input
                      type="date"
                      value={
                        c.renewDate?.toDate
                          ? c.renewDate.toDate().toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        handleUpdate(c.clientId, "renewDate", e.target.value)
                      }
                      className="border rounded px-2 py-1"
                    />
                  </TableCell>

                  {/* WAITERS */}
                  <TableCell>
                    <input
                      type="number"
                      value={c.maxWaiters}
                      onChange={(e) =>
                        handleUpdate(
                          c.clientId,
                          "maxWaiters",
                          Number(e.target.value)
                        )
                      }
                      className="w-16 border rounded px-2 py-1"
                    />
                  </TableCell>

                  {/* POS */}
                  <TableCell>
                    <input
                      type="number"
                      value={c.maxPOS}
                      onChange={(e) =>
                        handleUpdate(
                          c.clientId,
                          "maxPOS",
                          Number(e.target.value)
                        )
                      }
                      className="w-16 border rounded px-2 py-1"
                    />
                  </TableCell>

                  {/* KEY */}
                  <TableCell className="text-xs break-all">
                    {c.clientKey}
                  </TableCell>

                  {/* ACTION */}
                  <TableCell>
                    <button
                      onClick={() => navigator.clipboard.writeText(c.clientKey)}
                      className="text-blue-600 text-sm"
                    >
                      Copy Key
                    </button>
                    
                  </TableCell>
                  <TableCell>
                   <a
  href={`/my/setting/edit/${c.clientId}`}
  className="text-blue-600 text-sm"
>
  Edit
</a>
                    
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}