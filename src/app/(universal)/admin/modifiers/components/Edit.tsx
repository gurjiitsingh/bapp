"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newModifierItemSchema,
  TnewModifierItemSchema,
} from "@/lib/types/modifierItemType";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateModifierItem } from "@/app/(universal)/action/modifiers/dbOperation";

export default function EditForm({
  item,
  groups,
}: {
  item: any;
  groups: any[];
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TnewModifierItemSchema>({
    resolver: zodResolver(newModifierItemSchema),

    // ✅ Prefill values
    defaultValues: {
      name: item?.name || "",
      groupId: item?.groupId || "",
      price: item?.price || 0,
      sortOrder: item?.sortOrder || 0,
      status: item?.status || "published",
      isDefault: item?.isDefault || false,
    },
  });

  async function onSubmit(data: TnewModifierItemSchema) {
    setIsSubmitting(true);

    const formData = new FormData();

    // ✅ Required for update
    formData.append("id", item.id);

    formData.append("name", data.name);
    formData.append("groupId", data.groupId);
    formData.append("price", String(data.price));
    formData.append("sortOrder", String(data.sortOrder ?? 0));
    formData.append("status", data.status);
    formData.append("isDefault", data.isDefault ? "true" : "false");

    const res = await updateModifierItem(formData);

    setIsSubmitting(false);

    if (res?.errors) {
      console.error(res.errors);
    } else {
      console.log("Updated successfully");
      // 👉 optional: redirect or toast
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl p-5 space-y-4">
      <h1 className="text-xl font-semibold">Edit Modifier Item</h1>

      {/* NAME */}
      <div>
        <label>Name</label>
        <input {...register("name")} className="input-style" />
        <p className="text-xs text-red-500">{errors.name?.message}</p>
      </div>

      {/* GROUP */}
      <div>
        <label>Modifier Group</label>
        <select {...register("groupId")} className="input-style">
          <option value="">Select Group</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-red-500">{errors.groupId?.message}</p>
      </div>

      {/* PRICE */}
      <div>
        <label>Price</label>
        <input type="number" {...register("price")} className="input-style" />
      </div>

      {/* SORT ORDER */}
      <div>
        <label>Sort Order</label>
        <input type="number" {...register("sortOrder")} className="input-style" />
      </div>

      {/* DEFAULT */}
      <div className="flex items-center gap-2">
        <input type="checkbox" {...register("isDefault")} />
        <label>Default Selected</label>
      </div>

      {/* STATUS */}
      <div>
        <label>Status</label>
        <select {...register("status")} className="input-style">
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {/* BUTTON */}
      <Button disabled={isSubmitting}>
        {isSubmitting ? "Updating..." : "Update"}
      </Button>
    </form>
  );
}