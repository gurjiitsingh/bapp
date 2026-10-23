
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  CheckCircle2,
  Check,
  Plus,
  Pencil,
  Phone,
  ArrowRight,
  MapPinned,
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
  const [isAddressConfirmed, setIsAddressConfirmed] = useState(false);
  function addAddress() {
    router.push("/checkout/address?returnTo=%2Fcheckout");
  }

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
      `${selectedAddress.firstName ?? ""} ${selectedAddress.lastName ?? ""
        }`.trim()
    );

    setCustomerAddressIsComplete(true);
    setIsAddressConfirmed(true);
    setError("");
  }

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white/90 shadow-sm backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
            <MapPinned size={17} strokeWidth={1.8} />
          </span>

          <div>
            <h2 className="text-sm font-semibold text-gray-900 sm:text-base">
              Delivery address
            </h2>
            <p className="mt-0.5 text-[11px] text-gray-500 sm:text-xs">
              Choose where you want your order delivered
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={addAddress}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-orange-300/60 bg-orange-500/10 px-3 text-[11px] font-semibold text-orange-700 transition hover:border-orange-400/70 hover:bg-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
        >
          <Plus size={13} />
          Add address
        </button>
      </div>

      <div className="space-y-3 p-3 sm:p-4">
        {/* Empty state */}
        {addresses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/70 px-4 py-8 text-center">
            <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-orange-100/80 text-orange-600">
              <MapPin size={19} strokeWidth={1.7} />
            </span>

            <h3 className="mt-3 text-sm font-semibold text-gray-800">
              No saved addresses yet
            </h3>

            <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-gray-500">
              Add your delivery details to make checkout quicker and easier.
            </p>

            <button
              type="button"
              onClick={addAddress}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-full bg-orange-500 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
            >
              <Plus size={14} />
              Add your first address
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {addresses.map((address) => {
              const selected = selectedId === address.id;

              const fullName = [
                address.firstName,
                address.lastName,
              ]
                .filter(Boolean)
                .join(" ");

              const cityLine = [
                address.city,
                address.state,
                address.zipCode,
              ]
                .filter(Boolean)
                .join(", ");

              return (
                <div
                  key={address.id}
                  onClick={() => {
                    setSelectedId(address.id);
                    setIsAddressConfirmed(false);
                    setCustomerAddressIsComplete(false);
                    setError("");
                  }
                  }
                  className={`group relative cursor-pointer rounded-xl border p-3 transition-all duration-200 sm:p-4 ${selected
                      ? "border-orange-300 bg-orange-50/50 shadow-sm shadow-orange-100/50"
                      : "border-gray-200/90 bg-white/70 hover:border-orange-200 hover:bg-orange-50/20"
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Custom selection indicator */}
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${selected
                          ? "border-orange-500 bg-orange-500 text-white"
                          : "border-gray-300 bg-white group-hover:border-orange-300"
                        }`}
                    >
                      {selected && (
                        <CheckCircle2
                          size={12}
                          strokeWidth={2.5}
                        />
                      )}
                    </span>

                    {/* Address content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xs font-semibold text-gray-900 sm:text-sm">
                          {fullName || "Delivery address"}
                        </h3>

                        {selected && (
                          <span className="rounded-full bg-orange-100/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-orange-700">
                            Selected
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-start gap-2">
                        <MapPin
                          size={13}
                          strokeWidth={1.8}
                          className="mt-0.5 shrink-0 text-gray-400"
                        />

                        <div className="min-w-0 text-xs leading-5 text-gray-600">
                          {address.addressLine1 && (
                            <p>{address.addressLine1}</p>
                          )}

                          {address.addressLine2 && (
                            <p>{address.addressLine2}</p>
                          )}

                          {cityLine && <p>{cityLine}</p>}

                          {(address.portal ||
                            address.staircase ||
                            address.floor ||
                            address.door) && (
                              <p className="mt-1 text-[11px] text-gray-500">
                                {[
                                  address.portal &&
                                  `Portal ${address.portal}`,
                                  address.staircase &&
                                  `Staircase ${address.staircase}`,
                                  address.floor &&
                                  `Floor ${address.floor}`,
                                  address.door &&
                                  `Door ${address.door}`,
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            )}
                        </div>
                      </div>

                      {address.mobNo && (
                        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-500">
                          <Phone size={11} strokeWidth={1.8} />
                          <span>{address.mobNo}</span>
                        </div>
                      )}

                      {address.deliveryNotes && (
                        <p className="mt-2 rounded-lg bg-gray-50 px-2.5 py-2 text-[11px] leading-4 text-gray-500">
                          Note: {address.deliveryNotes}
                        </p>
                      )}
                    </div>

                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        editAddress(address.id);
                      }}
                      aria-label={`Edit address for ${fullName || "customer"
                        }`}
                      className="inline-flex h-7 shrink-0 items-center gap-1 rounded-full border border-gray-200/80 bg-white/80 px-2 text-[10px] font-medium text-gray-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 sm:px-2.5 sm:text-[11px]"
                    >
                      <Pencil size={11} />
                      <span>Edit</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Validation message */}
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600"
          >
            {error}
          </p>
        )}

        {/* Confirm selected address */}
       
<button
  type="button"
  onClick={handleUseAddress}
  disabled={addresses.length === 0 || !selectedId}
  className={`group flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-xs font-semibold shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none sm:h-12 sm:text-sm ${
    isAddressConfirmed
      ? "bg-green-600 text-white shadow-green-200/50 hover:bg-green-700 focus-visible:ring-green-400"
      : "bg-orange-500 text-white shadow-orange-200/50 hover:bg-orange-600 focus-visible:ring-orange-400"
  }`}
>
  {isAddressConfirmed ? (
    <>
      <CheckCircle2 size={16} strokeWidth={2.2} />
      Address confirmed
      <Check size={15} strokeWidth={2.5} />
    </>
  ) : (
    <>
      <MapPin size={14} />
      Confirm delivery address
      <ArrowRight
        size={14}
        className="transition-transform group-hover:translate-x-0.5"
      />
    </>
  )}
</button>

      </div>
    </section>
  );
}
