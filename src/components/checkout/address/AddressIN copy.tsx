"use client";

import { useForm } from "react-hook-form";
import { useCartContext } from "@/store/CartContext";

export default function AddressIN() {
  const { setCustomerAddress } = useCartContext();

  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => {
    setCustomerAddress({
      country: "IN",
      mobile: data.mobile,
      name: data.name,
      addressLine1: data.house,
      area: data.area,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      email: data.email || null,
    });
  };

  return (
<div className="w-full bg-white border border-gray-200 rounded-xl p-4">
  <h2 className="text-sm font-semibold text-gray-700 mb-4">
    Billing Details
  </h2>

  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

    {/* Mobile (Required) */}
    <div>
      <label className="label-light">
        Mobile Number <span className="text-red-500">*</span>
      </label>
      <input
        {...register("mobNo")}
        className="input-light"
        placeholder="10 digit mobile number"
      />
    </div>

    {/* Email (Optional) */}
    <div>
      <label className="label-light">Email (optional)</label>
      <input
        {...register("email")}
        className="input-light"
        placeholder="you@example.com"
      />
    </div>

    {/* Name */}
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="label-light">First Name *</label>
        <input {...register("firstName")} className="input-light" />
      </div>

      <div>
        <label className="label-light">Last Name *</label>
        <input {...register("lastName")} className="input-light" />
      </div>
    </div>

    {/* Village / Locality / Town (REQUIRED) */}
    <div>
      <label className="label-light">
        Village / Locality / Town <span className="text-red-500">*</span>
      </label>
      <input
        {...register("addressLine1")}
        className="input-light"
      />
    </div>

    {/* House / Street */}
    <div>
      <label className="label-light">House / Street</label>
      <input
        {...register("addressLine2")}
        className="input-light"
      />
    </div>

    {/* City + State */}
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="label-light">City</label>
        <input {...register("city")} className="input-light" />
      </div>

      <div>
        <label className="label-light">State</label>
        <input {...register("state")} className="input-light" />
      </div>
    </div>

    {/* Zip (Optional) */}
    <div>
      <label className="label-light">Pincode</label>
      <input {...register("zipCode")} className="input-light" />
    </div>

    <button
      type="submit"
      className="w-full mt-3 py-2 text-gray-500 rounded-md bg-gray-300 hover:bg-gray-200 transition"
    >
      Use this address
    </button>
  </form>
</div>


  );
}
