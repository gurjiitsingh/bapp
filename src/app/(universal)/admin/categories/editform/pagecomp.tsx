"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import {
  editCategorySchema,
  TeditCategorySchema,
} from "@/lib/types/categoryType";
import {
  editCategory,
  fetchCategoryById,
} from "@/app/(universal)/action/category/dbOperations";

const PageComp = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const router = useRouter();

  const {
    register,
    formState: { errors, isSubmitting },
    setValue,
    handleSubmit,
  } = useForm<TeditCategorySchema>({
    resolver: zodResolver(editCategorySchema),
  });

  useEffect(() => {
    async function prefetch() {
      const categoryData = await fetchCategoryById(id);
     
      setValue("id", id);
      setValue("name", categoryData.name);
      setValue("desc", categoryData.desc);
      setValue("oldImageUrl", categoryData.image);
      setValue("sortOrder", categoryData.sortOrder!.toString());
      setValue("isFeatured", categoryData.isFeatured!.toString());
       setValue("taxRate", categoryData.taxRate?.toString() ?? "");
      setValue("taxType", categoryData.taxType ?? "inclusive");
    }
    prefetch();
  }, [id, setValue]);

  async function onsubmit(data: TeditCategorySchema) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("oldImageUrl", data.oldImageUrl);
    formData.append("desc", data.desc ?? "");
    formData.append("image", data.image[0]);
    formData.append("isFeatured", data.isFeatured!);
    formData.append("id", data.id!);
    formData.append("sortOrder", data.sortOrder!);
     formData.append("taxRate", String(data.taxRate ?? 0)); //  added tax info
      formData.append("taxType", data.taxType as string);

    const result = await editCategory(formData);
    if (!result?.errors) {
      router.push("/admin/categories");
    } else {
      alert("Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onsubmit)} className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Page Title */}
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 border-b pb-3">
          Edit Category
        </h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Section */}
          <div className="flex-1 flex flex-col gap-5">
            <div className="bg-white border rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">
                Category Info
              </h2>

              <input {...register("id")} hidden />

              {/* Name */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Name<span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                />
                {errors.name && (
                  <p className="text-[0.8rem] text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Sort Order */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Sort Order<span className="text-red-500">*</span>
                </label>
                <input
                  {...register("sortOrder")}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                />
                {errors.sortOrder && (
                  <p className="text-[0.8rem] text-red-500">
                    {errors.sortOrder.message}
                  </p>
                )}
              </div>
            </div>

              {/* General Info + Tax */}
            <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-3">
              <h2 className="font-semibold text-lg text-gray-800">
                Tax Details
              </h2>

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
                    <option value="inclusive">
                      Inclusive (Deducted from total)
                    </option>
                    <option value="exclusive">
                      Exclusive (Added on total)
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex-1 flex flex-col gap-5">
            {/* Image Upload */}
            <div className="bg-white border rounded-2xl shadow-sm p-4 sm:p-6 space-y-3">
              <h2 className="text-lg font-semibold text-gray-700">Picture</h2>
              <input {...register("oldImageUrl")} hidden />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Image<span className="text-red-500">*</span>
                </label>
                <input
                  {...register("image", { required: true })}
                  type="file"
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.image && (
                  <p className="text-[0.8rem] text-red-500">
                    Select category image
                  </p>
                )}
              </div>
            </div>

            {/* General Detail */}
            <div className="bg-white border rounded-2xl shadow-sm p-4 sm:p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">
                General Details
              </h2>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  {...register("desc")}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none text-gray-800"
                />
                {errors.desc && (
                  <p className="text-[0.8rem] text-red-500">
                    Category description is required
                  </p>
                )}
              </div>

              {/* Active */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Active<span className="text-red-500">*</span>
                </label>
                <select
                  {...register("isFeatured")}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                {errors.isFeatured && (
                  <p className="text-[0.8rem] text-red-500">
                    {errors.isFeatured.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn-save w-full ${isSubmitting ? "opacity-80" : ""}`}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PageComp;
