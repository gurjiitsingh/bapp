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

function TableRows({
  category,
  index,
}: {
  category: categoryType;
  index: number;
}) {


  const { TEXT } = useLanguage();

    const imageSrc =
  category?.image &&
  category.image !== "null" &&
  category.image.trim() !== ""
    ? category.image
    : "/com-1.jpg";

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
  className={`
    whitespace-nowrap
    transition-colors
    border-0
    hover:bg-green-50
    ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
  `}
>
      <TableCell>
        <div className="flex justify-start items-center p-2">
          {category?.image && (
          <Image
  className="h-12 w-12 object-cover rounded-md shadow-sm"
              src={imageSrc}
              width={48}
              height={48}
              alt={category.name}
            />
          )}
          {/* {category?.image} */}
        </div>
      </TableCell>
      

   <TableCell className="whitespace-normal break-words max-w-[220px]">
  <div className="flex items-center gap-2">
    <span className="font-medium text-gray-800">
      {category.sortOrder}. {category.name}
    </span>

 
  </div>
</TableCell>
  <TableCell>
        <div className="flex justify-start items-center p-2">
        
          {category?.masterCategoryName}
        </div>
      </TableCell>

     <TableCell>
  {category.isFeatured ? (
    <span className="text-green-600 font-medium">Yes</span>
  ) : (
    <span className="text-gray-400">—</span>
  )}
</TableCell>

    <TableCell className="whitespace-normal break-words max-w-[250px] text-sm text-gray-700">
        {category.desc}
      </TableCell>
       <TableCell>
  {category.taxRate !== undefined &&
  category.taxRate !== null ? (
    <div className="flex flex-col">
      <span
        className={`text-[10px] px-2 py-[2px] rounded w-fit ${
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
        <Link
          href={{
            pathname: `/admin/productsbase`,
            query: { id: category?.id },
          }}
        >
          <Button
            size="sm"
            className="
    h-8
    rounded-lg
    border
    border-indigo-200
    bg-indigo-50
    hover:bg-indigo-100
    text-indigo-700
    shadow-none
  "
          >
            {TEXT.view_products_button}
          </Button>
        </Link>
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
              
  className="
    h-8
    w-8
    p-0
    rounded-lg
    bg-blue-50
    hover:bg-blue-100
    text-blue-600
    shadow-none
  "
            >
              <CiEdit size={18} />
            </Button>
          </Link>

          <Button
            onClick={() => handleDelete(category)}
            size="sm"
             className="
    h-8
    w-8
    p-0
    rounded-lg
    bg-red-50
    hover:bg-red-100
    text-red-600
    shadow-none
  "
          >
            <MdDeleteForever size={18} />
          </Button>
        </div>
      </TableCell>

  
    </TableRow>
  );
}

export default TableRows;
