"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { editPorductSchema, TeditdeliverySchema } from "@/lib/types/deliveryType";
import { editdelivery, fetchdeliveryById } from "@/app/(universal)/action/delivery/dbOperation";
import { useRouter, useSearchParams } from "next/navigation";

const PageComp = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const router = useRouter();

  const {
    register,
    formState: { errors, isSubmitting },
    setValue,
    handleSubmit,
  } = useForm<TeditdeliverySchema>({
    resolver: zodResolver(editPorductSchema),
  });

  useEffect(() => {
    async function prefetch() {
      const deliveryData = await fetchdeliveryById(id);
      if (!deliveryData) return;
      setValue("id", id);
      setValue("name", deliveryData.name);
      setValue("deliveryDesc", deliveryData.deliveryDesc);
      setValue("minSpend", deliveryData.minSpend.toString());
      setValue("price", deliveryData.price);
      setValue("productCat", deliveryData.productCat);
      setValue("deliveryDistance", deliveryData.deliveryDistance);
    }
    prefetch();
  }, [id, setValue]);

  async function onsubmit(data: TeditdeliverySchema) {
    const formData = new FormData();
    formData.append("id", data.id!);
    formData.append("name", data.name);
    formData.append("price", data.price);
    formData.append("productCat", data.productCat);
    formData.append("deliveryDesc", data.deliveryDesc);
    formData.append("minSpend", data.minSpend!);
    formData.append("deliveryDistance", data.deliveryDistance!);

    const result = await editdelivery(formData);
    if (!result?.errors) {
      router.push("/admin/delivery");
    } else {
      alert("Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onsubmit)}>
      <div className="flex flex-col gap-4 p-5">
        <h1 className="text-xl font-semibold mb-2">Edit Delivery</h1>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Left side */}
          <div className="flex-1 flex flex-col gap-y-5">
            {/* Delivery Info */}
            <div className="flex flex-col gap-3 bg-white rounded-xl p-4 border">
              <h2 className="font-semibold text-gray-700">Delivery Info</h2>

              <input {...register("id")} type="hidden" />

              <div className="flex flex-col gap-1">
                <label className="label-style">
                  Delivery Name<span className="text-red-500">*</span>
                </label>
                <input
                  {...register("name")}
                  className="input-style py-1"
                  placeholder="Enter delivery name"
                />
                <span className="text-[0.8rem] font-medium text-destructive">
                  {errors.name?.message && <>{errors.name.message}</>}
                </span>
              </div>
            </div>

            {/* Price & Spend */}
            <div className="flex flex-col gap-3 bg-white rounded-xl p-4 border">
              <h2 className="font-semibold text-gray-700">Pricing Details</h2>

              <div className="flex flex-col gap-1">
                <label className="label-style">
                  Price<span className="text-red-500">*</span>
                </label>
                <input
                  {...register("price")}
                  className="input-style py-1"
                  placeholder="Enter price"
                />
                <span className="text-[0.8rem] font-medium text-destructive">
                  {errors.price?.message && <>{errors.price.message}</>}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="label-style">
                  Minimum Spend<span className="text-red-500">*</span>
                </label>
                <input
                  {...register("minSpend")}
                  className="input-style py-1"
                  placeholder="Enter minimum spend"
                />
                <span className="text-[0.8rem] font-medium text-destructive">
                  {errors.minSpend?.message && <>{errors.minSpend.message}</>}
                </span>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex-1 flex flex-col gap-5">
            <div className="flex flex-col gap-3 bg-white rounded-xl p-4 border">
              <h2 className="font-semibold text-gray-700">General Details</h2>

              <div className="flex flex-col gap-1">
                <label className="label-style">
                  Delivery Distance<span className="text-red-500">*</span>
                </label>
                <input
                  {...register("deliveryDistance")}
                  className="input-style py-1"
                  placeholder="Enter delivery distance"
                />
                <span className="text-[0.8rem] font-medium text-destructive">
                  {errors.deliveryDistance?.message && (
                    <>{errors.deliveryDistance.message}</>
                  )}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="label-style">Delivery Description</label>
                <textarea
                  {...register("deliveryDesc")}
                  className="textarea-style py-1"
                  placeholder="Enter description"
                />
                <p className="text-[0.8rem] font-medium text-destructive">
                  {errors.deliveryDesc && <>Delivery description is required</>}
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className={`btn-save ${isSubmitting ? "opacity-80" : ""}`}
              >
                {isSubmitting ? "Saving..." : "Update Delivery"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PageComp;
