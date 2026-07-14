"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newProductSchema, TnewProductSchema } from "@/lib/types/productType";
import { categoryType } from "@/lib/types/categoryType";
import imageCompression from "browser-image-compression";
import { addNewProduct } from "@/app/(universal)/action/products/dbOperation";
import { getMasterCategories } from "@/app/(universal)/action/master-category/getMasterCategories";
import Link from "next/link";
const masterCategories =
  await getMasterCategories();

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
      currentStock: 0,
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
    formData.append("currentStock", String(data.currentStock ?? -1));
    formData.append("sortOrder", String(data.sortOrder ?? 0));
    formData.append("categoryId", data.categoryId || "");
    formData.append("masterCategoryId", data.masterCategoryId || "");
    formData.append("productDesc", data.productDesc || "");
    formData.append("status", data.publishStatus || "published");
    formData.append("isFeatured", data.isFeatured ? "true" : "false");
    formData.append("taxRate", String(data.taxRate ?? 0)); //  added tax info
    formData.append("taxType", data.taxType as string);
    formData.append("searchCode", data.searchCode || "");
   

         if (data.image?.[0]) {
            const compressedFile =
              await imageCompression(data.image[0], {
               maxWidthOrHeight: 500,
                 maxSizeMB: 0.2,
  initialQuality: 0.8,
  useWebWorker: true,
              });
    
            formData.append("image", compressedFile);
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
        currentStock: 0,
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
  <div>
    {/* Filters */}
    <div className="mb-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white rounded-2xl p-4 shadow-sm">

        {/* Left Side */}
        <div className="flex flex-col sm:flex-row gap-3">


        </div>

        {/* Right Side */}
        <Link href="/admin/stock-finished/products">
          <Button
            className="
          h-10
          rounded-xl
          bg-slate-400
          hover:bg-[#00796b]
          text-white
          shadow-none
        "
          >
            All Products
          </Button>
        </Link>

      </div>
    </div>

   <form
  onSubmit={handleSubmit(onSubmit, (errors) => {
    console.log("FORM ERRORS ❌", errors);
  })}
  className="w-full space-y-6 max-w-7xl   p-1"
>
  {/* Modern Header */}
  <div className="flex flex-col gap-1">
    <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Create Product</h1>
    <p className="text-sm text-slate-500">Set up your product details, pricing, stock levels, and media assets.</p>
  </div>

  <div className="flex flex-col lg:flex-row gap-6">
    {/* LEFT COLUMN */}
    <div className="flex-1 flex flex-col gap-6">
      
      {/* Product Info Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="font-semibold text-base text-slate-900">Product Details</h2>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Product Name<span className="text-rose-500">*</span>
          </label>
          <input
            {...register("name")}
            type="text"
            className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition outline-none"
            placeholder="e.g. Wireless Bluetooth Headphones"
          />
          {errors.name?.message && (
            <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.name?.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Master Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Master Category
            </label>
            <div className="relative">
              <select
                {...register("masterCategoryId")}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition outline-none appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundSize: '0.9em', backgroundRepeat: 'no-repeat' }}
              >
                <option value="">Select Master Category</option>
                {masterCategories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Category</label>
            <div className="relative">
              <select 
                {...register("categoryId")} 
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition outline-none appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundSize: '0.9em', backgroundRepeat: 'no-repeat' }}
              >
                <option value="">Select Category</option>
                {categoryData.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.categoryId?.message && (
              <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.categoryId?.message}</p>
            )}
          </div>

          {/* Search Code / SKU */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Search Code / SKU</label>
            <input
              {...register("searchCode")}
              type="text"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition outline-none"
              placeholder="e.g. ELEC-HEAD-001"
            />
            {errors.searchCode?.message && (
              <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.searchCode?.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Price & Stock Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="font-semibold text-base text-slate-900">Price & Stock</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Regular Price */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Regular Price</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
              <input
                {...register("price")}
                type="text"
                className="w-full h-11 pl-7 pr-3.5 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition outline-none"
                placeholder="0.00"
              />
            </div>
            {errors.price?.message && (
              <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.price?.message}</p>
            )}
          </div>

          {/* Discount Price */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Discount Price</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">$</span>
              <input
                {...register("discountPrice")}
                type="text"
                onFocus={(e) => {
                  if (e.target.value === "0") e.target.value = "";
                }}
                className="w-full h-11 pl-7 pr-3.5 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition outline-none"
                placeholder="0.00"
              />
            </div>
            {errors.discountPrice?.message && (
              <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.discountPrice?.message}</p>
            )}
          </div>

          {/* Stock Quantity */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Stock Quantity</label>
            <input
              {...register("currentStock")}
              type="text"
              onFocus={(e) => {
                if (e.target.value === "0") e.target.value = "";
              }}
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition outline-none"
              placeholder="e.g. 50"
            />
            {errors.currentStock?.message && (
              <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.currentStock?.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* RIGHT COLUMN */}
    <div className="flex-1 flex flex-col gap-6">
      
      {/* Image Upload Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="font-semibold text-base text-slate-900">Product Image</h2>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full min-h-32 border-2 border-dashed border-slate-200 hover:border-slate-300 bg-slate-50/40 rounded-xl cursor-pointer transition p-4 group">
              <div className="flex flex-col items-center justify-center text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor" className="w-7 h-7 text-slate-400 group-hover:text-slate-500 mb-2 transition">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                </svg>
                <p className="text-xs font-semibold text-slate-700">Click to upload product asset</p>
                <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG up to 5MB</p>
              </div>
              <input
                {...register("image")}
                type="file"
                className="hidden"
              />
            </label>
          </div>
          {errors.image && (
            <p className="text-xs font-medium text-rose-500 mt-0.5">Please select a product image</p>
          )}
        </div>
      </div>

      {/* General Info + Tax Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-5">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="font-semibold text-base text-slate-900">General & Tax Details</h2>
        </div>

        {/* Product Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Product Description</label>
          <textarea
            {...register("productDesc")}
            rows={3}
            className="w-full p-3.5 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition outline-none resize-none"
            placeholder="Describe the main parameters, unique qualities..."
          />
          {errors.productDesc?.message && (
            <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.productDesc?.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sort Order */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Sort Order</label>
            <input
              {...register("sortOrder")}
              type="text"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition outline-none"
              placeholder="0"
            />
            {errors.sortOrder?.message && (
              <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.sortOrder?.message}</p>
            )}
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Status</label>
            <div className="relative">
              <select
                {...register("publishStatus")}
                defaultValue="published"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition outline-none appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundSize: '0.9em', backgroundRepeat: 'no-repeat' }}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            {errors.publishStatus?.message && (
              <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.publishStatus?.message}</p>
            )}
          </div>
        </div>

        {/* Tax Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tax Rate */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Tax Rate (%)</label>
            <input
              {...register("taxRate")}
              type="text"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-900 placeholder-slate-400 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition outline-none"
              placeholder="e.g. 18"
            />
            {errors.taxRate?.message && (
              <p className="text-xs font-medium text-rose-500 mt-0.5">{errors.taxRate?.message}</p>
            )}
          </div>

          {/* Tax Type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Tax Type</label>
            <div className="relative">
              <select 
                {...register("taxType")} 
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition outline-none appearance-none"
                style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundSize: '0.9em', backgroundRepeat: 'no-repeat' }}
              >
                <option value="exclusive">Exclusive (Added on total)</option>
                <option value="inclusive">Inclusive (Deducted from total)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Featured Product Checkbox Mod */}
        <div className="flex items-center gap-3 p-3.5 bg-slate-50/60 rounded-xl border border-slate-100 hover:bg-slate-50 transition cursor-pointer select-none">
          <input 
            {...register("isFeatured")} 
            type="checkbox" 
            id="isFeatured"
            className="h-4.5 w-4.5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500/20 accent-indigo-600 cursor-pointer"
          />
          <label htmlFor="isFeatured" className="text-xs font-semibold text-slate-700 uppercase tracking-wider cursor-pointer">
            Featured Product
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className={`w-full h-11 font-semibold text-sm rounded-xl tracking-wide shadow-xs bg-slate-900 hover:bg-slate-800 text-white transition duration-150 flex items-center justify-center ${
            isSubmitting ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  </div>
</form>
  </div>
  );
};

export default Page;
