"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { MdDeleteForever } from "react-icons/md";
import { CiEdit } from "react-icons/ci";
import { FaStar, FaRegStar } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import {
  deleteProduct,
  toggleFeatured,
} from "@/app/(universal)/action/products/dbOperation";
import { ProductType } from "@/lib/types/productType";
import { formatCurrencyNumber } from "@/utils/formatCurrency";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { useLanguage } from "@/store/LanguageContext";
import { useState } from "react";

function TableRows({ product }: { product: ProductType }) {
  const { settings } = UseSiteContext();
  const { TEXT } = useLanguage();
  const [isFeatured, setIsFeatured] = useState(product.isFeatured);

  

  const price = formatCurrencyNumber(
    Number(product.price) ?? 0,
    settings.currency as string,
    settings.locale as string
  );

  const discountedPrice =
    product.discountPrice !== undefined
      ? formatCurrencyNumber(
          Number(product.discountPrice) ?? 0,
          settings.currency as string,
          settings.locale as string
        )
      : "";

  const statusLabel = product.publishStatus ?? "draft";
  const statusStyles = {
    published: "bg-green-100 text-green-800",
    draft: "bg-yellow-100 text-yellow-800",
    out_of_stock: "bg-red-100 text-red-800",
  };

  async function handleDelete(product: ProductType) {
    const confirmDelete = confirm(
      TEXT.confirm_delete_product || "Do you want to delete the product?"
    );
    if (!confirmDelete) return;

    try {
      const result = await deleteProduct(product.id!, product.image);
      if (result?.errors) {
        alert(TEXT.error_delete_failed + result.errors);
      } else {
        location.reload();
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert(TEXT.error_unexpected_delete || "Unexpected error while deleting.");
    }
  }

  async function handleFeatureToggle() {
    try {
      const newStatus = !isFeatured;
      setIsFeatured(newStatus);
      const result = await toggleFeatured(product.id!, newStatus);

      if (!result.success) {
        alert("Failed to update featured status");
        setIsFeatured(!newStatus); // revert if failed
      }
    } catch (err) {
      console.error(err);
      alert("Error updating featured status");
    }
  }

  return (
    <TableRow
      key={product.id}
      className="whitespace-nowrap hover:bg-green-50 dark:hover:bg-zinc-100 transition rounded-xl"
    >
      <TableCell className="text-sm font-medium text-gray-700">
  {product.searchCode ? (
    <span>{product.searchCode}</span>
  ) : (
    <span className="text-gray-400 italic">—</span>
  )}
</TableCell>
      {/* 🖼 Product Image */}
      <TableCell>
        <div className="px-3 py-1 text-center min-w-[100px]">
          {product.image && (
            <Image
              className="h-12 w-12 object-cover rounded-md shadow-sm"
              src={product.image}
              width={100}
              height={100}
              alt={product.name}
            />
          )}
        </div>
      </TableCell>

      {/* 🏷 Name + Featured */}
      <TableCell className="whitespace-normal break-words max-w-[180px]">
        <div className="flex items-center gap-2">
          {product.sortOrder}.&nbsp;{product.name}
          <button
            onClick={handleFeatureToggle}
            className="flex items-center justify-center rounded-md hover:bg-yellow-100 p-1 transition"
            title={isFeatured ? "Unmark as featured" : "Mark as featured"}
          >
            {isFeatured ? (
              <FaStar size={18} className="text-yellow-600" />
            ) : (
              <FaRegStar size={18} className="text-gray-400" />
            )}
          </button>
        </div>
      </TableCell>

      {/* 📂 Category */}
      <TableCell>{product.productCat}</TableCell>

      {/* 💰 Prices */}
      <TableCell>{price}</TableCell>
      <TableCell>{discountedPrice}</TableCell>

      {/* 📦 Quantity */}
      <TableCell>{product.stockQty}</TableCell>

      {/* 💸 Tax */}
      <TableCell>
        {product.taxRate !== undefined && product.taxRate !== null ? (
          <div className="flex flex-col">
             <span
              className={`text-[11px] text-[8px] px-1 py-[1px] rounded  w-fit ${
               product.taxRate
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {product.taxType}
            </span>
            <span className="text-sm font-medium text-gray-800">
              {product.taxRate}%
            </span>
           
          </div>
        ) : (
          <span className="text-sm text-gray-400 italic">—</span>
        )}
      </TableCell>

      {/* 📋 Status */}
      <TableCell>
        <span
          className={`text-xs px-2 py-1 rounded-full capitalize font-semibold ${
            statusStyles[statusLabel as keyof typeof statusStyles] ||
            "bg-gray-100 text-gray-700"
          }`}
        >
          {statusLabel.replace(/_/g, " ")}
        </span>
      </TableCell>

      {/* 📝 Description */}
      <TableCell className="whitespace-normal break-words max-w-[200px]">
        {product.productDesc}
      </TableCell>

      {/* ⚙️ Actions */}
      <TableCell>
        <div className="flex gap-2">
          {/* ✏️ Edit */}
          <Link
            href={{
              pathname: "/admin/products/editform",
              query: { id: product.id },
            }}
          >
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0 transition"
            >
              <CiEdit size={18} />
            </Button>
          </Link>

          {/* 🧩 Variants */}
          <Link
            href={{
              pathname: "/admin/product-variant",
                query: { nameBase:product.name,categoryBase:product.productCat,id: product.id,categoryId:product.categoryId,productCat:product.productCat },
          
            }}
          >
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-0 transition"
            >
              {TEXT.button_variants || "Variants"}
            </Button>
          </Link>

          {/* 🗑 Delete */}
          <Button
            onClick={() => handleDelete(product)}
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-0 transition"
          >
            <MdDeleteForever size={18} />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export default TableRows;
