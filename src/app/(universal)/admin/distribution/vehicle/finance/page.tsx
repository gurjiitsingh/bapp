import { adminDb } from "@/lib/firebaseAdmin";
import VehicleFinanceForm from "./VehicleFinanceForm";
import VehicleEMIGenerateForm from "./emi/VehicleEMIGenerateForm";



export default async function VehicleFinancePage() {


    const emiSnap = await adminDb
  .collection("vehicle_finance_installments")
  .get();

const emiFinanceIds = new Set(
  emiSnap.docs.map(
    (doc) => doc.data().financeId
  )
);
  // ============================
  // VEHICLES
  // ============================

  const vehiclesSnap = await adminDb
    .collection("stockLocations")
    .where("active", "==", true)
    .get();

  const vehicles = vehiclesSnap.docs.map(
    (doc) => {
      const data = doc.data();

      return {
        id: doc.id,

        locationCode:
          data.locationCode || "",

        vehicleNumber:
          data.vehicleNumber || "",

        name:
          data.name || "",
      };
    }
  );

  // ============================
  // VEHICLE FINANCE
  // ============================

  const financeSnap = await adminDb
    .collection("vehicle_finances")
    .orderBy("createdAt", "desc")
    .get();

  const finances = financeSnap.docs.map(
    (doc) => {
      const data = doc.data();

      const vehicle =
        vehicles.find(
          (v) => v.id === data.vehicleId
        );

      return {
        id: doc.id,

        vehicleId:
          data.vehicleId || "",

        vehicleNumber:
          vehicle?.vehicleNumber ||
          vehicle?.locationCode ||
          "Unknown",

        vehicleName:
          vehicle?.name || "",

        financeCompany:
          data.financeCompany || "",

        loanAccountNumber:
          data.loanAccountNumber || "",

        loanAmount:
          Number(data.loanAmount || 0),

        emiAmount:
          Number(data.emiAmount || 0),

        numberOfInstallments:
          Number(
            data.numberOfInstallments || 0
          ),

        startDate:
          Number(data.startDate || 0),

        endDate:
          Number(data.endDate || 0),

        status:
          data.status || "ACTIVE",

        remarks:
          data.remarks || "",
      };
    }
  );

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6 w-full">
      <div className="w-full">

        {/* ================= HEADER ================= */}

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Vehicle Finance
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage vehicle loans, EMI and
            installment schedules.
          </p>
        </div>

        {/* ================= ADD FINANCE ================= */}

        <div className="mb-8">
          <VehicleFinanceForm
            vehicles={vehicles}
          />
        </div>

        {/* ================= EXISTING FINANCE ================= */}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">

          <div className="mb-5">
            <h2 className="text-xl font-bold text-gray-800">
              Vehicle Finance Records
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Existing vehicle loans and EMI
              schedules.
            </p>
          </div>

          {finances.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">
              <p className="text-gray-500">
                No vehicle finance records found.
              </p>
            </div>
          ) : (
            <div className="space-y-5">

              {finances.map((finance) => (
                <div
                  key={finance.id}
                  className="rounded-2xl border border-gray-200 p-5"
                >

                  {/* FINANCE HEADER */}

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {finance.vehicleNumber}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {finance.vehicleName}
                      </p>
                    </div>

                    <span
                      className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold ${
                        finance.status ===
                        "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : finance.status ===
                            "COMPLETED"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {finance.status}
                    </span>

                  </div>

                  {/* FINANCE DETAILS */}

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">
                        Finance Company
                      </p>

                      <p className="font-semibold mt-1">
                        {finance.financeCompany}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">
                        Loan Amount
                      </p>

                      <p className="font-semibold mt-1">
                        ₹
                        {finance.loanAmount.toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">
                        EMI
                      </p>

                      <p className="font-semibold mt-1">
                        ₹
                        {finance.emiAmount.toLocaleString(
                          "en-IN"
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">
                        Installments
                      </p>

                      <p className="font-semibold mt-1">
                        {
                          finance.numberOfInstallments
                        }
                      </p>
                    </div>

                  </div>

                  {/* ACCOUNT */}

                  {finance.loanAccountNumber && (
                    <div className="mb-5 text-sm text-gray-600">
                      <span className="font-medium">
                        Loan Account:
                      </span>{" "}
                      {finance.loanAccountNumber}
                    </div>
                  )}

                  {/* EMI GENERATION */}

               {/* EMI */}

<div className="border-t border-gray-200 pt-5">

  {!emiFinanceIds.has(finance.id) ? (

    /* ================= GENERATE EMI ================= */

    <VehicleEMIGenerateForm
      vehicleId={finance.vehicleId}
      financeId={finance.id}
      defaultStartDate={
        finance.startDate
          ? new Date(
              finance.startDate
            )
              .toISOString()
              .split("T")[0]
          : ""
      }
      defaultEmiAmount={
        finance.emiAmount
      }
      defaultNumberOfInstallments={
        finance.numberOfInstallments
      }
    />

  ) : (

    /* ================= EMI ALREADY GENERATED ================= */

    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

      <div>

        <h4 className="font-semibold text-gray-800">
          EMI Schedule Generated
        </h4>

        <p className="text-sm text-gray-500 mt-1">
          EMI installments have already been generated
          for this finance record.
        </p>

      </div>

      <div className="flex gap-3">

        <a
          href={`/admin/distribution/vehicle/finance/emi/${finance.id}`}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
        >
          View EMI
        </a>

        <a
          href={`/admin/distribution/vehicle/finance/emi/${finance.id}?edit=true`}
          className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
        >
          Edit EMI
        </a>

      </div>

    </div>

  )}

</div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

