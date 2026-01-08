"use client";

import { deleteUser } from "@/app/(universal)/action/user/dbOperation";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { userType } from "@/lib/types/userType";
import { MdDeleteForever } from "react-icons/md";
import { useLanguage } from "@/store/LanguageContext";

function TableRows({ user }: { user: userType }) {
  const { TEXT } = useLanguage();
 
  async function handleDelete(user: userType) {
    const confirmDelete = confirm(
      TEXT?.confirm_delete_user ||
        "Do you want to delete this user?\nIf yes, click OK.\nIf not, click Cancel."
    );
    if (!confirmDelete) return;

    const result = await deleteUser(user.id);

    if (result.message.success === "ok") {
      location.reload();
    } else {
      alert(TEXT?.alert_failed_delete || "Failed to delete user.");
    }
  }

  return (
    <TableRow className="whitespace-nowrap hover:bg-green-50 dark:hover:bg-zinc-800 transition rounded-xl">
      <TableCell>{user.username}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.role}</TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => handleDelete(user)}
            size="sm"
            className="bg-red-600 hover:bg-red-700 px-2 py-1"
            aria-label={TEXT?.aria_delete_user || "Delete User"}
          >
            <MdDeleteForever size={18} className="text-white" />
          </Button>
        </div>
      </TableCell>
      <TableCell>{user.time!}</TableCell>
    </TableRow>
  );
}

export default TableRows;
