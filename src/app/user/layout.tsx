import Link from "next/link";
import {
  UserRound,
  ShoppingBag,
  MapPin,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";

const navigation = [
  {
    label: "Overview",
    href: "/user",
    icon: LayoutDashboard,
  },
  {
    label: "My Orders",
    href: "/user/orders",
    icon: ShoppingBag,
  },
  {
    label: "My Addresses",
    href: "/user/addresses",
    icon: MapPin,
  },
  {
    label: "My Profile",
    href: "/user/profile",
    icon: UserRound,
  },
];

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Shared customer account header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/user"
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
              <UserRound size={23} />
            </div>

            <div className="min-w-0">
              <p className="text-lg font-bold tracking-tight text-gray-900">
                My Account
              </p>
              <p className="hidden text-xs text-gray-500 sm:block">
                Your personal ordering space
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 sm:px-4"
          >
            <span>Continue shopping</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Shared account navigation */}
      <div className="border-b border-gray-200 bg-white">
        <nav
          aria-label="Customer account navigation"
          className="mx-auto flex w-full max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8"
        >
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium text-gray-600 transition hover:border-orange-100 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 sm:px-4"
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Every customer page renders inside the same account shell */}
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {children}
      </div>
    </div>
  );
}