"use client";

import {
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { MdDeleteForever } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { categoryType } from "@/lib/types/categoryType";
import { deleteCategory } from "@/app/(universal)/action/category/dbOperations";
import { fetchProductByCategoryId } from "@/app/(universal)/action/products/dbOperation";
import { useLanguage } from '@/store/LanguageContext';

function TableRows({ category }: { category: categoryType }) {
  const { TEXT } = useLanguage();
console.log("ca--------------",category)
  async function handleDelete(category: categoryType) {
    const products = await fetchProductByCategoryId(category.id!);

    if (products && products.length > 0) {
      alert(
        TEXT.category_delete_with_products_alert.replace(
          "{count}",
          products.length.toString()
        )
      );
      return;
    }

    const confirmDelete = confirm(TEXT.confirm_delete_category);

    if (confirmDelete) {
      const result = await deleteCategory(category.id!, category.image!);
      if (result.errors) {
        alert(result.errors);
      } else {
        location.reload();
      }
    }
  }

  return (
    <TableRow
      key={category.id}
      className="whitespace-nowrap hover:bg-green-50 dark:hover:bg-zinc-800 transition rounded-xl"
    >
      <TableCell>
        <div className="flex justify-center items-center p-2">
          {category?.image && (
            <Image
              className="h-12 w-12 object-cover rounded-md border border-gray-200 dark:border-zinc-700"
              src={category?.image}
              width={48}
              height={48}
              alt={category.name}
            />
          )}
          {/* {category?.image} */}
        </div>
      </TableCell>

      <TableCell className="font-medium text-gray-800 dark:text-white">
        {category.sortOrder}. {category.name}
      </TableCell>

      <TableCell className="text-center">
        {category.isFeatured ? (
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            {TEXT.featured_label}
          </span>
        ) : (
          <span className="text-gray-500 text-sm">—</span>
        )}
      </TableCell>

      <TableCell className="text-sm text-gray-700 dark:text-gray-300">
        {category.desc}
      </TableCell>
            <TableCell>
        {category.taxRate !== undefined && category.taxRate !== null ? (
          <div className="flex flex-col">
             <span
              className={`text-[11px] text-[8px] px-1 py-[1px] rounded  w-fit ${
               category.taxRate
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {category.taxType}
            </span>
            <span className="text-sm font-medium text-gray-800">
              {category.taxRate}%
            </span>
           
          </div>
        ) : (
          <span className="text-sm text-gray-400 italic">—</span>
        )}
      </TableCell>

      <TableCell>
        <div className="flex gap-2">
          <Link
            href={{
              pathname: `/admin/categories/editform`,
              query: { id: category?.id },
            }}
          >
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded-md"
            >
              <CiEdit size={18} />
            </Button>
          </Link>

          <Button
            onClick={() => handleDelete(category)}
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md"
          >
            <MdDeleteForever size={18} />
          </Button>
        </div>
      </TableCell>

      <TableCell>
        <Link
          href={{
            pathname: `/admin/productsbase`,
            query: { id: category?.id },
          }}
        >
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
          >
            {TEXT.view_products_button}
          </Button>
        </Link>
      </TableCell>
    </TableRow>
  );
}

export default TableRows;
