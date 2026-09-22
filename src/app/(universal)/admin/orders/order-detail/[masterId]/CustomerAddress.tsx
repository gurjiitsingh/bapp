import React from "react";
import {
  MapPin,
  Phone,
  User,
  Mail,
} from "lucide-react";

interface CustomerAddressProps {
  address: {
    id?: string;
    userId?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    mobNo?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    createdAt?: string;
  };
}

export default function CustomerAddress({
  address,
}: CustomerAddressProps) {
  const customerName = [
    address.firstName,
    address.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  const fullAddress = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.zipCode,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-800">
            Customer Address
          </h2>

          <p className="mt-0.5 text-xs text-slate-400">
            Delivery / customer information
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50">
          <MapPin
            size={18}
            className="text-indigo-600"
          />
        </div>
      </div>

      {/* CUSTOMER DETAILS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* NAME */}
        {customerName && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <User
                size={15}
                className="text-slate-500"
              />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Customer
              </div>

              <div className="mt-0.5 truncate text-sm font-semibold text-slate-700">
                {customerName}
              </div>
            </div>
          </div>
        )}

        {/* PHONE */}
        {address.mobNo && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Phone
                size={15}
                className="text-slate-500"
              />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Mobile
              </div>

              <div className="mt-0.5 text-sm font-semibold text-slate-700">
                {address.mobNo}
              </div>
            </div>
          </div>
        )}

        {/* EMAIL */}
        {address.email && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Mail
                size={15}
                className="text-slate-500"
              />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Email
              </div>

              <div className="mt-0.5 truncate text-sm font-medium text-slate-700">
                {address.email}
              </div>
            </div>
          </div>
        )}

        {/* ADDRESS */}
        {fullAddress && (
          <div className="flex items-start gap-3 sm:col-span-2 lg:col-span-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <MapPin
                size={15}
                className="text-slate-500"
              />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Address
              </div>

              <div className="mt-0.5 text-sm font-medium leading-6 text-slate-700">
                {fullAddress}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
 