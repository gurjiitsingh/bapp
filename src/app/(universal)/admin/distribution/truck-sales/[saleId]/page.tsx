import { getTruckSaleDetail } from "@/app/(universal)/action/distribution/sale/reports/getTruckSaleDetail";
import Link from "next/link";

 

type Props = {
  params: Promise<{
    saleId: string;
  }>;
};

export default async function TruckSaleDetailPage({
  params,
}: Props) {

  const { saleId } = await params;

  const result =
    await getTruckSaleDetail(saleId);

 if (!result.success) {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-xl border bg-white p-10 text-center">

          <h1 className="text-xl font-semibold text-red-600">
            Sale Not Found
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            {result.message}
          </p>

          <Link
            href="/admin/distribution/truck-sales"
            className="
              mt-6
              inline-flex
              rounded-md
              bg-blue-600
              px-4
              py-2
              text-sm
              font-medium
              text-white
              hover:bg-blue-700
            "
          >
            Back to Truck Sales
          </Link>

        </div>
      </div>
    </div>
  );
}

  const {
    sale,
    items,
  } = result.data;

  console.log("sale---------------",sale)

  const totalCost = items.reduce(
    (sum, item) =>
      sum + Number(item.costValue || 0),
    0
  );

  const grossProfit = items.reduce(
    (sum, item) =>
      sum + Number(item.grossProfit || 0),
    0
  );

  const profitMargin =
    Number(sale.totalAmount || 0) > 0
      ? (grossProfit /
          Number(sale.totalAmount)) *
        100
      : 0;

  function formatMoney(value: number) {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(Number(value || 0));
  }

  function formatDate(date?: Date) {
    if (!date) return "-";

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(new Date(date));
  }

  function getPaymentStatusClass(
    status: string
  ) {
    switch (status) {

      case "PAID":
        return "bg-green-100 text-green-700";

      case "PARTIAL":
        return "bg-yellow-100 text-yellow-700";

      case "CREDIT":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="mx-auto max-w-[1500px] space-y-6">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="flex items-center gap-2 text-sm text-gray-500">

              <Link
                href="/admin/distribution/truck-sales"
                className="hover:text-blue-600"
              >
                Truck Sales
              </Link>

              <span>/</span>

              <span>
                {sale.saleId}
              </span>

            </div>

            <h1 className="mt-2 text-2xl font-semibold text-gray-900">
              Truck Sale Details
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {formatDate(sale.createdAt)}
            </p>

          </div>


          <div className="flex gap-2">

            {sale.tripId && (
              <Link
                href={`/admin/distribution/trips/${encodeURIComponent(
                  sale.tripId
                )}`}
                className="
                  rounded-md
                  border
                  bg-white
                  px-4
                  py-2
                  text-sm
                  font-medium
                  hover:bg-gray-50
                "
              >
                View Trip
              </Link>
            )}

            <Link
              href="/admin/distribution/truck-sales"
              className="
                rounded-md
                bg-blue-600
                px-4
                py-2
                text-sm
                font-medium
                text-white
                hover:bg-blue-700
              "
            >
              Back to Sales
            </Link>

          </div>

        </div>


        {/* ================================================= */}
        {/* SALE / TRIP INFORMATION */}
        {/* ================================================= */}

        <div className="grid gap-6 lg:grid-cols-3">

          {/* SALE */}

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <h2 className="text-sm font-semibold text-gray-500">
              SALE
            </h2>

            <div className="mt-4 space-y-3">

              <InfoRow
                label="Sale No"
                value={sale.saleNo!}
              />

              <InfoRow
                label="Trip "
                value={sale.tripNo || "-"}
              />

              <InfoRow
                label="Status"
                value={sale.status || "COMPLETED"}
              />

              <InfoRow
                label="Created By"
                value={sale.createdBy || "-"}
              />

            </div>

          </div>


          {/* VEHICLE */}

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <h2 className="text-sm font-semibold text-gray-500">
              VEHICLE
            </h2>

            <div className="mt-4 space-y-3">

              <InfoRow
                label="Vehicle"
                value={sale.vehicleName || "-"}
              />

          

              <InfoRow
                label="Code"
                value={sale.locationCode || "-"}
              />

              <InfoRow
                label="Responsible"
                value={
                  sale.responsiblePerson || "-"
                }
              />

            </div>

          </div>


          {/* CUSTOMER */}

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <h2 className="text-sm font-semibold text-gray-500">
              CUSTOMER
            </h2>

            <div className="mt-4 space-y-3">

              <InfoRow
                label="Customer"
                value={
                  sale.wholeSaleCutomerName ||
                  "-"
                }
              />

              {/* <InfoRow
                label="Customer ID"
                value={
                  sale.wholeSaleCutomerId ||
                  "-"
                }
              /> */}

              <InfoRow
                label="Payment"
                value={
                  sale.paymentMethod ||
                  "-"
                }
              />

              <div className="flex items-center justify-between">

                <span className="text-sm text-gray-500">
                  Status
                </span>

                <span
                  className={`
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-medium
                    ${getPaymentStatusClass(
                      sale.paymentStatus!
                    )}
                  `}
                >
                  {sale.paymentStatus}
                </span>

              </div>

            </div>

          </div>

        </div>


        {/* ================================================= */}
        {/* FINANCIAL SUMMARY */}
        {/* ================================================= */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">

          <SummaryCard
            label="Total"
            value={formatMoney(
              sale.totalAmount
            )}
          />

          <SummaryCard
            label="Paid"
            value={formatMoney(
              sale.paidAmount
            )}
            valueClass="text-green-700"
          />

          <SummaryCard
            label="Due"
            value={formatMoney(
              sale.dueAmount
            )}
            valueClass="text-red-600"
          />

          <SummaryCard
            label="Cost"
            value={formatMoney(
              totalCost
            )}
          />

          <SummaryCard
            label="Gross Profit"
            value={formatMoney(
              grossProfit
            )}
            valueClass={
              grossProfit >= 0
                ? "text-green-700"
                : "text-red-600"
            }
          />

        </div>


        {/* ================================================= */}
        {/* SALE ITEMS */}
        {/* ================================================= */}

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

          <div className="border-b p-5">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-lg font-semibold">
                  Sale Items
                </h2>

                <p className="text-sm text-gray-500">
                  Products sold from the vehicle
                </p>

              </div>

              <div className="text-right">

                <p className="text-xs text-gray-500">
                  Total Quantity
                </p>

                <p className="font-semibold">
                  {sale.totalQuantity} Kg
                </p>

              </div>

            </div>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px] text-sm">

              <thead className="bg-zinc-100">

                <tr>

                  <th className="p-3 text-left">
                    Product
                  </th>

                  <th className="p-3 text-right">
                    Quantity
                  </th>

                  <th className="p-3 text-right">
                    Unit Price
                  </th>

                  <th className="p-3 text-right">
                    Sales Value
                  </th>

                  <th className="p-3 text-right">
                    Cost / Unit
                  </th>

                  <th className="p-3 text-right">
                    Cost
                  </th>

                  <th className="p-3 text-right">
                    Gross Profit
                  </th>

                </tr>

              </thead>


              <tbody>

                {items.length === 0 && (

                  <tr>

                    <td
                      colSpan={7}
                      className="p-10 text-center text-gray-500"
                    >
                      No products found in this sale.
                    </td>

                  </tr>

                )}


                {items.map((item) => (

                  <tr
                    key={item.id}
                    className="
                      border-t
                      hover:bg-blue-50
                    "
                  >

                    <td className="p-3">

                      <div className="font-medium">
                        {item.productName}
                      </div>

                      <div className="text-xs text-gray-500">
                        {item.productId}
                      </div>

                    </td>


                    <td className="p-3 text-right">
                      {item.quantity}
                    </td>


                    <td className="p-3 text-right">
                      {formatMoney(
                        item.unitPrice
                      )}
                    </td>


                    <td className="p-3 text-right font-medium">
                      {formatMoney(
                        item.lineValue
                      )}
                    </td>


                    <td className="p-3 text-right">
                      {formatMoney(
                        item.costPerUnit
                      )}
                    </td>


                    <td className="p-3 text-right">
                      {formatMoney(
                        item.costValue
                      )}
                    </td>


                    <td
                      className={`
                        p-3
                        text-right
                        font-medium
                        ${
                          item.grossProfit >= 0
                            ? "text-green-700"
                            : "text-red-600"
                        }
                      `}
                    >
                      {formatMoney(
                        item.grossProfit
                      )}
                    </td>

                  </tr>

                ))}

              </tbody>


              {items.length > 0 && (

                <tfoot className="bg-zinc-50">

                  <tr className="border-t font-semibold">

                    <td className="p-3">
                      Total
                    </td>

                    <td className="p-3 text-right">
                      {sale.totalQuantity}
                    </td>

                    <td></td>

                    <td className="p-3 text-right">
                      {formatMoney(
                        sale.totalAmount
                      )}
                    </td>

                    <td></td>

                    <td className="p-3 text-right">
                      {formatMoney(
                        totalCost
                      )}
                    </td>

                    <td className="p-3 text-right text-green-700">
                      {formatMoney(
                        grossProfit
                      )}
                    </td>

                  </tr>

                </tfoot>

              )}

            </table>

          </div>

        </div>


        {/* ================================================= */}
        {/* PROFIT SUMMARY */}
        {/* ================================================= */}

        <div className="grid gap-6 lg:grid-cols-2">

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <h2 className="text-sm font-semibold text-gray-500">
              PROFIT SUMMARY
            </h2>

            <div className="mt-4 space-y-3">

              <InfoRow
                label="Sales Revenue"
                value={formatMoney(
                  sale.totalAmount
                )}
              />

              <InfoRow
                label="Total Cost"
                value={formatMoney(
                  totalCost
                )}
              />

              <InfoRow
                label="Gross Profit"
                value={formatMoney(
                  grossProfit
                )}
                valueClass={
                  grossProfit >= 0
                    ? "text-green-700"
                    : "text-red-600"
                }
              />

              <InfoRow
                label="Profit Margin"
                value={`${profitMargin.toFixed(2)}%`}
              />

            </div>

          </div>


          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <h2 className="text-sm font-semibold text-gray-500">
              REMARKS
            </h2>

            <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">
              {sale.remarks || "No remarks."}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}


// =====================================================
// INFO ROW
// =====================================================

function InfoRow({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">

      <span className="text-sm text-gray-500">
        {label}
      </span>

      <span
        className={`text-right text-sm font-medium ${valueClass}`}
      >
        {value}
      </span>

    </div>
  );
}


// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">

      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p
        className={`
          mt-1
          text-lg
          font-semibold
          ${valueClass}
        `}
      >
        {value}
      </p>

    </div>
  );
}