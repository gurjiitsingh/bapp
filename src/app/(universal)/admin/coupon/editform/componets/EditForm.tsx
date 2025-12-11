"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import {
  couponSchema,
  TcouponSchema,
} from "@/lib/types/couponType";
import {
  editcoupon,
  fetchcouponById,
} from "@/app/(universal)/action/coupon/dbOperation";

const EditForm = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const router = useRouter();

  const {
    register,
    formState: { errors, isSubmitting },
    setValue,
    handleSubmit,
  } = useForm<TcouponSchema>({
    resolver: zodResolver(couponSchema),
  });

  useEffect(() => {
    async function prefetch() {
      const couponData = await fetchcouponById(id);
      setValue("id", id);
      setValue("code", couponData.code);
      setValue("couponDesc", couponData.couponDesc);
      setValue("discount", couponData.discount.toString());
      setValue("minSpend", couponData.minSpend!.toString());
      setValue("isFeatured", couponData.isFeatured);
      setValue("discountType", couponData.discountType || "percentage");
      setValue("expiry", couponData.expiry?.split("T")[0]);
      setValue("message", couponData.message || "");
    }
    prefetch();
  }, [id, setValue]);

  async function onsubmit(data: TcouponSchema) {
    const formData = new FormData();
    formData.append("code", data.code);
    formData.append("discount", data.discount);
    formData.append("productCat", data.productCat || "all");
    formData.append("couponDesc", data.couponDesc || "");
    formData.append("minSpend", data.minSpend || "");
    formData.append("isFeatured", data.isFeatured ? "true" : "false");
    formData.append("discountType", data.discountType || "percentage");
    formData.append("expiry", data.expiry!);
    formData.append("message", data.message || "");
    formData.append("id", data.id || "");

    const result = await editcoupon(id, formData);
    if (!result?.error) {
      router.push("/admin/coupon");
    } else {
      alert("Something went wrong");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onsubmit)}
      className="p-5 flex flex-col gap-6 bg-gray-50 rounded-xl"
    >
      <h1 className="text-xl font-semibold text-gray-800 border-b pb-2">
        Edit Coupon
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Section */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-gray-700">Coupon Details</h2>

            <input {...register("id")} hidden />
            <input {...register("productCat", { value: "all" })} hidden />

            {/* Coupon Name */}
            <div className="flex flex-col gap-1">
              <label className="label-style">
                Coupon Name<span className="text-red-500">*</span>
              </label>
              <input
                {...register("code")}
                className="input-style py-1"
                placeholder="Enter coupon name"
              />
              <span className="text-[0.8rem] text-destructive">
                {errors.code?.message}
              </span>
            </div>

            {/* Discount Type */}
            <div className="flex flex-col gap-1">
              <label className="label-style">Discount Type</label>
              <div className="flex items-center gap-6 mt-1">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="flat"
                    {...register("discountType")}
                  />
                  Flat
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    value="percentage"
                    {...register("discountType")}
                  />
                  Percentage
                </label>
              </div>
              <span className="text-[0.8rem] text-destructive">
                {errors.discountType?.message}
              </span>
            </div>

            {/* Discount Value */}
            <div className="flex flex-col gap-1">
              <label className="label-style">
                Discount Value<span className="text-red-500">*</span>
              </label>
              <input
                {...register("discount")}
                className="input-style py-1"
                placeholder="Enter discount value"
              />
              <span className="text-[0.8rem] text-destructive">
                {errors.discount?.message}
              </span>
            </div>
          </div>

          {/* Discount Info */}
          <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-gray-700">Discount Details</h2>

            <div className="flex flex-col gap-1">
              <label className="label-style">
                Minimum Spend<span className="text-red-500">*</span>
              </label>
              <input
                {...register("minSpend")}
                className="input-style py-1"
                placeholder="Minimum spend amount"
              />
              <span className="text-[0.8rem] text-destructive">
                {errors.minSpend?.message}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="label-style">Expiry Date</label>
              <input
                type="date"
                {...register("expiry")}
                className="input-style py-1"
              />
              <span className="text-[0.8rem] text-destructive">
                {errors.expiry?.message}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-gray-700">General Details</h2>

            <div className="flex flex-col gap-1">
              <label className="label-style">Coupon Description</label>
              <textarea
                {...register("couponDesc")}
                className="textarea-style py-1"
                placeholder="Write a short description..."
              />
              <span className="text-[0.8rem] text-destructive">
                {errors.couponDesc?.message}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="label-style">Message</label>
              <textarea
                {...register("message")}
                className="textarea-style py-1"
                placeholder="Message shown to customers..."
              />
              <span className="text-[0.8rem] text-destructive">
                {errors.message?.message}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" {...register("isFeatured")} />
              <label className="label-style">Featured Coupon</label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className={`btn-save ${
                isSubmitting
                  ? "opacity-80 cursor-not-allowed"
                  : "bg-[#ff7519] hover:bg-[#d45a00]"
              } text-white font-semibold py-2 px-6 rounded-xl mt-2`}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EditForm;
