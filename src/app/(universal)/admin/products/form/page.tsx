"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newProductSchema, TnewProductSchema } from "@/lib/types/productType";
import { categoryType } from "@/lib/types/categoryType";
import { resizeImage } from "@/utils/resizeImage";
import { addNewProduct } from "@/app/(universal)/action/products/dbOperation";

const Page = () => {
  const [categoryData, setCategoryData] = useState<categoryType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/categories", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          cache: "no-store", // optional: prevents caching in Next.js
        });

        if (!res.ok) throw new Error("Failed to fetch categories");

        const categories: categoryType[] = await res.json();

        // Sort categories by sortOrder
        const sorted = [...categories].sort(
          (a, b) => Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0)
        );

        setCategoryData(sorted);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchData();
  }, []);

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
    reset,
  } = useForm<TnewProductSchema>({
    resolver: zodResolver(newProductSchema),
    defaultValues: {
      publishStatus: "published",
      discountPrice: 0,
      stockQty: 0,
      //  sortOrder: 0,
      //  taxRate: 0, //  default tax 0%
    },
  });
  const selectedCategoryId = watch("categoryId");

  // Auto-set taxRate when category changes
  useEffect(() => {
    if (!selectedCategoryId) return;

    const selectedCat = categoryData.find(
      (cat) => cat.id === selectedCategoryId
    );

    if (selectedCat) {
      setValue(
        "taxRate",
        selectedCat.taxRate ? Number(selectedCat.taxRate) : 0
      );
      setValue("taxType", selectedCat.taxType ?? undefined);
    }
  }, [selectedCategoryId, categoryData, setValue]);
  async function onSubmit(data: TnewProductSchema) {
    setIsSubmitting(true);
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("price", String(data.price ?? 0));
    formData.append("hasVariants", "false");
    formData.append("type", "parent");
    formData.append("discountPrice", String(data.discountPrice ?? 0));
    formData.append("stockQty", String(data.stockQty ?? -1));
    formData.append("sortOrder", String(data.sortOrder ?? 0));
    formData.append("categoryId", data.categoryId || "");
    formData.append("productDesc", data.productDesc || "");
    formData.append("status",data.publishStatus || "published");
    formData.append("isFeatured", data.isFeatured ? "true" : "false");
    formData.append("taxRate", String(data.taxRate ?? 0)); //  added tax info
    formData.append("taxType", data.taxType as string);
    if (data.image && data.image[0]) {
      try {
        const resizedImage = await resizeImage(data.image[0], 400);
        formData.append("image", resizedImage);
      } catch (error) {
        console.error("Image resize failed:", error);
        alert("Image resize failed. Please try again.");
        setIsSubmitting(false);
        return;
      }
    } else {
      formData.append("image", "0");
    }

    const result = await addNewProduct(formData);
    setIsSubmitting(false);

    if (!result?.errors) {
      //  alert(" Product added successfully!");
      reset({
        name: "",
        //  price: 0,
        // discountPrice: 0,
        stockQty: 0,
        sortOrder: Number(data.sortOrder) + 1 || 1,
        //  categoryId: "",
        productDesc: "",
        isFeatured: false,
        publishStatus: "published",
        //  taxRate: 0, //  reset tax field
      });
    } else {
      console.error("❌ Validation errors:", result.errors);
      alert("Something went wrong. Check console for details.");
    }
  }

  return (
    <form
       onSubmit={handleSubmit(onSubmit, (errors) => {
    console.log("FORM ERRORS ❌", errors);
  })}
      className="w-full max-w-7xl mx-auto p-5"
    >
      <h1 className="text-2xl font-semibold mb-4">Create Product</h1>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* LEFT COLUMN */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Product Info */}
          <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-lg text-gray-800">
              Product Details
            </h2>

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
          </div>

          {/* Price Info */}
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
                  onFocus={(e) => {
                    if (e.target.value === "0") e.target.value = "";
                  }}
                  className="input-style py-1"
                  placeholder="Enter discount price"
                />
                <p className="text-xs text-destructive">
                  {errors.discountPrice?.message}
                </p>
              </div>
            </div>

            {/*  Added Tax Field */}
            {/* <div>
              <label className="label-style">Tax Rate (%)</label>
              <input
                {...register("taxRate")}
                className="input-style py-1"
                placeholder="e.g. 5 for 5%"
                type="number"
                step="0.01"
                min="0"
              />
              <p className="text-xs text-destructive">{errors.taxRate?.message}</p>
            </div> */}

            <div>
              <label className="label-style">Stock Quantity</label>
              <input
                {...register("stockQty")}
                onFocus={(e) => {
                  if (e.target.value === "0") e.target.value = "";
                }}
                className="input-style py-1"
                placeholder="Enter stock quantity"
              />
              <p className="text-xs text-destructive">
                {errors.stockQty?.message}
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        {/* <div className="flex-1 flex flex-col gap-5">
        
          <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-lg text-gray-800">Product Image</h2>
            <label className="label-style">Featured Image</label>
            <input {...register("image")} type="file" className="input-style py-1" />
            <p className="text-xs text-destructive">{errors.image && "Please select a product image"}</p>
          </div>

        
          <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-lg text-gray-800">General Information</h2>

            <div>
              <label className="label-style">Description</label>
              <textarea {...register("productDesc")} className="textarea-style py-1" placeholder="Enter description" />
            </div>

            <div>
              <label className="label-style">Sort Order</label>
              <input {...register("sortOrder")} className="input-style py-1" />
              <p className="text-xs text-destructive">{errors.sortOrder?.message}</p>
            </div>

            <div>
              <label className="label-style">Status</label>
              <select {...register("status")} className="input-style py-1">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input {...register("isFeatured")} type="checkbox" />
              <label className="label-style">Featured Product</label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className={`btn-save w-full mt-2 ${isSubmitting ? "opacity-80" : ""}`}
            >
              {isSubmitting ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </div> */}

        {/* RIGHT COLUMN */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Image Upload */}
          <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-lg text-gray-800">
              Product Image
            </h2>
            {/* <label className="label-style">Featured Image</label> */}
            <input
              {...register("image")}
              type="file"
              className="input-style py-1"
            />
            <p className="text-xs text-destructive">
              {errors.image && "Please select a product image"}
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
              <select
  {...register("publishStatus")}
  defaultValue="published"
  className="input-style py-1"
>
  <option value="published">Published</option>
  <option value="draft">Draft</option>
</select>
                <p className="text-xs text-destructive">
                  {errors.publishStatus?.message}
                </p>
              </div>
            </div>

            {/* TAX SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="label-style">Tax Rate (%)</label>
                <input
                  {...register("taxRate")}
                  className="input-style py-1"
                  placeholder="e.g. 5, 12, 18"
                />
                <p className="text-xs text-destructive">
                  {errors.taxRate?.message}
                </p>
              </div>

              <div>
                <label className="label-style">Tax Type</label>
                <select {...register("taxType")} className="input-style py-1">
                 
                  <option value="exclusive">Exclusive (Added on total)</option>
                   <option value="inclusive">
                    Inclusive (Deducted from total)
                  </option>
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

export default Page;
