
"use client";

import { useState, useTransition, type FormEvent } from "react";
import { registerCustomer } from "../(universal)/action/customer/customer-register";
 

export default function CustomerRegisterPage() {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (formData.get("password") !== formData.get("confirmPassword")) {
      setError("Passwords do not match.");
      return;
    }

    startTransition(async () => {
      const result = await registerCustomer(formData);

      if (!result.success) {
        setError(result.message);
        return;
      }

      setMessage(result.message);
      form.reset();
    });
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Create your account
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Register to manage your delivery addresses and orders.
        </p>

        {error && (
          <p role="alert" className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p role="status" className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium">
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              autoComplete="name"
              required
              maxLength={120}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
            />
          </div>

          <div>
            <label htmlFor="mobile" className="mb-1 block text-sm font-medium">
              Mobile number
            </label>
            <input
              id="mobile"
              name="mobile"
              type="tel"
              autoComplete="tel"
              required
              maxLength={30}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isPending ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    </main>
  );
}
