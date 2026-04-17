"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


import { Button } from "@/components/ui/button";
import { addNewClient } from "../action/client/dbOperations";
import { clientSchema, TClientSchema } from "@/lib/types/clientType.ts";

const AddClientPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
const [generatedKey, setGeneratedKey] = useState<string | null>(null);

const {
  register,
  formState: { errors },
  handleSubmit,
  reset,
} = useForm<TClientSchema>({
  resolver: zodResolver(clientSchema),
  defaultValues: {
    status: "active",
    warningDays: 5,
    maxWaiters: 5,
    maxPOS: 1,
    renewDate: new Date().toISOString().split("T")[0],
  },
});

  async function onSubmit(data: TClientSchema) {
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("clientId", data.clientId.trim());
formData.append("apiKey", data.apiKey.trim());
formData.append("applicationId", data.applicationId.trim());
formData.append("projectId", data.projectId.trim());
formData.append("status", data.status.trim());

formData.append("renewDate", data.renewDate?.trim() || "");

formData.append("warningDays", String(data.warningDays));
formData.append("maxWaiters", String(data.maxWaiters));
formData.append("maxPOS", String(data.maxPOS));

      const result = await addNewClient(formData);

    if (!result?.errors) {
  alert("✅ Client added successfully");

  setGeneratedKey(result.message?.clientKey || null); // ✅ store key
  reset();
} else {
        console.error("❌ Errors:", result.errors);
        alert("❌ " + JSON.stringify(result.errors));
      }

    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4 p-5 max-w-2xl">

        <h1 className="text-2xl font-semibold mb-2">Add Client</h1>

        {/* Card */}
        <div className="bg-white rounded-xl p-5 border flex flex-col gap-4">

          {/* CLIENT ID */}
          <div className="flex flex-col gap-1">
            <label className="label-style">
              Client ID <span className="text-red-500">*</span>
            </label>
            <input {...register("clientId")} className="input-style" />
            {errors.clientId && (
              <span className="error-text">{errors.clientId.message}</span>
            )}
          </div>

          {/* API KEY */}
          <div className="flex flex-col gap-1">
            <label className="label-style">
              API Key <span className="text-red-500">*</span>
            </label>
            <input {...register("apiKey")} className="input-style" />
            {errors.apiKey && (
              <span className="error-text">{errors.apiKey.message}</span>
            )}
          </div>

          {/* APPLICATION ID */}
          <div className="flex flex-col gap-1">
            <label className="label-style">
              Application ID <span className="text-red-500">*</span>
            </label>
            <input {...register("applicationId")} className="input-style" />
            {errors.applicationId && (
              <span className="error-text">
                {errors.applicationId.message}
              </span>
            )}
          </div>

          {/* PROJECT ID */}
          <div className="flex flex-col gap-1">
            <label className="label-style">
              Project ID <span className="text-red-500">*</span>
            </label>
            <input {...register("projectId")} className="input-style" />
            {errors.projectId && (
              <span className="error-text">{errors.projectId.message}</span>
            )}
          </div>


          {/* SUBSCRIPTION */}
<div className="bg-gray-50 rounded-lg p-4 border flex flex-col gap-3">
  <h2 className="font-semibold">Subscription</h2>

  {/* STATUS */}
  <div className="flex flex-col gap-1">
    <label>Status</label>
    <select {...register("status")} className="input-style">
      <option value="active">Active</option>
      <option value="expired">Expired</option>
      <option value="blocked">Blocked</option>
    </select>
  </div>

  {/* RENEW DATE */}
  <div className="flex flex-col gap-1">
    <label>Renew Date</label>
    <input type="date" {...register("renewDate")} className="input-style" />
  </div>

  {/* WARNING DAYS */}
  <div className="flex flex-col gap-1">
    <label>Warning Days</label>
    <input
      type="number"
      {...register("warningDays")}
      className="input-style"
    />
  </div>
</div>


{/* LIMITS */}
<div className="bg-gray-50 rounded-lg p-4 border flex flex-col gap-3">
  <h2 className="font-semibold">Limits</h2>

  <div className="flex flex-col gap-1">
    <label>Max Waiters</label>
    <input
      type="number"
      {...register("maxWaiters")}
      className="input-style"
    />
  </div>

  <div className="flex flex-col gap-1">
    <label>Max POS</label>
    <input
      type="number"
      {...register("maxPOS")}
      className="input-style"
    />
  </div>
</div>

          {/* BUTTON */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`btn-save ${isSubmitting ? "opacity-80" : ""}`}
          >
            {isSubmitting ? "Saving..." : "Save Client"}
          </Button>
{generatedKey && (
  <div className="bg-green-50 border border-green-300 p-3 rounded">
    <p className="text-sm font-semibold text-green-700">
      Client Key (Save this):
    </p>
    <p className="text-xs break-all">{generatedKey}</p>
  </div>
)}
        </div>
      </div>
    </form>
  );
};

export default AddClientPage;