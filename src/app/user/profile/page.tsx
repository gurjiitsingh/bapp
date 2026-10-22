
"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  Phone,
  Save,
  UserRound,
} from "lucide-react";

import {
  getCustomerProfile,
  updateCustomerProfile,
  type CustomerProfile,
} from "@/modules/customer-account/profile-actions";

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<CustomerProfile>({
    fullName: "",
    email: "",
    mobile: "",
  });

  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const result = await getCustomerProfile();

        if (cancelled) return;

        if (!result.success) {
          setError(result.error);
          return;
        }

        setProfile(result.data);
      } catch {
        if (!cancelled) {
          setError("Unable to load your profile. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    startTransition(async () => {
      try {
        const result = await updateCustomerProfile({
          fullName: profile.fullName,
          mobile: profile.mobile,
        });

        if (!result.success) {
          setError(result.error);
          return;
        }

        setProfile(result.data);
        setMessage("Your profile has been updated successfully.");
      } catch {
        setError("Unable to save your profile. Please try again.");
      }
    });
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          Loading your profile...
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/user/account"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-gray-900"
      >
        <ArrowLeft size={17} />
        Back to My Account
      </Link>

      <header className="mb-8">
        <p className="text-sm font-semibold text-orange-600">
          CUSTOMER ACCOUNT
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
          My Profile
        </h1>
        <p className="mt-2 text-gray-600">
          Update your personal information.
        </p>
      </header>

      {message && (
        <div
          role="status"
          className="mb-5 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
            <UserRound size={24} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Personal information
            </h2>
            <p className="text-sm text-gray-500">
              Keep your contact details up to date.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="fullName"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Full name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              value={profile.fullName}
              onChange={(event) => {
                setProfile((current) => ({
                  ...current,
                  fullName: event.target.value,
                }));
                setMessage("");
                setError("");
              }}
              placeholder="Enter your full name"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="relative">
              <Mail
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={profile.email}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-500 outline-none"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-500">
              Email changes are not available from this page.
            </p>
          </div>

          <div>
            <label
              htmlFor="mobile"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Mobile number
            </label>
            <div className="relative">
              <Phone
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                id="mobile"
                name="mobile"
                type="tel"
                autoComplete="tel"
                maxLength={25}
                value={profile.mobile}
                onChange={(event) => {
                  setProfile((current) => ({
                    ...current,
                    mobile: event.target.value,
                  }));
                  setMessage("");
                  setError("");
                }}
                placeholder="Enter your mobile number"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={17} />
              {isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
