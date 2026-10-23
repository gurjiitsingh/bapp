"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  CheckCircle2,
  Plus,
  Pencil,
} from "lucide-react";
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
  const router = useRouter();

  const [selectedId, setSelectedId] = useState(
    addresses[0]?.id ?? ""
  );
  const [error, setError] = useState("");

  // Open the checkout-specific page to add an address.
  function addAddress() {
    router.push("/checkout/address?returnTo=%2Fcheckout");
  }

  // Open the checkout-specific page to edit an existing address.
  function editAddress(addressId: string) {
    router.push(
      `/checkout/address?edit=${encodeURIComponent(
        addressId
      )}&returnTo=%2Fcheckout`
    );
  }

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
      {/* Heading and Add Address button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">
          Select delivery address
        </h2>

        <button
          type="button"
          onClick={addAddress}
          className="inline-flex items-center gap-2 rounded-lg border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
        >
          <Plus className="h-4 w-4" />
          Add a new address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="space-y-3 rounded-lg bg-gray-50 p-4">
          <MapPin className="h-8 w-8 text-gray-400" />

          <p className="text-sm text-gray-600">
            No saved addresses were found for your account.
          </p>

          <button
            type="button"
            onClick={addAddress}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add your first address
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => {
            const selected = selectedId === address.id;

            return (
              <div
                key={address.id}
                className={`rounded-lg border p-3 transition ${
                  selected
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-400"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Address selection */}
                  <input
                    type="radio"
                    name="customerAddress"
                    value={address.id}
                    checked={selected}
                    onChange={() => {
                      setSelectedId(address.id);
                      setError("");
                    }}
                    aria-label={`Select address for ${
                      address.firstName ?? "customer"
                    }`}
                    className="mt-1"
                  />

                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-gray-600" />

                  {/* Address details */}
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-semibold">
                      {address.firstName ?? ""}{" "}
                      {address.lastName ?? ""}
                    </p>

                    {address.addressLine1 && (
                      <p>{address.addressLine1}</p>
                    )}

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

                  {/* Edit button */}
                  <button
                    type="button"
                    onClick={() => editAddress(address.id)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-blue-600 hover:bg-blue-100"
                    aria-label={`Edit address for ${
                      address.firstName ?? "customer"
                    }`}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                </div>
              </div>
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
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Deliver to this address
      </button>
    </section>
  );
}