"use client";

import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newModifierGroupSchema,
  TnewModifierGroupSchema,
} from "@/lib/types/modifierGroupType";
import { useState } from "react";

import { useRouter } from "next/navigation";
import { updateModifierGroup } from "./updateModifierGroup";


export default function EditForm({ group }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TnewModifierGroupSchema>({
    resolver: zodResolver(newModifierGroupSchema),
    defaultValues: {
      name: group.name,
      minSelection: group.minSelection,
      maxSelection: group.maxSelection,
      sortOrder: group.sortOrder,
      status: group.status,
    },
  });

  async function onSubmit(data: TnewModifierGroupSchema) {
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("minSelection", String(data.minSelection));
    formData.append("maxSelection", String(data.maxSelection));
    formData.append("sortOrder", String(data.sortOrder ?? 0));
    formData.append("status", data.status);

    const res = await updateModifierGroup(group.id, formData);

    setIsSubmitting(false);

    if (!res?.errors) {
      router.push("/admin/modifier-groups"); // ✅ go back
    } else {
      console.error(res.errors);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl p-5 space-y-4">
      <h1 className="text-xl font-semibold">Edit Modifier Group</h1>

      {/* Name */}
      <div>
        <label>Name</label>
        <input {...register("name")} className="input-style" />
        <p className="text-xs text-red-500">{errors.name?.message}</p>
      </div>

      {/* Min / Max */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label>Min Selection</label>
          <input {...register("minSelection")} className="input-style" />
        </div>

        <div>
          <label>Max Selection</label>
          <input {...register("maxSelection")} className="input-style" />
        </div>
      </div>

      {/* Sort */}
      <div>
        <label>Sort Order</label>
        <input {...register("sortOrder")} className="input-style" />
      </div>

      {/* Status */}
      <div>
        <label>Status</label>
        <select {...register("status")} className="input-style">
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <Button disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update"}
      </Button>
    </form>
  );
}