"use client";

import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MdDeleteForever } from "react-icons/md";
import Image from "next/image";
import Link from "next/link";
import { CiEdit } from "react-icons/ci";

import { ProductType } from "@/lib/types/productType";
import { useLanguage } from '@/store/LanguageContext';

function TableRows({ product }: { product: ProductType }) {
  const { TEXT } = useLanguage();

  async function handleDelete(product: ProductType) {
    const confirmMessage =
      TEXT?.confirm_delete_product ||
      "Do you want to delete this product?\nIf yes, click OK.\nIf not, click Cancel.";
 console.log("tis------------","asdsa")
    if (confirm(confirmMessage)) {
      // await deleteProduct(product.id!);
      // location.reload();
    } else {
      return false;
    }
  }

  const price = product.price.toString().replace(/\./g, ",");
  let discountedPrice = '';
  if (product.discountPrice !== undefined) {
    discountedPrice = product.discountPrice!.toString().replace(/\./g, ",");
  }

  return (
    <TableRow key={product.id} className="whitespace-nowrap bg-slate-50 rounded-lg p-1 my-1">
      <TableCell>
        <div className="px-3 py-1 text-center min-w-[100px]">
          {product?.image && (
            <Image
              className="h-12 w-12 object-cover rounded-md border p-1"
              src={product.image}
              width={100}
              height={100}
              alt={product.name}
            />
          )}
        </div>
      </TableCell>

      <TableCell>{product.sortOrder}.&nbsp;{product.name}</TableCell>
      <TableCell>{price}</TableCell>
      <TableCell>{discountedPrice}</TableCell>
      <TableCell>{product.productDesc}</TableCell>

      <TableCell>
        {product?.isFeatured === true && (
          <span className="ml-2 bg-gradient-to-tr from-blue-500 to-indigo-400 text-white text-[10px] rounded-full px-3 py-1">
            {TEXT?.status_featured || "Featured"}
          </span>
        )}
      </TableCell>

      <TableCell>
        <p className="flex gap-3">
          <Link
            href={{
              pathname: "/admin/productsaddon",
              query: { id: product.id },
            }}
          >
            <Button size="sm" className="bg-red-600 text-white px-1 py-0">
              {TEXT?.button_variants || "Variants"}
            </Button>
          </Link>

          <Link
            href={{
              pathname: `/admin/productsbase/editform`,
              query: { id: product.id },
            }}
          >
            <Button size="sm" className="bg-red-500 px-1 py-0">
              <CiEdit size={20} className="text-white" />
            </Button>
          </Link>

          <Button
            onClick={() => handleDelete(product)}
            size="sm"
            className="bg-red-600 px-1 py-0"
          >
            <MdDeleteForever size={20} className="text-white" />
          </Button>
        </p>
      </TableCell>
    </TableRow>
  );
}

export default TableRows;
