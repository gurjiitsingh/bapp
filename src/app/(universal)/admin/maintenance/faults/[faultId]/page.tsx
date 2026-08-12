import { notFound } from "next/navigation";

import {
  getFaultById,
} from "@/app/(universal)/action/maintenance/faultActions";

import {
  fetchTechnicians,
} from "@/app/(universal)/action/maintenance/fetchTechnicians";

import FaultDetails from "./FaultDetails";

type PageProps = {
  params: Promise<{
    faultId: string;
  }>;
};

export default async function FaultDetailsPage({
  params,
}: PageProps) {
  const { faultId } = await params;

  const fault =
    await getFaultById(faultId);

  if (!fault) {
    notFound();
  }

  const technicians =
    await fetchTechnicians();

  return (
    <div className="p-6">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Fault Details
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          View and manage the maintenance fault ticket.
        </p>
      </div>

      <FaultDetails
        fault={fault}
        technicians={technicians}
      />

    </div>
  );
}