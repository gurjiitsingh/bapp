"use client";

import React, { useState } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  masterCategorySchema,
  TMasterCategorySchema,
} from "@/lib/types/masterCategoryType";

import { Button } from "@/components/ui/button";
import { addNewMasterCategory } from "@/app/(universal)/action/master-category/addNewMasterCategory";
import { MdCategory, MdImage, MdSettings } from "react-icons/md";
import Link from "next/link";
import imageCompression from "browser-image-compression";



const Form = () => {
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TMasterCategorySchema>({
    resolver: zodResolver(masterCategorySchema),
  });

  async function onSubmit(
    data: TMasterCategorySchema
  ) {
    try {
      setIsSubmitting(true);

      const formData = new FormData();

      formData.append("name", data.name);
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

      if (data.image?.[0]) {
        const compressedFile =
          await imageCompression(data.image[0], {
            maxWidthOrHeight: 500,
            maxSizeMB: 0.2,
            initialQuality: 0.8,
            useWebWorker: true,
          });

        formData.append("image", compressedFile);
      } else {
        formData.append("image", "0");
      }



      const result =
        await addNewMasterCategory(formData);

      if (!result.errors) {
        const nextSort =
          Number(data.sortOrder || 0) + 1;

        reset({
          sortOrder:
            nextSort.toString(),
        });

        setValue("name", "");
        setValue(
          "description",
          ""
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mb-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white rounded-2xl p-4 shadow-sm">

        {/* Left Side */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-2">
            {/* Right Side */}



          </div>

        </div>
        <div className="flex gap-2">
          {/* Right Side */}

          <Link href="/admin/master-category">
            <Button
              className="
          h-10
          rounded-xl
          bg-slate-400
          hover:bg-[#00796b]
          text-white
          shadow-none
        "
            >
              All Master Categories
            </Button>
          </Link>

        </div>

      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Master Categories
            </h1>

            <p className="text-muted-foreground mt-1">
              Create reusable categories
              {/* such as Veg, Non Veg,
      Vegan, Men, Women and Children. */}
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-11 px-6 shadow-sm"
          >
            {isSubmitting
              ? "Saving..."
              : "Save Master Category"}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Left */}
          <div className="md:col-span-1 xl:col-span-2 space-y-6">
            <div className="  bg-zink-100 dark:bg-zinc-200
rounded-2xl
 
shadow-sm
hover:shadow-md
transition
p-6">
              <h2 className="font-semibold mb-4">
                <MdCategory className="text-primary" />
                General Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="label-style">
                    Name *
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
                    Description
                  </label>

                  <textarea
                    {...register(
                      "description"
                    )}
                    className="textarea-style"
                    rows={5}
                  />
                </div>
              </div>
            </div>

            <div className="  bg-zink-100 dark:bg-zinc-200 rounded-xl   p-5">
              <h2 className="font-semibold mb-4">
                <MdImage className="text-primary" />
                Appearance
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="label-style">
                    Image
                  </label>

                  <input
                    type="file"
                    {...register(
                      "image"
                    )}
                    className="input-image-style"
                  />
                </div>

                <div>
                  <label className="label-style">
                    Icon
                  </label>

                  <input
                    {...register("icon")}
                    placeholder="leaf, shirt, baby..."
                    className="input-style"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            <div className="  bg-zink-100 dark:bg-zinc-200 rounded-xl   p-5">
              <h2 className="font-semibold mb-4">
                <MdSettings className="text-primary" />
                Settings
              </h2>

              <div className="space-y-4">
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
            </div>

            <div className="
rounded-2xl
 
bg-gradient-to-br
from-primary/5
to-primary/10
p-6
shadow-sm
">
              <h3 className="font-medium mb-2">
                Examples
              </h3>

              <ul className="text-sm text-muted-foreground space-y-1">
                {/* <li>• Veg</li>
              <li>• Non Veg</li>
              <li>• Vegan</li> */}
                <li>• Men</li>
                <li>• Women</li>
                <li>• Children</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Form;