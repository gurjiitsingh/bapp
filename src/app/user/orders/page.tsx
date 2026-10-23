
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getCustomerOrders } from "@/modules/customer-account/orders/actions";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    date?: string;
  }>;
};

export default async function MyOrdersPage({
  searchParams,
}: PageProps) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "user") {
    redirect("/login");
  }

  const params = await searchParams;
  const selectedDate = params.date || "";

  const result = await getCustomerOrders(
    session.user.id,
    selectedDate || undefined
  );

  if (!result.success) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 p-5">
        <h2 className="font-semibold text-red-800">
          Unable to load your orders
        </h2>
        <p className="mt-1 text-sm text-red-700">
          {result.error}
        </p>
      </section>
    );
  }

  const { orders } = {
    orders: result.data,
  };

  const activeDate = result.date;

  return (
    <section className="space-y-5">
      {/* Page heading */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          My Orders
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          View your orders, payment information, and order status.
        </p>
      </div>

      {/* Date filter */}
      <form
        action="/user/orders"
        method="GET"
        className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="space-y-1">
          <label
            htmlFor="order-date"
            className="block text-sm font-medium text-gray-700"
          >
            Filter orders by date
          </label>

          <input
            id="order-date"
            name="date"
            type="date"
            defaultValue={
              activeDate === "all"
                ? ""
                : activeDate
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm sm:w-auto"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Apply date
          </button>

          <Link
            href="/user/orders"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Today
          </Link>

          <Link
            href="/user/orders?date=all"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            All orders
          </Link>
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-gray-900">
          {activeDate === "all"
            ? "All orders"
            : `Orders for ${formatSelectedDate(activeDate)}`}
        </h3>

        <p className="text-sm text-gray-500">
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </p>
      </div>

      {/* Empty state */}
      {orders.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-900">
            No orders found
          </h3>

          <p className="mt-2 text-sm text-gray-600">
            There are no orders for the selected date.
          </p>

          <Link
            href="/"
            className="mt-5 inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700"
          >
            Start ordering
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500">
                    Order number
                  </p>

                  <h3 className="mt-1 font-semibold text-gray-900">
                    {order.srno}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {formatOrderDate(order.createdAt)}
                  </p>
                </div>

                <StatusBadge status={order.orderStatus} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-500">
                    Order total
                  </p>

                  <p className="mt-1 font-bold text-gray-900">
                    {formatCurrency(order.grandTotal)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Order type
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {formatStatus(order.orderType)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Payment
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {formatStatus(order.paymentStatus)}
                  </p>

                  <p className="text-xs text-gray-500">
                    {formatStatus(order.paymentMode)}
                  </p>
                </div>
              </div>

              {order.customerName && (
                <p className="mt-3 text-sm text-gray-500">
                  Ordered by {order.customerName}
                </p>
              )}

              {/* A separate order details page can be added later. */}
              <div className="mt-4 border-t border-gray-100 pt-3">
                <p className="text-xs text-gray-500">
                  Order reference: {order.id}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();

  const colorClass =
    normalized === "COMPLETED" || normalized === "READY"
      ? "bg-green-50 text-green-700"
      : normalized === "CANCELLED"
        ? "bg-red-50 text-red-700"
        : normalized === "PREPARING" || normalized === "ACCEPTED"
          ? "bg-amber-50 text-amber-700"
          : "bg-blue-50 text-blue-700";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${colorClass}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function formatOrderDate(value: string | null): string {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function formatSelectedDate(value: string): string {
  if (value === "all") return "All dates";

  const date = new Date(`${value}T00:00:00+05:30`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "long",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(Number.isFinite(value) ? value : 0);
}

function formatStatus(value: string): string {
  if (!value) return "Unavailable";

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
