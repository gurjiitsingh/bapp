
"use client";

import { useState } from "react";
import { MapPin, CheckCircle2 } from "lucide-react";
import { UseSiteContext } from "@/SiteContext/SiteContext";

type CustomerAddress = {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  mobNo?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  portal?: string;
  staircase?: string;
  floor?: string;
  door?: string;
  deliveryNotes?: string;
};

type Props = {
  userId: string;
  addresses: CustomerAddress[];
};

export default function CustomerAddressBook({
  userId,
  addresses,
}: Props) {
  const { setCustomerAddressIsComplete } = UseSiteContext();

  const [selectedId, setSelectedId] = useState(
    addresses[0]?.id ?? ""
  );
  const [error, setError] = useState("");

  function handleUseAddress() {
    const selectedAddress = addresses.find(
      (address) => address.id === selectedId
    );

    if (!selectedAddress) {
      setError("Please select a saved address.");
      return;
    }

    const customerAddress = {
      ...selectedAddress,
      userId,
    };

    localStorage.setItem(
      "customer_address",
      JSON.stringify(customerAddress)
    );

    localStorage.setItem(
      "customer_address_Id",
      selectedAddress.id
    );

    localStorage.setItem("order_user_Id", userId);

    localStorage.setItem(
      "customer_name",
      `${selectedAddress.firstName ?? ""} ${
        selectedAddress.lastName ?? ""
      }`.trim()
    );

    setCustomerAddressIsComplete(true);
    setError("");
  }

  return (
    <section className="w-full space-y-4 rounded-lg border border-gray-200 p-4">
      <h2 className="text-lg font-semibold">
        Select delivery address
      </h2>

      {addresses.length === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            No saved addresses were found for your account.
          </p>

          <a
            href="/user"
            className="inline-block text-sm font-medium text-blue-600 underline"
          >
            Go to your account to add an address
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => {
            const selected = selectedId === address.id;

            return (
              <label
                key={address.id}
                className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition ${
                  selected
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="customerAddress"
                  value={address.id}
                  checked={selected}
                  onChange={() => {
                    setSelectedId(address.id);
                    setError("");
                  }}
                  className="mt-1"
                />

                <MapPin className="mt-1 h-5 w-5 shrink-0 text-gray-600" />

                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-semibold">
                    {address.firstName ?? ""}{" "}
                    {address.lastName ?? ""}
                  </p>

                  <p>{address.addressLine1}</p>

                  {address.addressLine2 && (
                    <p>{address.addressLine2}</p>
                  )}

                  <p>
                    {[
                      address.city,
                      address.state,
                      address.zipCode,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>

                  {address.mobNo && (
                    <p className="mt-1 text-gray-600">
                      Phone: {address.mobNo}
                    </p>
                  )}

                  {selected && (
                    <span className="mt-2 inline-flex items-center gap-1 font-medium text-blue-700">
                      <CheckCircle2 className="h-4 w-4" />
                      Selected
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="button"
        onClick={handleUseAddress}
        disabled={addresses.length === 0 || !selectedId}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Deliver to this address
      </button>
    </section>
  );
}
