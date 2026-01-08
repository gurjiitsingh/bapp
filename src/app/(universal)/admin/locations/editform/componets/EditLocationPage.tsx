"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  newLocationSchema,
  TnewLocationSchema,
} from "@/lib/types/locationType";

// import {
//   getLocationById,
//   updateLocation,
// } from "@/app/(universal)/action/location/dbOperation";

import { Button } from "@/components/ui/button";
import { getLocationById, updateLocation } from "@/app/(universal)/action/location/dbOperation";

const EditLocationPage = () => {
  const params = useSearchParams();
  const router = useRouter();
  const id = params.get("id");

  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TnewLocationSchema>({
    resolver: zodResolver(newLocationSchema),
  });

  useEffect(() => {
    async function load() {
      if (!id) return;

      const data = await getLocationById(id);

      if (!data) return;

      setValue("name", data.name);
      setValue("city", data.city);
      setValue("state", data.state);
      setValue("deliveryFee", data.deliveryFee);
      setValue("minSpend", data.minSpend);
      setValue("deliveryDistance", data.deliveryDistance ?? undefined);
      setValue("notes", data.notes ?? "");

      setLoading(false);
    }

    load();
  }, [id, setValue]);

  async function onSubmit(data: TnewLocationSchema) {
    if (!id) return;

    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("city", data.city);
    formData.append("state", data.state);
    formData.append("deliveryFee", String(data.deliveryFee));
    formData.append("minSpend", String(data.minSpend));
    formData.append("deliveryDistance", String(data.deliveryDistance ?? ""));
    formData.append("notes", data.notes ?? "");

    await updateLocation(id, formData);

    alert("Location updated successfully");

    router.push("/admin/locations");
  }

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-5 flex flex-col gap-6 bg-gray-50 rounded-xl"
    >
      <h1 className="text-xl font-semibold text-gray-800 border-b pb-2">
        Edit Location
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-gray-700">
              Location Details
            </h2>

            <div className="flex flex-col gap-1">
              <label className="label-style">Village / Locality *</label>
              <input
                {...register("name")}
                className="input-style py-1"
              />
              <span className="text-[0.8rem] text-red-500">
                {errors.name?.message}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="label-style">City *</label>
              <input
                {...register("city")}
                className="input-style py-1"
              />
              <span className="text-[0.8rem] text-red-500">
                {errors.city?.message}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="label-style">State *</label>
              <input
                {...register("state")}
                className="input-style py-1"
                readOnly
              />
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="bg-white rounded-xl p-4 border shadow-sm flex flex-col gap-3">
            <h2 className="font-semibold text-gray-700">
              Delivery Details
            </h2>

            <div className="flex flex-col gap-1">
              <label className="label-style">Delivery Cost *</label>
              <input
                {...register("deliveryFee")}
                className="input-style py-1"
              />
              <span className="text-[0.8rem] text-red-500">
                {errors.deliveryFee?.message}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="label-style">Minimum Spend *</label>
              <input
                {...register("minSpend")}
                className="input-style py-1"
              />
              <span className="text-[0.8rem] text-red-500">
                {errors.minSpend?.message}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="label-style">Distance (optional)</label>
              <input
                {...register("deliveryDistance")}
                className="input-style py-1"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="label-style">Notes</label>
              <textarea
                {...register("notes")}
                className="textarea-style py-1"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#ff7519] hover:bg-[#d45a00] text-white py-2 rounded-xl"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default EditLocationPage;
