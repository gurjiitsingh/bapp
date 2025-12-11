"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { settingSchema, settingSchemaType } from "@/lib/types/settingType";
import {
  fetchSettingById,
  updateSettingById,
} from "@/app/(universal)/action/setting/dbOperations";

const EditSettingPage = () => {
  const [loading, setLoading] = useState(true);
  const [docId, setDocId] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<settingSchemaType>({
    resolver: zodResolver(settingSchema),
  });

  useEffect(() => {
    const key = searchParams.get("key");
    if (!key) return;

    setDocId(key);

    const load = async () => {
      try {
        const setting = await fetchSettingById(key);
        if (!setting) {
          router.push("/admin/setting");
          return;
        }
        reset(setting);
      } catch (err) {
        console.error("Error loading setting:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [searchParams, reset, router]);

  const onSubmit = async (data: settingSchemaType) => {
    if (!docId) return;

    try {
      await updateSettingById(docId, data);
      router.push("/admin/setting"); // ← Directly navigate
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update setting.");
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-w-xl">
      <h1 className="text-xl font-bold mb-4">Edit Setting</h1>

      <div className="flex flex-col gap-4">
        <div>
          <label className="label-style">Setting Name</label>
          <input
            {...register("name")}
            className="input-style"
            placeholder="e.g. Home page offer"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="label-style">Setting Value</label>
          <input
            {...register("value")}
            className="input-style"
            placeholder="e.g. 10% discount"
          />
          {errors.value && (
            <p className="text-red-500 text-sm">{errors.value!.message}</p>
          )}
        </div>

        <button className="form-btn-style" type="submit">
          Update Setting
        </button>
      </div>
    </form>
  );
};

export default EditSettingPage;
