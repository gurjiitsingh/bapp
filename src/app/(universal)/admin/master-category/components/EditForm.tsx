"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import imageCompression from "browser-image-compression";
import {
  masterCategorySchema,
  TMasterCategorySchema,
} from "@/lib/types/masterCategoryType";

import { Button } from "@/components/ui/button";

import { updateMasterCategory } from "@/app/(universal)/action/master-category/updateMasterCategory";
import { MdImage } from "react-icons/md";
import Image from "next/image";

type Props = {
  category: any;
};

export default function EditForm({
  category,
}: Props) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TMasterCategorySchema>({
    resolver: zodResolver(
      masterCategorySchema
    ),

    defaultValues: {
      name: category.name,
      description:
        category.description,
      sortOrder:
        category.sortOrder?.toString(),
      icon: category.icon,
      isActive:
        category.isActive,
    },
  });

  async function onSubmit(
    data: TMasterCategorySchema
  ) {
    try {
      setIsSubmitting(true);

      const formData =
        new FormData();

      formData.append(
        "name",
        data.name
      );

      formData.append(
        "description",
        data.description || ""
      );

      formData.append(
        "sortOrder",
        data.sortOrder || "0"
      );

      formData.append(
        "icon",
        data.icon || ""
      );

      formData.append(
        "isActive",
        data.isActive || "yes"
      );

      formData.append(
        "oldImageUrl",
        category.image || ""
      );

      if (data.image?.[0]) {
        const compressedFile =
          await imageCompression(data.image[0], {
            maxWidthOrHeight: 550,
            maxSizeMB: 0.2,
            initialQuality: 0.8,
            useWebWorker: true,
          });

        formData.append(
          "image",
          compressedFile
        );
      }

      const result =
        await updateMasterCategory(
          category.id,
          formData
        );

      if (result.success) {
        router.push(
          "/admin/master-category"
        );

        router.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">
          Edit Master Category
        </h1>

        <p className="text-muted-foreground mt-1">
          Update master category
          information.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="label-style">
              Name
            </label>

            <input
              {...register("name")}
              className="input-style"
            />

            <p className="error-text">
              {errors.name?.message}
            </p>
          </div>

          <div>
            <label className="label-style">
              Sort Order
            </label>

            <input
              {...register(
                "sortOrder"
              )}
              className="input-style"
            />
          </div>



          <div className="bg-gray-50 rounded-xl border p-4">
            <label className="label-style mb-3 block">
              Category Image
            </label>

            {category.image && (
              <div className="mb-4">
                <Image
                  src={category.image}
                  alt={category.name}
                  width={120}
                  height={120}
                  className="rounded-xl border object-cover"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Current image
                </p>
              </div>
            )}

            <input
              type="file"
              {...register("image")}
              className="input-image-style"
            />

            <p className="text-xs text-gray-500 mt-2">
              Leave empty to keep current image.
            </p>
          </div>

          <div>
            <label className="label-style">
              Status
            </label>

            <select
              {...register(
                "isActive"
              )}
              className="input-style"
            >
              <option value="yes">
                Active
              </option>

              <option value="no">
                Inactive
              </option>
            </select>
          </div>
        </div>

        <div className="mt-5">
          <label className="label-style">
            Description
          </label>

          <textarea
            {...register(
              "description"
            )}
            rows={5}
            className="textarea-style"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Updating..."
            : "Update Category"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            router.back()
          }
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}