"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { addInventoryCategory } from "../../../inventoryCategory/addInventoryCategory";
import { categorySchema, TCategorySchema } from "@/lib/types/InventoryCategory";




const Page = () => {
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } =
    useForm<TCategorySchema>({
      resolver:
        zodResolver(
          categorySchema
        ),

      defaultValues: {
        description: "",
        sortOrder: 0,

        trackInventory: true,

        allowNegativeStock:
          false,

        color: "#ef4444",

        icon: "Package",

        isActive: true,
      },
    });

  async function onSubmit(
    data: TCategorySchema
  ) {
    if (isSubmitting)
      return;

    setIsSubmitting(true);

    try {
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
        String(
          data.sortOrder
        )
      );

      formData.append(
        "trackInventory",
        data.trackInventory
          ? "true"
          : "false"
      );

      formData.append(
        "allowNegativeStock",
        data.allowNegativeStock
          ? "true"
          : "false"
      );

      formData.append(
        "color",
        data.color || ""
      );

      formData.append(
        "icon",
        data.icon || ""
      );

      formData.append(
        "isActive",
        data.isActive
          ? "true"
          : "false"
      );

      const result =
        await addInventoryCategory(
          formData
        );

      if (
        !result?.errors
      ) {
        alert(
          "Category saved successfully"
        );

        reset({
          name: "",
          description:
            "",
          sortOrder: 0,

          trackInventory:
            true,

          allowNegativeStock:
            false,

          color:
            "#ef4444",

          icon:
            "Package",

          isActive:
            true,
        });
      } else {
        alert(
          result.errors
            ?.general ||
            "Failed to save category"
        );
      }
    } catch (error) {
      console.error(
        error
      );

      alert(
        "Something went wrong"
      );
    } finally {
      setIsSubmitting(
        false
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit
      )}
      className="max-w-7xl mx-auto p-4 md:p-6"
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Create Inventory
            Category
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Organize inventory
            items into
            manageable
            groups
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* LEFT */}
        <div className="xl:col-span-2 flex flex-col gap-5">
          {/* Category Details */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Category
              Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="label-style-4">
                  Category
                  Name
                </label>

                <input
                  {...register(
                    "name"
                  )}
                  placeholder="e.g. Dairy Products"
                  className="input-style-4 mt-1"
                />

                <p className="text-xs text-red-500 mt-1">
                  {
                    errors
                      .name
                      ?.message
                  }
                </p>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="label-style-4">
                  Description
                </label>

                <textarea
                  {...register(
                    "description"
                  )}
                  rows={
                    4
                  }
                  placeholder="Optional category description"
                  className="input-style-4 mt-1"
                />

                <p className="text-xs text-red-500 mt-1">
                  {
                    errors
                      .description
                      ?.message
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Inventory Rules */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Inventory
              Rules
            </h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  {...register(
                    "trackInventory"
                  )}
                  className="h-4 w-4"
                />

                <label className="label-style-4">
                  Track
                  Inventory
                  Stock
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  {...register(
                    "allowNegativeStock"
                  )}
                  className="h-4 w-4"
                />

                <label className="label-style-4">
                  Allow
                  Negative
                  Stock
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-5">
          {/* Display Settings */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Display
              Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="label-style-4">
                  Sort
                  Order
                </label>

                <input
                  type="number"
                  {...register(
                    "sortOrder",
                    {
                      valueAsNumber:
                        true,
                    }
                  )}
                  className="input-style-4 mt-1"
                />
              </div>

              <div>
                <label className="label-style-4">
                  Color
                </label>

                <input
                  type="color"
                  {...register(
                    "color"
                  )}
                  className="h-11 w-full rounded-xl border border-gray-200 mt-1"
                />
              </div>

              <div>
                <label className="label-style-4">
                  Icon
                </label>

                <input
                  {...register(
                    "icon"
                  )}
                  placeholder="Package"
                  className="input-style-4 mt-1"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Settings
            </h2>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                {...register(
                  "isActive"
                )}
                className="h-4 w-4"
              />

              <label className="label-style-4">
                Active
                Category
              </label>
            </div>
          </div>

          {/* Save */}
          <div className="bg-gradient-to-br from-rose-50 to-white border border-rose-100 rounded-2xl shadow-sm p-5">
            <h3 className="text-lg font-semibold text-gray-800">
              Save
              Category
            </h3>

            <p className="text-sm text-gray-500 mt-1 mb-5">
              Save this
              inventory
              category to
              your system
            </p>

            <Button
              type="submit"
              disabled={
                isSubmitting
              }
              className="btn-save-4 w-full"
            >
              {isSubmitting
                ? "Saving Category..."
                : "Save Category"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default Page;