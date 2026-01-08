"use client";

import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MdDeleteForever } from "react-icons/md";
import Link from "next/link";
import { CiEdit } from "react-icons/ci";

import { AddOnProductSchemaType } from "@/lib/types/productAddOnType";
import { useLanguage } from "@/store/LanguageContext";
import { deleteProduct } from "@/app/(universal)/action/productsaddon/dbOperation";

function TableRows({ product }: { product: AddOnProductSchemaType }) {
  const { TEXT } = useLanguage();

  async function handleDelete(product: AddOnProductSchemaType) {
    const idS = product.id as string;
   

    if (confirm(TEXT.confirm_delete_addon)) {   
      try {
        await deleteProduct(idS,product.image);
        location.reload();
      } catch (err) {
        console.error(TEXT.error_delete_failed, err);
      }
    } else {
      return false;
    }
  }

  return (
    <TableRow key={product.id!} className="whitespace-nowrap bg-slate-50 rounded-lg p-1 my-1">
      <TableCell>{product.name}</TableCell>
      <TableCell>&#8364; {product.price}</TableCell>
      <TableCell>{product.desc}</TableCell>

      <TableCell>
        <p className="flex gap-3">
          <Link
            href={{
              pathname: "/admin/productsaddon/editform",
              query: {
                id: product.id,
                baseProductId: product.baseProductId,
              },
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
