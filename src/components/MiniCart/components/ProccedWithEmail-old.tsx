"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IoClose } from "react-icons/io5";
import {
  FiUser,
  FiArrowRight,
  FiShield,
  FiMail,
  FiLock,
  FiPhone,
} from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { UseSiteContext } from "@/SiteContext/SiteContext";

type AuthFormValues = {
  name?: string;
  identifier: string;
  password: string;
};

type AuthMode = "login" | "register";

export default function ProccedWithEmail() {
  const {
    emailFormToggle,
    setCustomerEmailG,
    setCustomerAddressIsComplete,
  } = UseSiteContext();

  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormValues>({
    defaultValues: {
      name: "",
      identifier: "",
      password: "",
    },
  });

  function isEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function normalizeMobile(value: string) {
    return value.replace(/\D/g, "").replace(/^0+/, "").replace(/^91/, "");
  }

  function normalizeIdentifier(value: string) {
    const trimmed = value.trim();

    return isEmail(trimmed)
      ? trimmed
      : normalizeMobile(trimmed);
  }

  async function onSubmit(data: AuthFormValues) {
    const identifier = normalizeIdentifier(data.identifier);

    if (!identifier || !data.password.trim()) {
      return;
    }

    // Store the contact identifier for the checkout address flow.
    setCustomerEmailG(identifier);
    setCustomerAddressIsComplete(false);

    // This is a UI-only form for now.
    // Account creation and password authentication are not connected yet.
    emailFormToggle(false);
    router.push("/checkout");
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    reset();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2B211B]/25 px-4 py-6 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-[#F0E1D3] bg-[#FFF8F0] shadow-[0_25px_80px_rgba(43,33,27,0.18)]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#F59E45]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-40 w-40 rounded-full bg-[#F59E45]/5 blur-3xl" />

        <div className="relative flex items-start justify-between border-b border-[#F0E1D3] px-6 pb-5 pt-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F59E45] text-[#2B211B] shadow-md shadow-orange-200/50">
              <FiUser size={19} strokeWidth={2} />
            </div>

            <div>
              <h2 className="text-xl font-black tracking-tight text-[#2B211B]">
                {mode === "login" ? "Welcome Back" : "Create Account"}
              </h2>

              <p className="mt-1 max-w-[250px] text-sm leading-5 text-[#8C7D73]">
                {mode === "login"
                  ? "Login to continue with your order."
                  : "Register to make checkout easier next time."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => emailFormToggle(false)}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E9DCD0] bg-white text-[#76675D] transition-all duration-200 hover:border-[#F59E45]/40 hover:bg-[#FFF1E4] hover:text-[#E3532B]"
          >
            <IoClose size={19} />
          </button>
        </div>

        <div className="relative grid grid-cols-2 gap-2 px-6 pt-5">
          <button
            type="button"
            onClick={() => changeMode("login")}
            className={`h-11 rounded-xl text-sm font-bold transition ${
              mode === "login"
                ? "bg-[#2B211B] text-white shadow-md"
                : "border border-[#E7D9CC] bg-white text-[#806F64] hover:bg-[#FFF1E4]"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => changeMode("register")}
            className={`h-11 rounded-xl text-sm font-bold transition ${
              mode === "register"
                ? "bg-[#2B211B] text-white shadow-md"
                : "border border-[#E7D9CC] bg-white text-[#806F64] hover:bg-[#FFF1E4]"
            }`}
          >
            Register
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative px-6 pb-6 pt-5"
        >
          {mode === "register" && (
            <div className="mb-4 flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-bold text-[#2B211B]">
                Full Name
              </label>

              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A38F82]" size={18} />

                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  {...register("name", {
                    required: "Please enter your name.",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters.",
                    },
                  })}
                  disabled={isSubmitting}
                  className="h-13 w-full rounded-2xl border border-[#E7D9CC] bg-white pl-11 pr-4 text-sm font-medium text-[#2B211B] outline-none placeholder:text-[#B5A69C] focus:border-[#F59E45] focus:ring-4 focus:ring-[#F59E45]/10"
                />
              </div>

              {errors.name?.message && (
                <span className="text-xs font-medium text-[#D94B32]">
                  {errors.name.message}
                </span>
              )}
            </div>
          )}

          <div className="mb-4 flex flex-col gap-2">
            <label htmlFor="identifier" className="text-sm font-bold text-[#2B211B]">
              Email or Phone
            </label>

            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A38F82]" size={18} />

              <input
                id="identifier"
                type="text"
                inputMode="text"
                autoComplete="username"
                placeholder="Email address or mobile number"
                {...register("identifier", {
                  required: "Please enter your email or mobile number.",
                  validate: (value) => {
                    const trimmed = value.trim();

                    if (isEmail(trimmed)) return true;

                    const mobile = normalizeMobile(trimmed);

                    return (
                      /^\d{10}$/.test(mobile) ||
                      "Enter a valid email or 10-digit Indian mobile number."
                    );
                  },
                })}
                autoFocus
                disabled={isSubmitting}
                className="h-13 w-full rounded-2xl border border-[#E7D9CC] bg-white pl-11 pr-4 text-sm font-medium text-[#2B211B] outline-none placeholder:text-[#B5A69C] focus:border-[#F59E45] focus:ring-4 focus:ring-[#F59E45]/10"
              />
            </div>

            {errors.identifier?.message && (
              <span className="text-xs font-medium text-[#D94B32]">
                {errors.identifier.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-bold text-[#2B211B]">
              Password
            </label>

            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A38F82]" size={18} />

              <input
                id="password"
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder={mode === "login" ? "Enter your password" : "Create a password"}
                {...register("password", {
                  required: "Please enter your password.",
                  minLength: {
                    value: mode === "register" ? 8 : 1,
                    message: "Password must be at least 8 characters.",
                  },
                })}
                disabled={isSubmitting}
                className="h-13 w-full rounded-2xl border border-[#E7D9CC] bg-white pl-11 pr-4 text-sm font-medium text-[#2B211B] outline-none placeholder:text-[#B5A69C] focus:border-[#F59E45] focus:ring-4 focus:ring-[#F59E45]/10"
              />
            </div>

            {errors.password?.message && (
              <span className="text-xs font-medium text-[#D94B32]">
                {errors.password.message}
              </span>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="group mt-6 flex h-13 w-full items-center justify-center rounded-2xl bg-[#F59E45] px-5 text-sm font-black text-[#2B211B] shadow-lg shadow-orange-200/50 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFB35F] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>
              {isSubmitting
                ? "Please wait..."
                : mode === "login"
                  ? "Continue to Checkout"
                  : "Register & Continue"}
            </span>

            {!isSubmitting && (
              <span className="ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#2B211B]/10 transition-transform duration-200 group-hover:translate-x-1">
                <FiArrowRight size={15} />
              </span>
            )}
          </Button>

          <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#F0E1D3] bg-[#FFF2E6] px-4 py-3.5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F59E45]/15 text-[#C76A20]">
              <FiShield size={14} strokeWidth={2} />
            </div>

            <p className="text-xs leading-5 text-[#806F64]">
              {mode === "login"
                ? "Continue with your contact details. Your delivery address will be collected at checkout."
                : "Enter your details to continue. You can provide your delivery address at checkout."}
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-[#8C7D73]">
            {mode === "login"
              ? "New customer? "
              : "Already registered? "}

            <button
              type="button"
              onClick={() =>
                changeMode(mode === "login" ? "register" : "login")
              }
              className="font-bold text-[#B85D20] underline underline-offset-2 hover:text-[#E3532B]"
            >
              {mode === "login" ? "Create an account" : "Login"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}