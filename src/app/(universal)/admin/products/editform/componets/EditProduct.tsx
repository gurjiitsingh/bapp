"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editProductSchema, TeditProductSchema } from "@/lib/types/productType";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchCategories } from "@/app/(universal)/action/category/dbOperations";
import { categoryType } from "@/lib/types/categoryType";
import {
  editProduct,
  fetchProductById,
} from "@/app/(universal)/action/products/dbOperation";

const EditProduct = () => {
  const [categoryData, setCategoryData] = useState<categoryType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const router = useRouter();

  const {
    register,
    formState: { errors },
    setValue,
    handleSubmit,
  } = useForm<TeditProductSchema>({
    resolver: zodResolver(editProductSchema),
  });

  useEffect(() => {
    async function loadProduct() {
      const data = await fetchProductById(id);
      if (!data) return;

      setValue("id", id);
      setValue("name", data.name);
      setValue("productDesc", data.productDesc);
      setValue("oldImageUrl", data.image);
      setValue("price", data.price?.toString() ?? "0");
      setValue("discountPrice", data.discountPrice?.toString() ?? "0");
      setValue("stockQty", data.stockQty?.toString() ?? "0");
      setValue("publishStatus",data.publishStatus ?? "published");
      setValue("sortOrder", data.sortOrder?.toString() ?? "0");
      setValue("categoryId", data.categoryId);
      setValue("isFeatured", data.isFeatured);
      setValue("taxRate", data.taxRate?.toString() ?? "");
      setValue("taxType", data.taxType ?? "inclusive");
       setValue("searchCode", data.searchCode ?? "0");
    }

    async function loadCategories() {
      const categories = await fetchCategories();
      setCategoryData(categories);
    }

    loadProduct();
    loadCategories();
  }, [id, setValue]);

  async function onsubmit(data: TeditProductSchema) {
    setIsSubmitting(true);
    const formData = new FormData();

    formData.append("id", data.id!);
    formData.append("name", data.name);
    formData.append("price", data.price);
    formData.append("discountPrice", data.discountPrice ?? "0.00");
    formData.append("stockQty", data.stockQty ?? "-1");
    formData.append("categoryId", data.categoryId!);
    formData.append("sortOrder", data.sortOrder);
    formData.append("productDesc", data.productDesc ?? "");
    formData.append("status",data.publishStatus ?? "published");
    formData.append("oldImageUrl", data.oldImageUrl ?? "");
    formData.append("isFeatured", data.isFeatured ? "true" : "false");
 formData.append("searchCode", data.searchCode ?? "");
    
    // Tax fields
    formData.append("taxRate", data.taxRate ?? "");
    formData.append("taxType", data.taxType ?? "inclusive");

    if (data.image && data.image[0]) {
      formData.append("image", data.image[0]);
    }

    const result = await editProduct(formData);
    setIsSubmitting(false);

    if (!result?.errors) {
      //   alert(" Product updated successfully!");
      router.push(`/admin/products?productId=${data.id}`);
    } else {
      alert("❌ Something went wrong. Check console for details.");
      console.error(result.errors);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onsubmit)}
      className="w-full max-w-7xl mx-auto p-5"
    >
      <h1 className="text-2xl font-semibold mb-4">Edit Product</h1>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Product Details */}
          <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-lg text-gray-800">
              Product Details
            </h2>

            <input {...register("id")} hidden />

            <div className="flex flex-col gap-1">
              <label className="label-style">
                Product Name<span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                className="input-style py-1"
                placeholder="Enter product name"
              />
              <p className="text-xs text-destructive">{errors.name?.message}</p>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              



                <div className="flex flex-col gap-1">
                  <label className="label-style">Category</label>
                  <select {...register("categoryId")} className="input-style py-1">
                    <option value="">Select Category</option>
                    {categoryData.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-destructive">
                    {errors.categoryId?.message}
                  </p>
                </div>


             

              <div className="flex flex-col gap-1">
                <label className="label-style">Search Code / SKU</label>
                <input
                  {...register("searchCode")}
                  className="input-style py-1"
                  placeholder="Enter SKU, barcode, or short code"
                />
                <p className="text-xs text-destructive">{errors.searchCode?.message}</p>
              </div>
            </div>

            {/* <div className="flex flex-col gap-1">
              <label className="label-style">Category</label>
              <select {...register("categoryId")} className="input-style py-1">
                <option value="0">Do not change Category</option>
                {categoryData.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-destructive">
                {errors.categoryId?.message}
              </p>
            </div> */}
          </div>

          {/* Price Section */}
          <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-lg text-gray-800">
              Price & Stock
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label-style">Regular Price</label>
                <input
                  {...register("price")}
                  className="input-style py-1"
                  placeholder="Enter price"
                />
                <p className="text-xs text-destructive">
                  {errors.price?.message}
                </p>
              </div>
              <div>
                <label className="label-style">Discount Price</label>
                <input
                  {...register("discountPrice")}
                  className="input-style py-1"
                  placeholder="Enter discount price"
                  onFocus={(e) => {
                    if (e.target.value === "0") e.target.value = "";
                  }}
                />
                <p className="text-xs text-destructive">
                  {errors.discountPrice?.message}
                </p>
              </div>
            </div>

            <div>
              <label className="label-style">Stock Quantity</label>
              <input
                {...register("stockQty")}
                className="input-style py-1"
                placeholder="Enter stock quantity"
                onFocus={(e) => {
                  if (e.target.value === "0") e.target.value = "";
                }}
              />
              <p className="text-xs text-destructive">
                {errors.stockQty?.message}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Image Upload */}
          <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-lg text-gray-800">
              Product Image
            </h2>
            <input {...register("oldImageUrl")} hidden />
            <input
              {...register("image")}
              type="file"
              className="input-style py-1"
            />
            <p className="text-xs text-destructive">
              {errors.image && "Select product image"}
            </p>
          </div>

          {/* General Info + Tax */}
          <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-lg text-gray-800">
              General & Tax Details
            </h2>

            <div>
              <label className="label-style">Product Description</label>
              <textarea
                {...register("productDesc")}
                className="textarea-style py-1"
                placeholder="Enter description"
              />
              <p className="text-xs text-destructive">
                {errors.productDesc?.message}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label-style">Sort Order</label>
                <input
                  {...register("sortOrder")}
                  className="input-style py-1"
                />
                <p className="text-xs text-destructive">
                  {errors.sortOrder?.message}
                </p>
              </div>

              <div>
                <label className="label-style">Status</label>
                <select {...register("publishStatus")} className="input-style py-1">
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
                <p className="text-xs text-destructive">
                  {errors.publishStatus?.message}
                </p>
              </div>
            </div>

            {/* TAX SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label-style">GST Rate (%)</label>
                <input
                  {...register("taxRate")}
                  className="input-style py-1"
                  placeholder="e.g. 5, 12, 18"
                   onFocus={(e) => {
    if (e.target.value) e.target.value = "";
  }}
                />
                <p className="text-xs text-destructive">
                  {errors.taxRate?.message}
                </p>
              </div>

              <div>
                <label className="label-style">GST Type</label>
                <select {...register("taxType")} className="input-style py-1">
                  <option value="inclusive">
                    Inclusive (Deducted from total)
                  </option>
                  <option value="exclusive">Exclusive (Added on total)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input {...register("isFeatured")} type="checkbox" />
              <label className="label-style">Featured Product</label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className={`btn-save w-full mt-2 ${
                isSubmitting ? "opacity-80" : ""
              }`}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EditProduct;
