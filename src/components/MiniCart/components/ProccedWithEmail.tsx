"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  customerLookupZ,
  TCustomerLookup,
} from "@/lib/types/addressType";
import { IoClose } from "react-icons/io5";
import {
  FiUser,
  FiArrowRight,
  FiShield,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { UseSiteContext } from "@/SiteContext/SiteContext";

const ProccedWithEmail = () => {
  const {
    emailFormToggle,
    setCustomerEmailG,
    setCustomerAddressIsComplete,
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

  /*
   * ---------------------------------------------------------
   * Detect email
   * ---------------------------------------------------------
   */
  function isEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value.trim()
    );
  }

  /*
   * ---------------------------------------------------------
   * Normalize Indian mobile number
   * ---------------------------------------------------------
   *
   * Examples:
   *
   * 9876543210
   * +919876543210
   * +91 9876543210
   * +91-9876543210
   *
   * all become:
   *
   * 9876543210
   * ---------------------------------------------------------
   */
  function normalizeMobile(value: string): string {
    return value
      .replace(/\D/g, "")
      .replace(/^0+/, "")
      .replace(/^91/, "");
  }

  /*
   * ---------------------------------------------------------
   * Normalize identifier before storing it in context
   * ---------------------------------------------------------
   *
   * Email:
   *     Customer@Gmail.com
   *
   * becomes:
   *     Customer@Gmail.com
   *
   * Phone:
   *     +91 98765 43210
   *
   * becomes:
   *     9876543210
   * ---------------------------------------------------------
   */
  function normalizeIdentifier(value: string): string {
    const trimmed = value.trim();

    if (isEmail(trimmed)) {
      return trimmed;
    }

    return normalizeMobile(trimmed);
  }

  /*
   * ---------------------------------------------------------
   * Submit
   * ---------------------------------------------------------
   */
  async function onSubmit(data: TCustomerLookup) {
    const identifier = normalizeIdentifier(
      data.identifier
    );

    if (!identifier) {
      return;
    }

    /*
     * customerEmailG is currently used as the shared
     * customer identifier.
     *
     * It can contain:
     *
     *     email
     *
     * OR
     *
     *     mobile number
     *
     * The checkout Address component will determine
     * which database lookup should be performed.
     */
    setCustomerAddressIsComplete(false);

    console.log("customer email set-----------------", identifier)

    setCustomerEmailG(identifier);

    /*
     * Close identifier modal.
     */
    emailFormToggle(false);

    /*
     * Continue to checkout.
     */
    router.push("/checkout");
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-[#2B211B]/25
        px-4
        py-6
        backdrop-blur-md
      "
    >
      <div
        className="
          relative
          w-full
          max-w-md
          overflow-hidden
          rounded-[28px]
          border
          border-[#F0E1D3]
          bg-[#FFF8F0]
          shadow-[0_25px_80px_rgba(43,33,27,0.18)]
        "
      >
        {/* =====================================================
            Decorative glow
        ===================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            -right-20
            -top-20
            h-40
            w-40
            rounded-full
            bg-[#F59E45]/10
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-24
            -left-20
            h-40
            w-40
            rounded-full
            bg-[#F59E45]/5
            blur-3xl
          "
        />

        {/* =====================================================
            Header
        ===================================================== */}

        <div
          className="
            relative
            flex
            items-start
            justify-between
            border-b
            border-[#F0E1D3]
            px-6
            pb-5
            pt-6
          "
        >
          <div className="flex items-start gap-3">
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-[#F59E45]
                text-[#2B211B]
                shadow-md
                shadow-orange-200/50
              "
            >
              <FiUser
                size={19}
                strokeWidth={2}
              />
            </div>

            <div>
              <h2
                className="
                  text-xl
                  font-black
                  tracking-tight
                  text-[#2B211B]
                "
              >
                Continue Checkout
              </h2>

              <p
                className="
                  mt-1
                  max-w-[250px]
                  text-sm
                  leading-5
                  text-[#8C7D73]
                "
              >
                Enter your email or mobile number to
                continue.
              </p>
            </div>
          </div>

          {/* Close button */}

          <button
            type="button"
            onClick={() => emailFormToggle(false)}
            aria-label="Close"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              border
              border-[#E9DCD0]
              bg-white
              text-[#76675D]
              transition-all
              duration-200
              hover:border-[#F59E45]/40
              hover:bg-[#FFF1E4]
              hover:text-[#E3532B]
            "
          >
            <IoClose size={19} />
          </button>
        </div>

        {/* =====================================================
            Form
        ===================================================== */}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="
            relative
            px-6
            pb-6
            pt-6
          "
        >
          {/* ===================================================
              Identifier
          =================================================== */}

          <div className="flex flex-col gap-2.5">
            <label
              htmlFor="identifier"
              className="
                text-sm
                font-bold
                text-[#2B211B]
              "
            >
              Email or Phone
            </label>

            <div className="relative">
              {/* Icon */}

              <div
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  flex
                  -translate-y-1/2
                  items-center
                  text-[#A38F82]
                "
              >
                <FiUser
                  size={18}
                  strokeWidth={1.8}
                />
              </div>

              <input
                id="identifier"
                type="text"
                inputMode="text"
                autoComplete="email"
                {...register("identifier")}
                placeholder="9876543210 or abc@gmail.com"
                autoFocus
                disabled={isSubmitting}
                className="
                  h-13
                  w-full
                  rounded-2xl
                  border
                  border-[#E7D9CC]
                  bg-white
                  pl-11
                  pr-4
                  text-sm
                  font-medium
                  text-[#2B211B]
                  outline-none
                  placeholder:text-[#B5A69C]
                  transition-all
                  duration-200
                  focus:border-[#F59E45]
                  focus:ring-4
                  focus:ring-[#F59E45]/10
                  disabled:cursor-not-allowed
                  disabled:bg-[#F8F2EC]
                "
              />
            </div>

            {/* Validation error */}

            {errors.identifier?.message && (
              <span
                className="
                  text-xs
                  font-medium
                  text-[#D94B32]
                "
              >
                {errors.identifier.message}
              </span>
            )}
          </div>

          {/* ===================================================
              Continue button
          =================================================== */}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="
              group
              mt-6
              h-13
              w-full
              rounded-2xl
              bg-[#F59E45]
              px-5
              text-sm
              font-black
              text-[#2B211B]
              shadow-lg
              shadow-orange-200/50
              transition-all
              duration-200
              hover:-translate-y-0.5
              hover:bg-[#FFB35F]
              hover:shadow-xl
              hover:shadow-orange-200/60
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <span>
              {isSubmitting
                ? "Continuing..."
                : "Continue"}
            </span>

            {!isSubmitting && (
              <span
                className="
                  ml-2
                  flex
                  h-7
                  w-7
                  items-center
                  justify-center
                  rounded-full
                  bg-[#2B211B]/10
                  transition-transform
                  duration-200
                  group-hover:translate-x-1
                "
              >
                <FiArrowRight size={15} />
              </span>
            )}
          </Button>

          {/* ===================================================
              Privacy / autofill information
          =================================================== */}

          <div
            className="
              mt-5
              flex
              items-start
              gap-3
              rounded-2xl
              border
              border-[#F0E1D3]
              bg-[#FFF2E6]
              px-4
              py-3.5
            "
          >
            <div
              className="
                mt-0.5
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#F59E45]/15
                text-[#C76A20]
              "
            >
              <FiShield
                size={14}
                strokeWidth={2}
              />
            </div>

            <p
              className="
                text-xs
                leading-5
                text-[#806F64]
              "
            >
              Returning customers can have their saved
              address and contact details filled
              automatically.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProccedWithEmail;
 
