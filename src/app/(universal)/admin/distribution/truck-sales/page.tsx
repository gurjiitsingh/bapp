import Link from "next/link";
import VehicleSaleReportTable from "./VehicleSaleReportTable";



export default function TruckSalesPage() {
  return (
    <div className="min-h-screen w-full bg-gray-50 p-6">
      <div className="mx-auto w-full max-w-[1600px] space-y-6">

        {/* =============================== */}
        {/* PAGE HEADER */}
        {/* =============================== */}

<div className="flex justify-between items-start">

  <div>
    <h1 className="text-2xl font-semibold text-gray-900">
      Vehicle Stock Returns
    </h1>

    <p className="mt-1 text-sm text-gray-500">
      View customer returns, unsold returns, spoiled and damaged products.
    </p>
  </div>

  <div className="flex gap-2">
  {/* Load Reports */}
    <Link
      href="/admin/distribution/saleman-settlements"
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
      Saleman Reports
    </Link>
   

    {/* Load Reports */}
    <Link
      href="/admin/distribution/loads/vehicle-loads"
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
      Load Reports
    </Link>

     {/* More */}
    <Link
      href="/admin/distribution/sales"
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
      More Reports
    </Link>

  </div>

</div>

        {/* =============================== */}
        {/* REPORT */}
        {/* =============================== */}

        <VehicleSaleReportTable />

      </div>
    </div>
  );
}