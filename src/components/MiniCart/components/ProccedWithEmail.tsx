
"use client";

import React, { useState, type FormEvent } from "react";
import { signIn } from "next-auth/react";
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
import { registerCustomer } from "@/app/(universal)/action/customer/customer-register";

type AuthMode = "login" | "register";

export default function ProccedWithEmail() {
  const {
    emailFormToggle,
    setCustomerEmailG,
    setCustomerAddressIsComplete,
  } = UseSiteContext();

  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function isEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  function normalizeMobile(value: string) {
    let digits = value.replace(/\D/g, "");

    if (digits.length === 12 && digits.startsWith("91")) {
      digits = digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith("0")) {
      digits = digits.slice(1);
    }

    return digits;
  }

  function normalizeIdentifier(value: string) {
    const trimmed = value.trim();

    return isEmail(trimmed)
      ? trimmed.toLowerCase()
      : normalizeMobile(trimmed);
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError("");
    setMessage("");
  }

  async function continueToCheckout(identifier: string) {
    setCustomerEmailG(identifier);
    setCustomerAddressIsComplete(false);
    emailFormToggle(false);
    router.push("/checkout");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      // =====================================================
      // LOGIN
      // =====================================================
      if (mode === "login") {
        const rawIdentifier = String(
          formData.get("identifier") ?? ""
        ).trim();

        const password = String(
          formData.get("password") ?? ""
        );

        const identifier = normalizeIdentifier(rawIdentifier);

        if (!identifier) {
          setError("Enter your email or mobile number.");
          return;
        }

        if (!password) {
          setError("Enter your password.");
          return;
        }

        const result = await signIn("credentials", {
          email: identifier,
          password,
          redirect: false,
        });

        if (!result || result.error || result.ok !== true) {
          setError(
            "Login failed. Check your email/mobile number and password."
          );
          return;
        }

        await continueToCheckout(identifier);
        return;
      }

      // =====================================================
      // REGISTER
      // =====================================================
      const fullName = String(
        formData.get("fullName") ?? ""
      ).trim();

      const email = String(
        formData.get("email") ?? ""
      ).trim().toLowerCase();

      const mobile = normalizeMobile(
        String(formData.get("mobile") ?? "")
      );

      const password = String(
        formData.get("password") ?? ""
      );

      const confirmPassword = String(
        formData.get("confirmPassword") ?? ""
      );

      if (!fullName || fullName.length < 2) {
        setError("Enter your full name.");
        return;
      }

      if (!isEmail(email)) {
        setError("Enter a valid email address.");
        return;
      }

      if (!/^\d{10}$/.test(mobile)) {
        setError("Enter a valid 10-digit Indian mobile number.");
        return;
      }

      if (password.length < 8 || password.length > 128) {
        setError("Password must contain 8 to 128 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      // Pass the fields expected by your existing server action.
      const registrationData = new FormData();

      registrationData.set("fullName", fullName);
      registrationData.set("email", email);
      registrationData.set("mobile", mobile);
      registrationData.set("password", password);
      registrationData.set("confirmPassword", confirmPassword);

      const registrationResult = await registerCustomer(
        registrationData
      );

      if (!registrationResult.success) {
        setError(registrationResult.message);
        return;
      }

      // Registration succeeded. Sign in with the new account.
      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!loginResult || loginResult.error || loginResult.ok !== true) {
        setMessage(
          "Your account was created. Please switch to Login and sign in."
        );

        setMode("login");
        return;
      }

      await continueToCheckout(email);
    } catch (err) {
      console.error("Customer login/register error:", err);

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "h-[50px] w-full rounded-2xl border border-[#E7D9CC] bg-white pl-11 pr-4 text-sm font-medium text-[#2B211B] outline-none placeholder:text-[#B5A69C] transition focus:border-[#F59E45] focus:ring-4 focus:ring-[#F59E45]/10 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#2B211B]/25 px-4 py-6 backdrop-blur-md">
      <div className="relative my-auto w-full max-w-md overflow-hidden rounded-[28px] border border-[#F0E1D3] bg-[#FFF8F0] shadow-[0_25px_80px_rgba(43,33,27,0.18)]">
        <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#F59E45]/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-20 h-40 w-40 rounded-full bg-[#F59E45]/5 blur-3xl" />

        {/* Header */}
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
                  : "Create your customer account to continue."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => emailFormToggle(false)}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E9DCD0] bg-white text-[#76675D] transition hover:border-[#F59E45]/40 hover:bg-[#FFF1E4] hover:text-[#E3532B]"
          >
            <IoClose size={19} />
          </button>
        </div>

        {/* Mode selector */}
        <div className="relative grid grid-cols-2 gap-2 px-6 pt-5">
          {(["login", "register"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => changeMode(item)}
              className={`h-11 rounded-xl text-sm font-bold capitalize transition ${
                mode === item
                  ? "bg-[#2B211B] text-white shadow-md"
                  : "border border-[#E7D9CC] bg-white text-[#806F64] hover:bg-[#FFF1E4]"
              }`}
            >
              {item === "login" ? "Login" : "Register"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="relative px-6 pb-6 pt-5"
        >
          {error && (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
            >
              {message}
            </p>
          )}

          {/* Registration-only fields */}
          {mode === "register" && (
            <>
              <div className="mb-4 flex flex-col gap-2">
                <label htmlFor="fullName" className="text-sm font-bold text-[#2B211B]">
                  Full Name
                </label>

                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A38F82]" size={18} />

                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    required
                    minLength={2}
                    maxLength={120}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mb-4 flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-bold text-[#2B211B]">
                  Email Address
                </label>

                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A38F82]" size={18} />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    maxLength={254}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="mb-4 flex flex-col gap-2">
                <label htmlFor="mobile" className="text-sm font-bold text-[#2B211B]">
                  Mobile Number
                </label>

                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A38F82]" size={18} />

                  <input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    autoComplete="tel"
                    placeholder="9876543210"
                    required
                    maxLength={30}
                    disabled={isSubmitting}
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          )}

          {/* Login-only identifier */}
          {mode === "login" && (
            <div className="mb-4 flex flex-col gap-2">
              <label htmlFor="identifier" className="text-sm font-bold text-[#2B211B]">
                Email or Phone
              </label>

              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A38F82]" size={18} />

                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  placeholder="Email or mobile number"
                  required
                  disabled={isSubmitting}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div className="mb-4 flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-bold text-[#2B211B]">
              Password
            </label>

            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A38F82]" size={18} />

              <input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                placeholder={
                  mode === "login"
                    ? "Enter your password"
                    : "Create a password"
                }
                required
                minLength={mode === "register" ? 8 : 1}
                maxLength={128}
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>
          </div>

          {/* Confirm password */}
          {mode === "register" && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-bold text-[#2B211B]"
              >
                Confirm Password
              </label>

              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A38F82]" size={18} />

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  required
                  minLength={8}
                  maxLength={128}
                  disabled={isSubmitting}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="group mt-6 flex h-[50px] w-full items-center justify-center rounded-2xl bg-[#F59E45] px-5 text-sm font-black text-[#2B211B] shadow-lg shadow-orange-200/50 transition hover:-translate-y-0.5 hover:bg-[#FFB35F] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>
              {isSubmitting
                ? "Please wait..."
                : mode === "login"
                  ? "Login & Continue"
                  : "Create Account & Continue"}
            </span>

            {!isSubmitting && (
              <span className="ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#2B211B]/10 transition-transform group-hover:translate-x-1">
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
                ? "Sign in to continue. Your delivery address will be collected at checkout."
                : "Your account will be created before continuing to checkout, where you can enter your delivery address."}
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-[#8C7D73]">
            {mode === "login" ? "New customer? " : "Already registered? "}

            <button
              type="button"
              onClick={() => changeMode(mode === "login" ? "register" : "login")}
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
