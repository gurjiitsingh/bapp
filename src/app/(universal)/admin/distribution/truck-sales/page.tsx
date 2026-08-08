import Link from "next/link";
import VehicleSaleReportTable from "./VehicleSaleReportTable";

 

export default function TruckSalesPage() {
  return (
    <div className="min-h-screen w-full bg-gray-50 p-6">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">

        {/* =============================== */}
        {/* PAGE HEADER */}
        {/* =============================== */}

       <div className="flex justify-between">

         <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Truck Sales
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Sales made from delivery vehicles to wholesale customers.
          </p>
        </div>
       <Link
                href={`/admin/distribution/sales`}
                className="
                  rounded-md
                  border
                  bg-slate-300
                  px-4
                  py-1
                  text-sm
                  font-medium
                  hover:bg-gray-50
                "
              >
               Deep
              </Link>

       </div>

        {/* =============================== */}
        {/* REPORT */}
        {/* =============================== */}

        <VehicleSaleReportTable />

      </div>
    </div>
  );
}