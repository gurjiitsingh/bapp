
import { getFinishedProductsProfitLoss } from "@/app/(universal)/action/distribution/sale/bulkSale/profitLoss";

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

export default async function FinishedProductsProfitLossPage() {
  const result = await getFinishedProductsProfitLoss();

  const summary = result.summary;

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

      {!result.success && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Unable to load profit and loss report.
        </div>
      )}

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
