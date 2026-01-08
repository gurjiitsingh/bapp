"use client";

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  newLocationSchema,
  TnewLocationSchema,
} from "@/lib/types/locationType";

import { addNewLocation } from "@/app/(universal)/action/location/dbOperation";

const Page = () => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TnewLocationSchema>({
    resolver: zodResolver(newLocationSchema),
    defaultValues: {
      state: "Punjab",
    },
  });

  async function onsubmit(data: TnewLocationSchema) {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("city", data.city);
    formData.append("state", data.state);

    formData.append("deliveryFee", String(data.deliveryFee));
    formData.append("minSpend", String(data.minSpend));
    formData.append("deliveryDistance", String(data.deliveryDistance ?? ""));
    formData.append("notes", data.notes ?? "");

    const result = await addNewLocation(formData);

    if (!result?.errors) {
      setValue("name", "");
     // setValue("city", "");
      // setValue("deliveryFee", 0);
      // setValue("minSpend", 0);
      // setValue("deliveryDistance", 0 );
     // setValue("notes", "");
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
        Village / Town / Locality
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-gray-700">Location Details</h2>

            {/* Name */}
            <div className="flex flex-col gap-1">
              <label className="label-style">
                Village / Town / Locality<span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                className="input-style py-1"
                placeholder="Eg: Rama Mandi"
              />
              <span className="text-[0.8rem] text-destructive">
                {errors.name?.message}
              </span>
            </div>

            {/* City */}
            <div className="flex flex-col gap-1">
              <label className="label-style">
                City<span className="text-red-500">*</span>
              </label>
              <input
                {...register("city")}
                className="input-style py-1"
                placeholder="Eg: Jalandhar"
              />
              <span className="text-[0.8rem] text-destructive">
                {errors.city?.message}
              </span>
            </div>

            {/* State */}
            <div className="flex flex-col gap-1">
              <label className="label-style">
                State<span className="text-red-500">*</span>
              </label>
              <input
                {...register("state")}
                className="input-style py-1"
                placeholder="Punjab"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-gray-700">Delivery Details</h2>

            {/* Delivery Cost */}
            <div className="flex flex-col gap-1">
              <label className="label-style">
                Delivery Cost<span className="text-red-500">*</span>
              </label>
              <input
                {...register("deliveryFee")}
                className="input-style py-1"
                placeholder="Eg: 40"
              />
              <span className="text-[0.8rem] text-destructive">
                {errors.deliveryFee?.message}
              </span>
            </div>

            {/* Minimum Spend */}
            <div className="flex flex-col gap-1">
              <label className="label-style">
                Minimum Spend<span className="text-red-500">*</span>
              </label>
              <input
                {...register("minSpend")}
                className="input-style py-1"
                placeholder="Eg: 200"
              />
              <span className="text-[0.8rem] text-destructive">
                {errors.minSpend?.message}
              </span>
            </div>

            {/* Optional Fields */}
            <div className="flex flex-col gap-1">
              <label className="label-style">Distance (optional)</label>
              <input
                {...register("deliveryDistance")}
                className="input-style py-1"
                placeholder="Eg: 6 km"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="label-style">Notes</label>
              <textarea
                {...register("notes")}
                className="textarea-style py-1"
                placeholder="Any landmark / info..."
              />
            </div>

            {/* Submit */}
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
