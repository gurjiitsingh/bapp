"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
//import { toast } from "sonner";

import { Button } from "@/components/ui/button";
 
import toast from "react-hot-toast";
import { userDashboardType } from "@/lib/types/userDashboardType";
 
import { updateVehicle } from "@/app/(universal)/action/distribution/editVehicle";
import { VehicleType } from "@/lib/types/distribution/VehicleType";
 




 

type Props = {
  drivers: userDashboardType[];
  location: VehicleType;
};

export default function VehicleEditForm({
  drivers,
  location,
}: Props) {

 
  const [isSubmitting, startTransition] = useTransition();

const {
  register,
  handleSubmit,
  reset,
  setValue,
} = useForm<VehicleType>({
defaultValues: {
  id: location.id,

  locationCode: location.locationCode,
  name: location.name,
  type: location.type, 
  responsiblePersonId: location.responsiblePersonId,
  responsiblePersonName: location.responsiblePersonName,
  capacity: location.capacity,
  remarks: location.remarks ?? "",
},
});

const onSubmit = (data: VehicleType) => {
 console.log(data);

  startTransition(async () => {
    const result = await updateVehicle(data);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
  });
};

  return (<div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6 w-full">
    <div className="w-full">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Add Vehicle
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Create a vehicle for distribution
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col xl:flex-row gap-3 w-full"
      >
<input
  type="hidden"
  {...register("id")}
/>
        {/* ================= LEFT ================= */}

        <div className="bg-white flex-[0.6] rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">

          <div className="rounded-2xl border border-gray-200 p-5 space-y-5">

            <h3 className="font-semibold text-lg">
              Vehicle Details
            </h3>

            <div className="grid md:grid-cols-2 gap-5">

              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Vehicle Number
                </label>

                <input
                  {...register("locationCode")}
                  className="input-style-4"
                  placeholder="PB10AB1234"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Vehicle Name
                </label>

                <input
                  {...register("name")}
                  className="input-style-4"
                  placeholder="Tata Ace"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Vehicle Type
                </label>

                <select
                  {...register("type")}
                  className="input-style-4"
                >
                  <option value="PICKUP">
                    Pickup
                  </option>

                  <option value="VAN">
                    Van
                  </option>

                  <option value="TRUCK">
                    Truck
                  </option>
                </select>

                <div className="flex flex-col gap-2">
  <label className="label-style-4">
    Capacity (Kg)
  </label>

  <input
    type="number"
    {...register("capacity", {
      valueAsNumber: true,
    })}
    className="input-style-4"
    placeholder="1000"
  />
</div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="label-style-4">
                  Driver
                </label>
                <input
  type="hidden"
  {...register("responsiblePersonName")}
/>

<select
  {...register("responsiblePersonId")}
  className="input-style-4"
  onChange={(e) => {
    const id = e.target.value;

    const driver = drivers.find(
      (d) => d.id === id
    );

    setValue("responsiblePersonId", id);
    setValue(
      "responsiblePersonName",
      driver?.fullName ?? ""
    );
  }}
>
  <option value="">
    Select Driver
  </option>

  {drivers.map((driver) => (
    <option
      key={driver.id}
      value={driver.id}
    >
      {driver.fullName}
      {driver.employeeId
        ? ` (${driver.employeeId})`
        : ""}
    </option>
  ))}
</select>
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="label-style-4">
                  Remarks
                </label>

                <textarea
                  {...register("remarks")}
                  rows={4}
                  className="input-style-4 resize-none"
                  placeholder="Optional remarks..."
                />
              </div>

            </div>

          </div>

        </div>

        {/* ================= RIGHT ================= */}

        <div className="bg-white flex-[0.4] rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col gap-5">

          <div className="rounded-xl bg-blue-50 border border-blue-200 p-5 text-center">

            <h3 className="text-xl font-bold">
              Vehicle Information
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Vehicles are used for loading stock,
              delivery, returns and route sales.
            </p>

          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="btn-save-4 h-11"
          >
            {isSubmitting
              ? "Saving..."
              : "Save Vehicle"}
          </Button>

        </div>

      </form>

    </div>
  </div>
);
 
}