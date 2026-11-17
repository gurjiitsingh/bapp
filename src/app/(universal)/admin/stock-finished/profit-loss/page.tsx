
import { getFinishedProductsProfitLoss } from "@/app/(universal)/action/stock-finished/sale/profitLoss";

type SearchParams = {
  period?: string;
  startDate?: string;
  endDate?: string;
};

type PeriodRow = {
  period: string;
  periodLabel: string;
  totalQuantity: number;
  totalSales: number;
  totalCost: number;
  totalProfit: number;
  saleLines: number;
  totalSalesCount: number;
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(value);

function getTodayIST() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((p) => p.type === "year")?.value || "";
  const month = parts.find((p) => p.type === "month")?.value || "";
  const day = parts.find((p) => p.type === "day")?.value || "";

  return `${year}-${month}-${day}`;
}

function addDays(dateString: string, days: number) {
  const date = new Date(`${dateString}T00:00:00Z`);

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

function getMonthStart(dateString: string) {
  return `${dateString.slice(0, 7)}-01`;
}

function getDateRange(
  period: string,
  customStart?: string,
  customEnd?: string
) {
  const today = getTodayIST();

  const currentMonthStart = getMonthStart(today);

  switch (period) {
    case "today":
      return {
        startDate: today,
        endDate: today,
      };

    case "yesterday": {
      const yesterday = addDays(today, -1);

      return {
        startDate: yesterday,
        endDate: yesterday,
      };
    }

    case "week": {
      const weekday = new Date(
        `${today}T00:00:00Z`
      ).getUTCDay();

      // Monday is the first day of the week.
      const daysFromMonday = (weekday + 6) % 7;

      return {
        startDate: addDays(today, -daysFromMonday),
        endDate: today,
      };
    }

    case "month":
      return {
        startDate: currentMonthStart,
        endDate: today,
      };

    case "lastMonth": {
      const previousMonthLastDay = addDays(
        currentMonthStart,
        -1
      );

      return {
        startDate: getMonthStart(previousMonthLastDay),
        endDate: previousMonthLastDay,
      };
    }

    case "year":
      return {
        startDate: `${today.slice(0, 4)}-01-01`,
        endDate: today,
      };

    case "custom":
      if (
        customStart &&
        customEnd &&
        /^\d{4}-\d{2}-\d{2}$/.test(customStart) &&
        /^\d{4}-\d{2}-\d{2}$/.test(customEnd) &&
        customStart <= customEnd
      ) {
        return {
          startDate: customStart,
          endDate: customEnd,
        };
      }

      return {
        startDate: currentMonthStart,
        endDate: today,
      };

    case "all":
      return {};

    default:
      return {
        startDate: currentMonthStart,
        endDate: today,
      };
  }
}

function SummaryCard({
  title,
  value,
  valueClass = "text-gray-900",
}: {
  title: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">
        {title}
      </p>

      <p className={`mt-2 text-xl font-bold ${valueClass}`}>
        {value}
      </p>
    </div>
  );
}

function PeriodTable({
  title,
  description,
  rows,
  periodTitle,
}: {
  title: string;
  description: string;
  rows: PeriodRow[];
  periodTitle: string;
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">{title}</h2>

        <p className="text-sm text-gray-500">
          {description}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">{periodTitle}</th>
              <th className="p-3 text-right">Sales</th>
              <th className="p-3 text-right">Sale Lines</th>
              <th className="p-3 text-right">Quantity</th>
              <th className="p-3 text-right">Total Sales</th>
              <th className="p-3 text-right">Total Cost</th>
              <th className="p-3 text-right">Profit / Loss</th>
              <th className="p-3 text-right">Margin</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {rows.map((row) => {
              const margin =
                row.totalSales > 0
                  ? (row.totalProfit / row.totalSales) * 100
                  : 0;

              return (
                <tr key={row.period}>
                  <td className="p-3 font-medium">
                    {row.periodLabel}
                  </td>

                  <td className="p-3 text-right">
                    {formatNumber(row.totalSalesCount)}
                  </td>

                  <td className="p-3 text-right">
                    {formatNumber(row.saleLines)}
                  </td>

                  <td className="p-3 text-right">
                    {formatNumber(row.totalQuantity)}
                  </td>

                  <td className="p-3 text-right">
                    {formatPrice(row.totalSales)}
                  </td>

                  <td className="p-3 text-right">
                    {formatPrice(row.totalCost)}
                  </td>

                  <td
                    className={`p-3 text-right font-semibold ${
                      row.totalProfit >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatPrice(row.totalProfit)}
                  </td>

                  <td className="p-3 text-right">
                    {margin.toFixed(2)}%
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="p-8 text-center text-gray-500"
                >
                  No sales records found for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function FinishedProductsProfitLossPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const allowedPeriods = [
    "today",
    "yesterday",
    "week",
    "month",
    "lastMonth",
    "year",
    "custom",
    "all",
  ];

  const period = allowedPeriods.includes(params.period || "")
    ? params.period!
    : "month";

  const range = getDateRange(
    period,
    params.startDate,
    params.endDate
  );

  const result = await getFinishedProductsProfitLoss(range);

  const summary = result.summary;

  const rangeLabel =
    period === "all"
      ? "All Time"
      : period === "custom"
        ? `${range.startDate} to ${range.endDate}`
        : {
            today: "Today",
            yesterday: "Yesterday",
            week: "This Week",
            month: "This Month",
            lastMonth: "Previous Month",
            year: "This Year",
          }[period] || "This Month";

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold">
          Finished Products Profit & Loss
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Sales, product costs and gross profit overview.
        </p>
      </div>

      {/* DATE FILTER */}
      <section className="rounded-xl border bg-white p-4 shadow-sm">
        <form
          method="GET"
          action="/admin/stock-finished/profit-loss"
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="w-full md:max-w-xs">
              <label
                htmlFor="period"
                className="mb-1 block text-sm font-medium"
              >
                Report Period
              </label>

              <select
                id="period"
                name="period"
                defaultValue={period}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="lastMonth">Previous Month</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Date Range</option>
                <option value="all">All Time</option>
              </select>
            </div>

            <div className="w-full md:max-w-xs">
              <label
                htmlFor="startDate"
                className="mb-1 block text-sm font-medium"
              >
                From Date
              </label>

              <input
                id="startDate"
                type="date"
                name="startDate"
                defaultValue={range.startDate || ""}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <div className="w-full md:max-w-xs">
              <label
                htmlFor="endDate"
                className="mb-1 block text-sm font-medium"
              >
                To Date
              </label>

              <input
                id="endDate"
                type="date"
                name="endDate"
                defaultValue={range.endDate || ""}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Apply Filter
            </button>

            <a
              href="/admin/stock-finished/profit-loss"
              className="rounded-lg border px-5 py-2 text-center text-sm font-medium hover:bg-gray-50"
            >
              Reset
            </a>
          </div>

          <p className="text-xs text-gray-500">
            Select a period or choose a custom date range.
            Custom dates are inclusive.
          </p>
        </form>
      </section>

      {!result.success && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {result.error || "Unable to load profit and loss report."}
        </div>
      )}

      {/* SELECTED PERIOD */}
      <div className="text-sm font-semibold text-gray-600">
        Report: {rangeLabel}
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          title="Total Sales"
          value={formatPrice(summary.totalSales)}
        />

        <SummaryCard
          title="Total Cost"
          value={formatPrice(summary.totalCost)}
        />

        <SummaryCard
          title="Gross Profit / Loss"
          value={formatPrice(summary.totalProfit)}
          valueClass={
            summary.totalProfit >= 0
              ? "text-green-600"
              : "text-red-600"
          }
        />

        <SummaryCard
          title="Profit Margin"
          value={`${summary.profitMargin.toFixed(2)}%`}
          valueClass={
            summary.profitMargin >= 0
              ? "text-green-600"
              : "text-red-600"
          }
        />
      </div>

      {/* SALE COUNTS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Sales
          </p>

          <p className="mt-1 text-2xl font-bold">
            {formatNumber(summary.totalSalesCount)}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            Product Sale Lines
          </p>

          <p className="mt-1 text-2xl font-bold">
            {formatNumber(summary.totalSaleLines)}
          </p>
        </div>
      </div>

      {/* DAILY PROFIT & LOSS */}
      <PeriodTable
        title="Daily Profit & Loss"
        description="Profitability grouped by individual sale date."
        rows={result.daily}
        periodTitle="Date"
      />

      {/* MONTHLY PROFIT & LOSS */}
      <PeriodTable
        title="Monthly Profit & Loss"
        description="Compare sales, costs and profitability month by month."
        rows={result.monthly}
        periodTitle="Month"
      />

      {/* SOURCE-WISE REPORT */}
      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">
            Source-wise Profit & Loss
          </h2>

          <p className="text-sm text-gray-500">
            Compare profitability by factory, store and vehicle.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Source</th>
                <th className="p-3 text-right">Quantity</th>
                <th className="p-3 text-right">Sales</th>
                <th className="p-3 text-right">Cost</th>
                <th className="p-3 text-right">Profit / Loss</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {result.sources.map((source) => (
                <tr key={source.saleSource}>
                  <td className="p-3">
                    <div className="font-medium">
                      {source.saleSourceName}
                    </div>

                    <div className="text-xs text-gray-500">
                      {source.saleSource}
                    </div>
                  </td>

                  <td className="p-3 text-right">
                    {formatNumber(source.totalQuantity)}
                  </td>

                  <td className="p-3 text-right">
                    {formatPrice(source.totalSales)}
                  </td>

                  <td className="p-3 text-right">
                    {formatPrice(source.totalCost)}
                  </td>

                  <td
                    className={`p-3 text-right font-semibold ${
                      source.totalProfit >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatPrice(source.totalProfit)}
                  </td>
                </tr>
              ))}

              {result.sources.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-gray-500"
                  >
                    No sales records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* PRODUCT-WISE REPORT */}
      <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">
            Product-wise Profit & Loss
          </h2>

          <p className="text-sm text-gray-500">
            Products sorted by highest profit.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3 text-right">Sale Lines</th>
                <th className="p-3 text-right">Quantity</th>
                <th className="p-3 text-right">Sales</th>
                <th className="p-3 text-right">Total Cost</th>
                <th className="p-3 text-right">Profit / Loss</th>
                <th className="p-3 text-right">Margin</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {result.products.map((product) => {
                const margin =
                  product.totalSales > 0
                    ? (product.totalProfit /
                        product.totalSales) *
                      100
                    : 0;

                return (
                  <tr key={product.productId}>
                    <td className="p-3 font-medium">
                      {product.productName}
                    </td>

                    <td className="p-3 text-right">
                      {formatNumber(product.saleLines)}
                    </td>

                    <td className="p-3 text-right">
                      {formatNumber(product.totalQuantity)}
                    </td>

                    <td className="p-3 text-right">
                      {formatPrice(product.totalSales)}
                    </td>

                    <td className="p-3 text-right">
                      {formatPrice(product.totalCost)}
                    </td>

                    <td
                      className={`p-3 text-right font-semibold ${
                        product.totalProfit >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatPrice(product.totalProfit)}
                    </td>

                    <td className="p-3 text-right">
                      {margin.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}

              {result.products.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-gray-500"
                  >
                    No product sales found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
