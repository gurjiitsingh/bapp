"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import TableRows from "./TableRows";
import { fetchAllUsers } from "@/app/(universal)/action/user/fetchAllUsersDashboard";
import { userType } from "@/lib/types/userType";
import { userDashboardType } from "@/lib/types/userDashboardType";

type productTableProps = {
  limit?: number;
  title?: string;
};

const ListView = ({ title }: productTableProps) => {
  const [userData, setUserData] = useState<userDashboardType[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const result = await fetchAllUsers();
        setUserData(result);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    fetchUsers();
  }, []);

  return (
    <div className="mt-5 p-2">
      <h3 className="text-2xl mb-4 font-semibold">{title || "Users"}</h3>
      <div className="bg-white dark:border-zinc-200 rounded-lg p-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 dark:border-zinc-200">
              {/* <TableHead className="hidden md:table-cell">User ID</TableHead> */}
              <TableHead className="hidden md:table-cell">User Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
               <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell text-right">Actions</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userData.map((user, i) => (
              <TableRows key={i} user={user} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ListView;
