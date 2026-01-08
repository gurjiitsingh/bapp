"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { outletSchema, ToutletSchema } from "@/lib/types/outletType";

import { Button } from "@/components/ui/button";
import { saveOutlet } from "@/app/(universal)/action/outlet/dbOperation";

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
      alert("Failed to save outlet");
    }
  }

  return (
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
      <p className="text-xs text-red-500">{errors.outletName?.message}</p>

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

      {/* ⭐ NEW FIELD */}
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
        <input
          {...register("country")}
          placeholder="Country"
          className="input-style"
        />
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

      {/* ⭐ NEW FIELD */}
      <input
        {...register("email")}
        placeholder="Email"
        className="input-style"
      />

      {/* ⭐ NEW FIELD */}
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
        <input type="checkbox" {...register("isActive")} />
        Active Outlet
      </label>

      <Button disabled={loading} className="btn-save w-full">
        {loading ? "Saving..." : "Save Outlet"}
      </Button>
    </form>
  );
};

export default Outlet;
