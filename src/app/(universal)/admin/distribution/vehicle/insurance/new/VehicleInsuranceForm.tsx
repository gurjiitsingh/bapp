"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { addVehicleInsurance } from "@/app/(universal)/action/distribution/vehicle/insurance/addVehicleInsurance";
import { VehicleInsuranceFormType, VehicleOption } from "@/lib/types/distribution/vehicle/insurance/VehicleInsuranceFormType";

 

type Props = {
  vehicles: VehicleOption[];
};

export default function VehicleInsuranceForm({
  vehicles,
}: Props) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleInsuranceFormType>({
    defaultValues: {
      vehicleId: "",
      insuranceCompany: "",
      policyNumber: "",
      insuranceType: "COMPREHENSIVE",
      startDate: "",
      endDate: "",
      renewDate: "",
      premiumAmount: 0,
      remarks: "",
    },
  });

  const onSubmit = (data: VehicleInsuranceFormType) => {

     
    const selectedVehicle = vehicles.find(
      (vehicle) => vehicle.id === data.vehicleId
    );
 console.log("in-----------", selectedVehicle)

    startTransition(async () => {
      const result = await addVehicleInsurance({
        vehicleId: data.vehicleId,
        vehicleName: selectedVehicle?.name || "",
         locationCode: selectedVehicle?.locationCode || "",
        insuranceCompany: data.insuranceCompany,
        policyNumber: data.policyNumber,
        insuranceType: data.insuranceType,

        startDate: new Date(data.startDate).getTime(),
        endDate: new Date(data.endDate).getTime(),
        renewDate: new Date(data.renewDate).getTime(),

        premiumAmount: Number(data.premiumAmount),

        remarks: data.remarks,
      });

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Vehicle */}
      <div className="flex flex-col gap-2">
        <label className="label-style-4">
          Vehicle
        </label>

        <select
          {...register("vehicleId", {
            required: "Vehicle is required",
          })}
          className="input-style-4"
        >
          <option value="">Select vehicle</option>

          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.vehicleNumber || vehicle.locationCode}
              {vehicle.name
                ? ` - ${vehicle.name}`
                : ""}
            </option>
          ))}
        </select>

        {errors.vehicleId && (
          <p className="text-sm text-red-500">
            {errors.vehicleId.message}
          </p>
        )}
      </div>

      {/* Insurance Company */}
      <div className="flex flex-col gap-2">
        <label className="label-style-4">
          Insurance Company
        </label>

        <input
          type="text"
          {...register("insuranceCompany", {
            required: "Insurance company is required",
          })}
          className="input-style-4"
          placeholder="e.g. ICICI Lombard"
        />

        {errors.insuranceCompany && (
          <p className="text-sm text-red-500">
            {errors.insuranceCompany.message}
          </p>
        )}
      </div>

      {/* Policy Number */}
      <div className="flex flex-col gap-2">
        <label className="label-style-4">
          Policy Number
        </label>

        <input
          type="text"
          {...register("policyNumber", {
            required: "Policy number is required",
          })}
          className="input-style-4"
          placeholder="Enter policy number"
        />

        {errors.policyNumber && (
          <p className="text-sm text-red-500">
            {errors.policyNumber.message}
          </p>
        )}
      </div>

      {/* Insurance Type */}
      <div className="flex flex-col gap-2">
        <label className="label-style-4">
          Insurance Type
        </label>

        <select
          {...register("insuranceType")}
          className="input-style-4"
        >
          <option value="COMPREHENSIVE">
            Comprehensive
          </option>

          <option value="THIRD_PARTY">
            Third Party
          </option>

          <option value="OTHER">
            Other
          </option>
        </select>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Start Date */}
        <div className="flex flex-col gap-2">
          <label className="label-style-4">
            Policy Start Date
          </label>

          <input
            type="date"
            {...register("startDate", {
              required: "Start date is required",
            })}
            className="input-style-4"
          />

          {errors.startDate && (
            <p className="text-sm text-red-500">
              {errors.startDate.message}
            </p>
          )}
        </div>

        {/* End Date */}
        <div className="flex flex-col gap-2">
          <label className="label-style-4">
            Policy End Date
          </label>

          <input
            type="date"
            {...register("endDate", {
              required: "End date is required",
            })}
            className="input-style-4"
          />

          {errors.endDate && (
            <p className="text-sm text-red-500">
              {errors.endDate.message}
            </p>
          )}
        </div>

        {/* Renew Date */}
        <div className="flex flex-col gap-2">
          <label className="label-style-4">
            Renew Date
          </label>

          <input
            type="date"
            {...register("renewDate", {
              required: "Renew date is required",
            })}
            className="input-style-4"
          />

          {errors.renewDate && (
            <p className="text-sm text-red-500">
              {errors.renewDate.message}
            </p>
          )}
        </div>
      </div>

      {/* Premium */}
      <div className="flex flex-col gap-2">
        <label className="label-style-4">
          Premium Amount
        </label>

        <input
          type="number"
          step="0.01"
          min="0"
          {...register("premiumAmount", {
            valueAsNumber: true,
            min: {
              value: 0,
              message: "Premium cannot be negative",
            },
          })}
          className="input-style-4"
          placeholder="0.00"
        />

        {errors.premiumAmount && (
          <p className="text-sm text-red-500">
            {errors.premiumAmount.message}
          </p>
        )}
      </div>

      {/* Remarks */}
      <div className="flex flex-col gap-2">
        <label className="label-style-4">
          Remarks
        </label>

        <textarea
          {...register("remarks")}
          rows={3}
          className="input-style-4"
          placeholder="Optional remarks"
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending
            ? "Saving..."
            : "Add Insurance"}
        </button>
      </div>
    </form>
  );
}