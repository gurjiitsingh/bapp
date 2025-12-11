"use client";

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newPorductSchema,
  TnewdeliverySchema,
} from "@/lib/types/deliveryType";
import { addNewdelivery } from "@/app/(universal)/action/delivery/dbOperation";

const Page = () => {
  const {
    register,
    formState: { errors, isSubmitting },
    setValue,
    handleSubmit,
  } = useForm<TnewdeliverySchema>({
    resolver: zodResolver(newPorductSchema),
  });

  async function onsubmit(data: TnewdeliverySchema) {
    const formData = new FormData();

    const code = data.name.toUpperCase();
    formData.append("name", code);
    formData.append("price", data.price);
    formData.append("deliveryDistance", data.deliveryDistance!);
    formData.append("productCat", data.productCat);
    formData.append("deliveryDesc", data.deliveryDesc!);
    formData.append("minSpend", data.minSpend!);

    const result = await addNewdelivery(formData);

    if (!result?.errors) {
      setValue("name", "");
      setValue("deliveryDesc", "");
      setValue("price", "");
      setValue("productCat", "");
      setValue("minSpend", "");
      setValue("deliveryDistance", "");
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
        Delivery Information
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Section */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Delivery Details */}
          <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-gray-700">Delivery Details</h2>

            <div className="flex flex-col gap-1">
              <label className="label-style">
                Zip Code<span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                className="input-style py-1"
                placeholder="Enter zip code"
              />
              <span className="text-[0.8rem] text-destructive">
                {errors.name?.message}
              </span>
            </div>

            <input
              {...register("productCat", { value: "all" })}
              type="hidden"
            />
          </div>

          {/* Cost Details */}
          <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-gray-700">Cost Details</h2>

            <div className="flex flex-col gap-1">
              <label className="label-style">
                Delivery Cost<span className="text-red-500">*</span>
              </label>
              <input
                {...register("price")}
                className="input-style py-1"
                placeholder="Enter delivery cost"
              />
              <span className="text-[0.8rem] text-destructive">
                {errors.price?.message}
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
              <span className="text-[0.8rem] text-destructive">
                {errors.minSpend?.message}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-gray-700">General Details</h2>

            {/* Delivery Distance */}
            <div className="flex flex-col gap-1">
              <label className="label-style">
                Delivery Distance<span className="text-red-500">*</span>
              </label>
              <input
                {...register("deliveryDistance")}
                className="input-style py-1"
                placeholder="Enter delivery distance"
              />
              <span className="text-[0.8rem] text-destructive">
                {errors.deliveryDistance?.message}
              </span>
            </div>

            {/* Delivery Description */}
            <div className="flex flex-col gap-1">
              <label className="label-style">Delivery Description</label>
              <textarea
                {...register("deliveryDesc")}
                className="textarea-style py-1"
                placeholder="Enter delivery details..."
              />
              <span className="text-[0.8rem] text-destructive">
                {errors.deliveryDesc?.message}
              </span>
            </div>

            {/* Submit Button */}
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

export default Page;
