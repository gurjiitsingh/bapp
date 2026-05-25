"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { outletSchema, ToutletSchema } from "@/lib/types/outletType";

import { Button } from "@/components/ui/button";
import { saveOutlet } from "@/app/(universal)/action/outlet/dbOperation";
import OutletLogoUpload from "./OutletLogoUpload";

const Outlet = () => {
  const [loading, setLoading] = useState(false);
  const [outletId, setOutletId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ToutletSchema>({
    resolver: zodResolver(outletSchema),

    defaultValues: {
      printerWidth: "80",
      isActive: true,
      countryCode: "IN",

      // ✅ QR
      qrEnabled: false,
      qrText: "",
      qrTitle: "",
    },
  });

  // 🔁 Load existing outlet (edit mode)
  useEffect(() => {
    async function fetchOutlet() {
      const res = await fetch("/api/outlet");

      if (!res.ok) return;

      const data = await res.json();

      if (data?.outletId) {
        setOutletId(data.outletId);

        reset({
          ...data,

          printerWidth: String(data.printerWidth),

          countryCode: data.countryCode ?? "DE",

          // ✅ SAFE QR RESET
          qrEnabled: data.qrEnabled ?? false,
          qrText: data.qrText ?? "",
          qrTitle: data.qrTitle ?? "",
          upiId: data.upiId ?? "",
          upiName: data.upiName ?? "",
          upiTitle: data.upiTitle ?? "",
        });
      }
    }

    fetchOutlet();
  }, [reset]);

  async function onSubmit(data: ToutletSchema) {
    setLoading(true);

    const result = await saveOutlet({
      ...data,
      ownerId: "dummy_owner",
      outletId: outletId ?? undefined,
    });

    setLoading(false); 

    if (!result) {
      alert("Unexpected server error");
      return;
    }

    if (result.success) {
      alert(outletId ? "Outlet updated" : "Outlet created");

      setOutletId(result.outletId);
    } else {
      console.error(result.errors);

      alert(JSON.stringify(result.errors, null, 2));
    }
  }

  return (
    <>
    <div className="max-w-4xl mx-auto p-5 space-y-5">
      {outletId && <OutletLogoUpload outletId={outletId} />}
</div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-4xl mx-auto p-5 space-y-5"
      >
        <h1 className="text-2xl font-semibold">
          {outletId ? "Edit Outlet" : "Create Outlet"}
        </h1>

        <input
          {...register("outletName")}
          placeholder="Outlet Name"
          className="input-style"
        />

        <p className="text-xs text-red-500">
          {errors.outletName?.message}
        </p>

        <input
          {...register("taxType")}
          placeholder="Type : GST, VAT"
          className="input-style"
        />

        <input
          {...register("gstVatNumber")}
          placeholder="GST / VAT Number"
          className="input-style"
        />

        <input
          {...register("addressLine1")}
          placeholder="Address Line 1"
          className="input-style"
        />

        <input
          {...register("addressLine2")}
          placeholder="Address Line 2"
          className="input-style"
        />

        <input
          {...register("addressLine3")}
          placeholder="Address Line 3"
          className="input-style"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            {...register("city")}
            placeholder="City"
            className="input-style"
          />

          <input
            {...register("state")}
            placeholder="State"
            className="input-style"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            {...register("zipcode")}
            placeholder="Pincode"
            className="input-style"
          />

         <select {...register("countryCode")} className="input-style">
  <option value="DE">Germany</option>
  <option value="IN">India</option>
  <option value="US">USA</option>
  <option value="CA">Canada</option>

  <option value="ES">Spain</option>
  <option value="AU">Australia</option>
  <option value="GB">United Kingdom</option>
  <option value="FR">France</option>
  <option value="IT">Italy</option>
</select>
        </div>

        <input
          {...register("phone")}
          placeholder="Phone"
          className="input-style"
        />

        <input
          {...register("phone2")}
          placeholder="Phone 2"
          className="input-style"
        />

        <input
          {...register("email")}
          placeholder="Email"
          className="input-style"
        />

        <input
          {...register("web")}
          placeholder="Website URL"
          className="input-style"
        />

        <select {...register("printerWidth")} className="input-style">
          <option value="58">58 mm</option>
          <option value="80">80 mm</option>
        </select>

        <textarea
          {...register("footerNote")}
          placeholder="Footer note"
          className="textarea-style"
        />

      <label className="flex items-center gap-2">
            <input type="checkbox" {...register("qrEnabled")} />
            Enable QR Code On Receipt
          </label>
        {/* ============================= */}
        {/* ✅ QR CODE SETTINGS */}
        {/* ============================= */}
        <div className="space-y-3 rounded-2xl border p-4">
          <h2 className="text-lg font-semibold">
            General QR Code Settings (web link etc)
          </h2>

    

        

          <textarea
            {...register("qrText")}
            placeholder="QR URL / UPI / Payment Link / Website"
            className="textarea-style"
          />

            <input
            {...register("qrTitle")}
            placeholder="Text under QR code"
            className="input-style"
          />
        </div>

        {/* ============================= */}
{/* ✅ UPI SETTINGS (NEW) */}
{/* ============================= */}
<div className="space-y-3 rounded-2xl border p-4">
  <h2 className="text-lg font-semibold">
    UPI QR code setting (Your upi id)
  </h2>

  <input
    {...register("upiId")}
    placeholder="UPI ID (e.g. shop@upi)"
    className="input-style"
  />

  <input
    {...register("upiName")}
    placeholder="UPI Name (e.g. My Shop)"
    className="input-style"
  />

  <input
  {...register("upiTitle")}
  placeholder="UPI QR Text (e.g. Scan to Pay)"
  className="input-style"
/>
</div>



        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("isActive")} />
          Active Outlet
        </label>

   
        <p className="text-xs text-red-500">
          {errors.countryCode?.message}
        </p>

        <Button disabled={loading} className="btn-save w-full">
          {loading ? "Saving..." : "Save Outlet"}
        </Button>
      </form>
    </>
  );
};

export default Outlet;