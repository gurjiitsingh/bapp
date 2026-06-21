"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoClose } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { UseSiteContext } from "@/SiteContext/SiteContext";

import {
  customerLookupZ,
  TCustomerLookup,
} from "@/lib/types/addressType";

import { findCustomer } from "@/app/(universal)/action/user/findCustomer";

const ProccedWithEmail = () => {
  const {
    emailFormToggle,
    setCustomerEmailG,
    setCustomerAddressIsComplete,
    setCustomerData,
  } = UseSiteContext();

  const router = useRouter();

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<TCustomerLookup>({
    resolver: zodResolver(customerLookupZ),
    defaultValues: {
      identifier: "",
    },
  });

  async function onSubmit(
    data: TCustomerLookup
  ) {
    try {
      const identifier =
        data.identifier.trim();

      // Save locally for future visits
      localStorage.setItem(
        "customerIdentifier",
        identifier
      );

      // Lookup customer
      const customer =
        await findCustomer(identifier);

      if (customer) {
        console.log(
          "✅ Customer found",
          customer
        );

       

        setCustomerData(customer);

        setCustomerAddressIsComplete(
          true
        );
      } else {
        console.log(
          "⚠️ New customer"
        );

        setCustomerAddressIsComplete(
          false
        );
      }

      // Keep compatibility with existing flow
      if (identifier.includes("@")) {
        setCustomerEmailG(identifier);
      } else {
        // Until you add setCustomerPhoneG
        setCustomerEmailG(identifier);
      }

      emailFormToggle(false);

      router.push("/checkout");
    } catch (error) {
      console.error(
        "Customer lookup error:",
        error
      );

      emailFormToggle(false);

      router.push("/checkout");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg bg-black/20 p-4">
      <div
        className="
          w-full
          max-w-md
          rounded-3xl
          bg-white
          shadow-2xl
          border
          border-neutral-200
          overflow-hidden
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <div>
            <h2 className="text-xl font-semibold">
              Continue Checkout
            </h2>

            <p className="text-sm text-neutral-500">
              Enter your email or mobile
              number
            </p>
          </div>

          <button
            onClick={() =>
              emailFormToggle(false)
            }
            className="
              p-2
              rounded-xl
              hover:bg-neutral-100
              transition
            "
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-5"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              Email or Phone
            </label>

            <input
              {...register("identifier")}
              placeholder="9876543210 or abc@gmail.com"
              autoFocus
              className="
                h-12
                px-4
                rounded-xl
                border
                border-neutral-300
                focus:outline-none
                focus:ring-2
                focus:ring-[#00897b]
              "
            />

            {errors.identifier?.message && (
              <span className="text-sm text-red-500">
                {errors.identifier.message}
              </span>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="
              mt-5
              w-full
              h-12
              rounded-xl
              bg-[#00897b]
              hover:bg-[#00796b]
              text-white
              font-semibold
            "
          >
            {isSubmitting
              ? "Looking up customer..."
              : "Continue"}
          </Button>

          <p className="text-xs text-center text-neutral-500 mt-4">
            Returning customers will have
            their address and contact
            details filled automatically.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ProccedWithEmail;