import { adminDb } from "@/lib/firebaseAdmin";
import MarkEMIPaidButton from "./MarkEMIPaidButton";

type Props = {
  params: Promise<{
    financeId: string;
  }>;
};

export default async function VehicleEMIPage({
  params,
}: Props) {
  const { financeId } = await params;

  const financeSnap = await adminDb
    .collection("vehicle_finances")
    .doc(financeId)
    .get();

  if (!financeSnap.exists) {
    return (
      <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center">
          <h1 className="text-xl font-bold text-gray-800">
            Finance Record Not Found
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            The requested vehicle finance record does not exist.
          </p>
        </div>
      </div>
    );
  }

  const finance = financeSnap.data();

  const vehicleSnap = await adminDb
    .collection("stockLocations")
    .doc(finance?.vehicleId)
    .get();

  const vehicle = vehicleSnap.exists
    ? vehicleSnap.data()
    : null;

  const emiSnap = await adminDb
    .collection("vehicle_finance_installments")
    .where("financeId", "==", financeId)
    .orderBy("installmentNumber", "asc")
    .get();

  const installments = emiSnap.docs.map((doc) => {
    const data = doc.data();

    return {
      id: doc.id,
      installmentNumber: Number(
        data.installmentNumber || 0
      ),
      dueDate: Number(data.dueDate || 0),
      amount: Number(data.amount || 0),
      principalAmount: Number(
        data.principalAmount || 0
      ),
      interestAmount: Number(
        data.interestAmount || 0
      ),
      status: data.status || "PENDING",
      paidDate: data.paidDate
        ? Number(data.paidDate)
        : null,
      paymentReference:
        data.paymentReference || "",
      remarks: data.remarks || "",
    };
  });

  const totalAmount = installments.reduce(
    (sum, emi) => sum + emi.amount,
    0
  );

  const paidAmount = installments
    .filter((emi) => emi.status === "PAID")
    .reduce((sum, emi) => sum + emi.amount, 0);

  const pendingAmount = installments
    .filter((emi) => emi.status !== "PAID")
    .reduce((sum, emi) => sum + emi.amount, 0);

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6 w-full">
      <div className="w-full">

        {/* ================= HEADER ================= */}

        <div className="mb-6">

          <h1 className="text-3xl font-bold text-gray-800">
            Vehicle EMI Schedule
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage EMI installments for this vehicle finance.
          </p>

        </div>

        {/* ================= FINANCE SUMMARY ================= */}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

            <div>

              <h2 className="text-xl font-bold text-gray-800">
                {vehicle?.vehicleNumber ||
                  vehicle?.locationCode ||
                  "Unknown Vehicle"}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {vehicle?.name || ""}
              </p>

            </div>

            <span
              className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold ${
                finance?.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : finance?.status === "COMPLETED"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {finance?.status || "ACTIVE"}
            </span>

          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="rounded-xl bg-gray-50 p-4">

              <p className="text-xs text-gray-500">
                Finance Company
              </p>

              <p className="font-semibold mt-1">
                {finance?.financeCompany || "-"}
              </p>

            </div>

            <div className="rounded-xl bg-gray-50 p-4">

              <p className="text-xs text-gray-500">
                Loan Amount
              </p>

              <p className="font-semibold mt-1">
                ₹
                {Number(
                  finance?.loanAmount || 0
                ).toLocaleString("en-IN")}
              </p>

            </div>

            <div className="rounded-xl bg-gray-50 p-4">

              <p className="text-xs text-gray-500">
                EMI Amount
              </p>

              <p className="font-semibold mt-1">
                ₹
                {Number(
                  finance?.emiAmount || 0
                ).toLocaleString("en-IN")}
              </p>

            </div>

            <div className="rounded-xl bg-gray-50 p-4">

              <p className="text-xs text-gray-500">
                Installments
              </p>

              <p className="font-semibold mt-1">
                {Number(
                  finance?.numberOfInstallments || 0
                )}
              </p>

            </div>

          </div>

        </div>

        {/* ================= EMI SUMMARY ================= */}

        <div className="grid sm:grid-cols-3 gap-4 mb-6">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

            <p className="text-xs text-gray-500">
              Total EMI Amount
            </p>

            <p className="text-xl font-bold text-gray-800 mt-1">
              ₹{totalAmount.toLocaleString("en-IN")}
            </p>

          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

            <p className="text-xs text-gray-500">
              Paid Amount
            </p>

            <p className="text-xl font-bold text-green-600 mt-1">
              ₹{paidAmount.toLocaleString("en-IN")}
            </p>

          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

            <p className="text-xs text-gray-500">
              Pending Amount
            </p>

            <p className="text-xl font-bold text-orange-600 mt-1">
              ₹{pendingAmount.toLocaleString("en-IN")}
            </p>

          </div>

        </div>

        {/* ================= EMI SCHEDULE ================= */}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">

          <div className="mb-5">

            <h2 className="text-xl font-bold text-gray-800">
              EMI Schedule
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              {installments.length} installments generated.
            </p>

          </div>

          {installments.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">

              <p className="text-gray-500">
                No EMI installments found.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>

                  <tr className="border-b border-gray-200 text-left">

                    <th className="px-3 py-3">
                      #
                    </th>

                    <th className="px-3 py-3">
                      Due Date
                    </th>

                    <th className="px-3 py-3">
                      Amount
                    </th>

                    <th className="px-3 py-3">
                      Principal
                    </th>

                    <th className="px-3 py-3">
                      Interest
                    </th>

                    <th className="px-3 py-3">
                      Status
                    </th>

                    <th className="px-3 py-3">
                      Paid Date
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {installments.map((emi) => (

                    <tr
                      key={emi.id}
                      className="border-b border-gray-100 last:border-0"
                    >

                      <td className="px-3 py-4 font-semibold">
                        {emi.installmentNumber}
                      </td>

                      <td className="px-3 py-4">
                        {emi.dueDate
                          ? new Date(
                              emi.dueDate
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "-"}
                      </td>

                      <td className="px-3 py-4 font-semibold">
                        ₹
                        {emi.amount.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-3 py-4">
                        ₹
                        {emi.principalAmount.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-3 py-4">
                        ₹
                        {emi.interestAmount.toLocaleString(
                          "en-IN"
                        )}
                      </td>

                   <td className="px-3 py-4">
  <div className="flex items-center gap-2">
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
        emi.status === "PAID"
          ? "bg-green-100 text-green-700"
          : emi.status === "OVERDUE"
          ? "bg-red-100 text-red-700"
          : "bg-yellow-100 text-yellow-700"
      }`}
    >
      {emi.status}
    </span>

    {emi.status === "PENDING" && (
      <MarkEMIPaidButton installmentId={emi.id} />
    )}
  </div>
</td>

                      <td className="px-3 py-4">
                        {emi.paidDate
                          ? new Date(
                              emi.paidDate
                            ).toLocaleDateString(
                              "en-IN"
                            )
                          : "-"}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </div>
  );
}