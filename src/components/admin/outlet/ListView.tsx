"use client";

import { useEffect, useState } from "react";

type OutletType = {
  outletId: string;
  outletName: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;

  phone?: string;
  phone2?: string;
  email?: string;
  web?: string;

  taxType?: string;
  gstVatNumber?: string;

  printerWidth?: number;
  footerNote?: string;

  isActive?: boolean;

  countryCode?: string;
  countryName?: string;
  currencyCode?: string;
  currencySymbol?: string;
};

export default function OutletPage() {
  const [data, setData] = useState<OutletType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOutlet() {
      try {
        const res = await fetch("/api/outlet");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchOutlet();
  }, []);

  // ✅ DELETE FUNCTION
  async function handleDelete() {
    if (!data?.outletId) return;

    const input = prompt(
      `Type DELETE to permanently delete "${data.outletName}"`
    );

    if (input !== "DELETE") {
      alert("Delete cancelled");
      return;
    }

    try {
      const res = await fetch("/api/outlet/delete", {
        method: "DELETE",
        body: JSON.stringify({ outletId: data.outletId }),
      });

      const result = await res.json();

      if (result.success) {
        alert("Outlet deleted");
        window.location.href = "/admin/outlet"; // redirect
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <p className="p-5">Loading outlet...</p>;

  if (!data || !data.outletId)
    return <p className="p-5">No outlet found</p>;

  return (
    <div className="md:w-1/2 w-full mx-auto p-5 space-y-4">

      {/* ✅ HEADER WITH DELETE */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Outlet Details</h1>

        <button
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Delete
        </button>
      </div>

      <div className="bg-white shadow rounded-2xl p-5 space-y-4">

        {/* BASIC */}
        <Section title="Basic Info">
          <Row label="Outlet Name" value={data.outletName} />
          <Row label="Status" value={data.isActive ? "Active" : "Inactive"} />
        </Section>

        {/* ADDRESS */}
        <Section title="Address">
          <Row label="Address 1" value={data.addressLine1} />
          <Row label="Address 2" value={data.addressLine2} />
          <Row label="Address 3" value={data.addressLine3} />
          <Row label="City" value={data.city} />
          <Row label="State" value={data.state} />
          <Row label="Zipcode" value={data.zipcode} />
          <Row label="Country" value={data.countryName || data.country} />
        </Section>

        {/* CONTACT */}
        <Section title="Contact">
          <Row label="Phone" value={data.phone} />
          <Row label="Phone 2" value={data.phone2} />
          <Row label="Email" value={data.email} />
          <Row label="Website" value={data.web} />
        </Section>

        {/* TAX */}
        <Section title="Tax Info">
          <Row label="Tax Type" value={data.taxType} />
          <Row label="GST/VAT" value={data.gstVatNumber} />
        </Section>

        {/* SETTINGS */}
        <Section title="Settings">
          <Row label="Printer Width" value={`${data.printerWidth} mm`} />
          <Row
            label="Currency"
            value={`${data.currencySymbol} (${data.currencyCode})`}
          />
          <Row label="Country Code" value={data.countryCode} />
        </Section>

        {/* FOOTER */}
        <Section title="Footer Note">
          <p className="text-gray-700 text-sm">
            {data.footerNote || "-"}
          </p>
        </Section>

      </div>

      {/* ✅ OPTIONAL: DANGER ZONE (BETTER UX) */}
      <div className="border-t pt-4">
        <h2 className="text-red-500 font-semibold mb-2">Danger Zone</h2>

        <button
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Delete Outlet Permanently
        </button>
      </div>
    </div>
  );
}

/* ---------- UI COMPONENTS ---------- */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-semibold text-lg mb-2">{title}</h2>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: any }) {
  return (
    <div className="flex justify-between text-sm border-b py-1">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">
        {value || "-"}
      </span>
    </div>
  );
}