"use client";

import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MdDeleteForever } from "react-icons/md";
import Link from "next/link";
import { CiEdit } from "react-icons/ci";
import { deleteProduct } from "@/app/(universal)/action/flavorsProductG/dbOperation";
import { flavorsProductGType } from "@/lib/types/flavorsProductGType";
import { useLanguage } from "@/store/LanguageContext";

function TableRows({ product }: { product: flavorsProductGType }) {
  const { TEXT } = useLanguage();

  async function handleDelete(product: flavorsProductGType) {
    const confirmDelete = confirm(TEXT.confirm_delete_flavor);
    if (confirmDelete) {
      await deleteProduct(product.id!);
      location.reload();
    }
  }

  return (
    <TableRow key={product.id} className="whitespace-nowrap bg-slate-50 rounded-lg p-1 my-1">
      <TableCell>{product.name}</TableCell>
      <TableCell>&#8364; {product.price}</TableCell>
      <TableCell>{product.productDesc}</TableCell>

      <TableCell>
        <p className="flex gap-3">
          <Link
            href={{
              pathname: "/admin/flavorsProductG/editform",
              query: { id: product.id },
            }}
          >
            <Button size="sm" className="bg-red-500 px-1 py-0">
              <CiEdit size={20} className="text-white" />
            </Button>
          </Link>

          <Button onClick={() => handleDelete(product)} size="sm" className="bg-red-600 px-1 py-0">
            <MdDeleteForever size={20} className="text-white" />
          </Button>
        </p>
      </TableCell>
    </TableRow>
  );
}

export default TableRows;
