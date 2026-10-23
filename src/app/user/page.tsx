import Link from "next/link";

export default function UserPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          My Account
        </h1>

        <p className="mt-2 text-gray-600">
          Welcome to your food ordering account.
          Manage your orders, addresses, and account details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/user/orders"
          className="rounded-xl border  border-slate-200 p-6 transition hover:shadow-md"
        >
          <h2 className="text-lg font-semibold">
            My Orders
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            View your orders and track their status.
          </p>
        </Link>

        <Link
          href="/user/addresses"
          className="rounded-xl border  border-slate-200 p-6 transition hover:shadow-md"
        >
          <h2 className="text-lg font-semibold">
            My Addresses
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Add, edit, and manage your delivery addresses.
          </p>
        </Link>

        <Link
          href="/user/profile"
          className="rounded-xl border  border-slate-200 p-6 transition hover:shadow-md"
        >
          <h2 className="text-lg font-semibold">
            My Profile
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            Update your name and mobile number.
          </p>
        </Link>

        <Link
          href="/user/account"
          className="rounded-xl border  border-slate-200 p-6 transition hover:shadow-md"
        >
          <h2 className="text-lg font-semibold">
            Account Details
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            View your customer account information.
          </p>
        </Link>
      </div>
    </main>
  );
}