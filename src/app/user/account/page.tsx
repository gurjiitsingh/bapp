
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  UserRound,
  MapPin,
  ShoppingBag,
  ChevronRight,
  Mail,
  ShieldCheck,
} from "lucide-react";

export default async function CustomerAccountPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== "user") {
    redirect("/");
  }

  const name = session.user.name?.trim() || "Customer";
  const email = session.user.email || "No email available";

  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const accountLinks = [
    {
      title: "My Orders",
      description: "View your orders and their status",
      href: "/user/orders",
      icon: ShoppingBag,
    },
    {
      title: "Delivery Addresses",
      description: "Manage your saved delivery addresses",
      href: "/user/addresses",
      icon: MapPin,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-medium text-orange-600">
          CUSTOMER ACCOUNT
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
          My Account
        </h1>

        <p className="mt-2 text-gray-600">
          Manage your profile, orders, and delivery addresses.
        </p>
      </div>

      {/* Customer profile */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xl font-bold text-orange-700">
            {initials || "U"}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-semibold text-gray-900">
              {name}
            </h2>

            <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
              <Mail size={16} className="shrink-0" />
              <span className="break-all">{email}</span>
            </div>
          </div>

          <div className="hidden items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700 sm:flex">
            <ShieldCheck size={16} />
            Customer
          </div>
        </div>
      </section>

      {/* Account navigation */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Account Management
        </h2>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          {accountLinks.map((item, index) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 p-5 transition hover:bg-orange-50 ${
                  index > 0 ? "border-t border-gray-200" : ""
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                  <Icon size={21} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm text-gray-600">
                    {item.description}
                  </p>
                </div>

                <ChevronRight
                  size={20}
                  className="shrink-0 text-gray-400"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Profile information */}
      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <UserRound
            size={22}
            className="mt-1 shrink-0 text-gray-500"
          />

          <div>
            <h2 className="font-semibold text-gray-900">
              Personal Information
            </h2>

            <p className="mt-1 text-sm leading-6 text-gray-600">
              Your account details are shown above. You can manage your
              delivery addresses from the address section.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-8">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}
