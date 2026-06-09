"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";


//import { addSupplier } from "@/app/(universal)/action/stock-finished/ItemSupplier/addSupplier";
import { TWholeCustomerSchema, WholeCustomerSchema } from "@/lib/types/WholeSaleCustomerType";
import { addWholeSaleCutomer } from "@/app/(universal)/action/stock-finished/customer/addWholeSaleCutomer";





// import { addSupplier } from "../addSupplier";

const NewWholeSaleCutomerForm = () => {
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } =
    useForm<TWholeCustomerSchema>({
      resolver:
        zodResolver(
          WholeCustomerSchema
        ),

      defaultValues: {
        companyName: "",
        contactPerson: "",

        phone: "",
        email: "",

        address: "",
        city: "",
        state: "",
        pincode: "",

        gstNumber: "",
        panNumber: "",
        fssaiLicenseNumber:
          "",

        type:
          "purchase",

        taxCollectedAtSource:
          false,

        notes: "",
        isActive: true,

      
      },
    });

  async function onSubmit(
    data: TWholeCustomerSchema
  ) {
    if (isSubmitting)
      return;

    setIsSubmitting(
      true
    );

    try {
      const formData =
        new FormData();

      Object.entries(
        data
      ).forEach(
        ([key, value]) => {
          formData.append(
            key,
            String(
              value ?? ""
            )
          );
        }
      );

      const result =
        await addWholeSaleCutomer(
          formData
        );

      console.log(
        data
      );

    //   alert(
    //     "Supplier saved successfully"
    //   );

      reset();
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Create Customer
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Add Customer for
          
          sales management
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* LEFT */}
        <div className="xl:col-span-2 flex flex-col gap-5">
          {/* Company Details */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Company
              Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-style-4">
                  Company Name
                  *
                </label>

                <input
                  {...register(
                    "companyName"
                  )}
                  placeholder="ABC Foods Pvt Ltd"
                  className="input-style-4 mt-1"
                />

                <p className="text-xs text-red-500 mt-1">
                  {
                    errors
                      .companyName
                      ?.message
                  }
                </p>
              </div>

              <div>
                <label className="label-style-4">
                  Contact
                  Person *
                </label>

                <input
                  {...register(
                    "contactPerson"
                  )}
                  placeholder="John Smith"
                  className="input-style-4 mt-1"
                />

                <p className="text-xs text-red-500 mt-1">
                  {
                    errors
                      .contactPerson
                      ?.message
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Contact
              Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-style-4">
                  Phone *
                </label>

                <input
                  {...register(
                    "phone"
                  )}
                  className="input-style-4 mt-1"
                />

                <p className="text-xs text-red-500 mt-1">
                  {
                    errors
                      .phone
                      ?.message
                  }
                </p>
              </div>

              <div>
                <label className="label-style-4">
                  Email
                </label>

                <input
                  {...register(
                    "email"
                  )}
                  className="input-style-4 mt-1"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Address
              Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="label-style-4">
                  Address
                </label>

                <textarea
                  {...register(
                    "address"
                  )}
                  rows={3}
                  className="input-style-4 mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  {...register(
                    "city"
                  )}
                  placeholder="City"
                  className="input-style-4"
                />

                <input
                  {...register(
                    "state"
                  )}
                  placeholder="State"
                  className="input-style-4"
                />

                <input
                  {...register(
                    "pincode"
                  )}
                  placeholder="Pincode"
                  className="input-style-4"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Notes
            </h2>

            <textarea
              {...register(
                "notes"
              )}
              rows={4}
              placeholder="Additional notes..."
              className="input-style-4"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-5">
          {/* Tax */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Tax &
              Licenses
            </h2>

            <div className="space-y-4">
              <input
                {...register(
                  "gstNumber"
                )}
                placeholder="GST Number"
                className="input-style-4"
              />

              {/* <input
                {...register(
                  "panNumber"
                )}
                placeholder="PAN Number"
                className="input-style-4"
              /> */}

              <input
                {...register(
                  "fssaiLicenseNumber"
                )}
                placeholder="FSSAI License Number"
                className="input-style-4"
              />
            </div>
          </div>

          {/* Business */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Business
              Settings
            </h2>

            <div className="space-y-4">
              <div>
                <label className="label-style-4">
                  Supplier
                  Type
                </label>

                <select
                  {...register(
                    "type"
                  )}
                  className="input-style-4 mt-1"
                >
                  <option value="purchase">
                    Purchase
                  </option>

                  <option value="sale">
                    Sale
                  </option>

                  <option value="both">
                    Both
                  </option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  {...register(
                    "taxCollectedAtSource"
                  )}
                />

                <label className="label-style-4">
                  Tax
                  Collected At
                  Source
                </label>
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
    Active Supplier
  </label>
</div>
          </div>

          {/* Save */}
          <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl shadow-sm p-5">
            <h3 className="text-lg font-semibold text-gray-800">
              Save
              Supplier
            </h3>

            <p className="text-sm text-gray-500 mt-1 mb-5">
              Save this
              supplier to
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
                ? "Saving Supplier..."
                : "Save Supplier"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default NewWholeSaleCutomerForm;