
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

const AUTH_MESSAGES = {
  validation: {
    nameRequired: "Please enter your full name.",
    nameMin: "Name must contain at least 2 characters.",
    nameMax: "Name cannot exceed 120 characters.",

    emailRequired: "Please enter your email address.",
    emailInvalid: "Please enter a valid email address.",
    emailMax: "Email cannot exceed 254 characters.",

    mobileRequired: "Please enter your mobile number.",
    mobileInvalid: "Please enter a valid mobile number.",

    identifierRequired: "Please enter your email or mobile number.",
    identifierInvalid: "Please enter a valid email or mobile number.",

    passwordRequired: "Please enter your password.",
    passwordMin: "Password must contain at least 8 characters.",
    passwordMax: "Password cannot exceed 128 characters.",

    confirmPasswordRequired: "Please confirm your password.",
    passwordMismatch: "Passwords do not match.",

    loginFailed: "Login failed. Check your email/mobile number and password.",
    genericError: "Something went wrong. Please try again.",
  },

  status: {
    accountCreated: "Your account was created. Please switch to Login and sign in.",
  },
};


const PHONE_CONFIG = {
  nationalLength: 10,
  pattern: /^[6-9]\d{9}$/,
};

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
    return value.replace(/\D/g, "");
  }

  function isValidMobile(value: string) {
    return (
      value.length === PHONE_CONFIG.nationalLength &&
      PHONE_CONFIG.pattern.test(value)
    );
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

  // async function continueToCheckout(identifier: string) {
  //   // Prevent checkout when the cart is empty.
  //   // if (!cartItems || cartItems.length === 0) {
  //   //   setError("Your cart is empty. Please add items before checkout.");
  //   //   return;
  //   // }

  //   setCustomerEmailG(identifier);
  //   setCustomerAddressIsComplete(false);
  //   emailFormToggle(false);
  //   router.push("/checkout");
  // }


  async function continueToCheckout(identifier: string) {
    // const result = await getLoggedInCustomer();

    // if (!result.success || !result.customer) {
    //   setError(result.message || "Unable to load customer information.");
    //   return;
    // }

    setCustomerEmailG(identifier);
    //setCustomerData(result.customer);

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

      if (!rawIdentifier) {
        setError(AUTH_MESSAGES.validation.identifierRequired);
        return;
      }

      if (!password) {
        setError(AUTH_MESSAGES.validation.passwordRequired);
        return;
      }

      const result = await signIn("credentials", {
        email: identifier,
        password,
        redirect: false,
      });

      if (!result || result.error || result.ok !== true) {
        setError(AUTH_MESSAGES.validation.loginFailed);
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

    // Full name validation
    if (!fullName) {
      setError(AUTH_MESSAGES.validation.nameRequired);
      return;
    }

    if (fullName.length < 2) {
      setError(AUTH_MESSAGES.validation.nameMin);
      return;
    }

    if (fullName.length > 120) {
      setError(AUTH_MESSAGES.validation.nameMax);
      return;
    }

    // Email validation
    if (!email) {
      setError(AUTH_MESSAGES.validation.emailRequired);
      return;
    }

    if (!isEmail(email)) {
      setError(AUTH_MESSAGES.validation.emailInvalid);
      return;
    }

    if (email.length > 254) {
      setError(AUTH_MESSAGES.validation.emailMax);
      return;
    }

    // Mobile validation
    if (!mobile) {
      setError(AUTH_MESSAGES.validation.mobileRequired);
      return;
    }

    if (!isValidMobile(mobile)) {
      setError(AUTH_MESSAGES.validation.mobileInvalid);
      return;
    }

    // Password validation
    if (!password) {
      setError(AUTH_MESSAGES.validation.passwordRequired);
      return;
    }

    if (password.length < 8) {
      setError(AUTH_MESSAGES.validation.passwordMin);
      return;
    }

    if (password.length > 128) {
      setError(AUTH_MESSAGES.validation.passwordMax);
      return;
    }

    // Confirm password validation
    if (!confirmPassword) {
      setError(AUTH_MESSAGES.validation.confirmPasswordRequired);
      return;
    }

    if (password !== confirmPassword) {
      setError(AUTH_MESSAGES.validation.passwordMismatch);
      return;
    }

    // =====================================================
    // CREATE CUSTOMER
    // =====================================================
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

    // =====================================================
    // LOGIN AFTER REGISTRATION
    // =====================================================
    const loginResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!loginResult || loginResult.error || loginResult.ok !== true) {
      setMessage(AUTH_MESSAGES.status.accountCreated);
      setMode("login");
      return;
    }

    await continueToCheckout(email);

  } catch (err) {
    console.error("Customer login/register error:", err);

    setError(AUTH_MESSAGES.validation.genericError);

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
        noValidate
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
            {/* Full Name */}
            <div className="mb-4 flex flex-col gap-2">
              <label
                htmlFor="fullName"
                className="text-sm font-bold text-[#2B211B]"
              >
                Full Name
              </label>

              <div className="relative">
                <FiUser
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A38F82]"
                  size={18}
                />

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  maxLength={120}
                  disabled={isSubmitting}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-4 flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-bold text-[#2B211B]"
              >
                Email Address
              </label>

              <div className="relative">
                <FiMail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A38F82]"
                  size={18}
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  maxLength={254}
                  disabled={isSubmitting}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Mobile */}
            <div className="mb-4 flex flex-col gap-2">
              <label
                htmlFor="mobile"
                className="text-sm font-bold text-[#2B211B]"
              >
                Mobile Number
              </label>

              <div className="relative">
                <FiPhone
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A38F82]"
                  size={18}
                />

                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  autoComplete="tel"
                  placeholder="9876543210"
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
            <label
              htmlFor="identifier"
              className="text-sm font-bold text-[#2B211B]"
            >
              Email or Phone
            </label>

            <div className="relative">
              <FiMail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A38F82]"
                size={18}
              />

              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                placeholder="Email or mobile number"
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* Password */}
        <div className="mb-4 flex flex-col gap-2">
          <label
            htmlFor="password"
            className="text-sm font-bold text-[#2B211B]"
          >
            Password
          </label>

          <div className="relative">
            <FiLock
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A38F82]"
              size={18}
            />

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
              <FiLock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A38F82]"
                size={18}
              />

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Confirm your password"
                maxLength={128}
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* Submit */}
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

        {/* Information */}
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

        {/* Switch mode */}
        <p className="mt-4 text-center text-xs text-[#8C7D73]">
          {mode === "login" ? "New customer? " : "Already registered? "}

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
