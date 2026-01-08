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
import { fetchAllUsers } from "@/app/(universal)/action/user/dbOperation";
import { userType } from "@/lib/types/userType";

type productTableProps = {
  limit?: number;
  title?: string;
};

const ListView = ({ title }: productTableProps) => {
  const [userData, setUserData] = useState<userType[]>([]);

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
    <div className="mt-10 p-2">
      <h3 className="text-2xl mb-4 font-semibold">{title || "Users"}</h3>
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-1">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 dark:bg-zinc-800">
              {/* <TableHead className="hidden md:table-cell">User ID</TableHead> */}
              <TableHead className="hidden md:table-cell">User Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
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
