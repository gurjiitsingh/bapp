"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  getRegisteredCustomerAddresses,
  addRegisteredCustomerAddress,
  updateRegisteredCustomerAddress,
} from "@/modules/customer-account";

import {
  
  deleteRegisteredCustomerAddress,
  setRegisteredCustomerDefaultAddress,
} from "@/modules/customer-account";

import type {
  CustomerAddress,
  CreateCustomerAddressInput,
} from "@/modules/customer-account";

const emptyAddress: CreateCustomerAddressInput = {
  firstName: "",
  lastName: "",
  email: "",
  mobNo: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  country: "India",
  portal: "",
  staircase: "",
  floor: "",
  door: "",
  deliveryNotes: "",
  isDefault: false,
};

type AddressField =
  | "firstName"
  | "lastName"
  | "email"
  | "mobNo"
  | "addressLine1"
  | "addressLine2"
  | "city"
  | "state"
  | "zipCode"
  | "country"
  | "portal"
  | "staircase"
  | "floor"
  | "door";

const fields: {
  name: AddressField;
  label: string;
  required?: boolean;
  type?: string;
}[] = [
  { name: "firstName", label: "First name", required: true },
  { name: "lastName", label: "Last name", required: true },

  // { name: "email", label: "Email", type: "email" },

  { name: "mobNo", label: "Mobile number", required: true },
  {
    name: "addressLine1",
    label: "Address line 1",
    required: true,
  },
  { name: "addressLine2", label: "Address line 2" },
  { name: "city", label: "City", required: true },
  { name: "state", label: "State / Province" },
  { name: "zipCode", label: "Postal code", required: true },

  // { name: "country", label: "Country", required: true },
];

const deliveryFields: {
  name: AddressField;
  label: string;
}[] = [
  // { name: "portal", label: "Portal / Entrance" },
  // { name: "staircase", label: "Staircase" },
  // { name: "floor", label: "Floor" },
  // { name: "door", label: "Door / Apartment" },
];

type Props = {
  editId: string | null;
  returnTo: string;
  userId: string;
};

export default function CheckoutAddressForm({
  editId,
  returnTo,
  userId,
}: Props) {
  const router = useRouter();

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [form, setForm] =
    useState<CreateCustomerAddressInput>({ ...emptyAddress });
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
const [editingId, setEditingId] = useState<string | null>(editId);
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const result = await getRegisteredCustomerAddresses();

        if (!result.success) {
          if (!cancelled) setError(result.error);
          return;
        }

        if (cancelled) return;

        setAddresses(result.data);

        if (editId) {
          const address = result.data.find(
            (item) => item.id === editId
          );

          if (!address) {
            setError("Address not found in your account.");
            return;
          }

        setForm({
  ...emptyAddress,
  firstName: address.firstName ?? "",
  lastName: address.lastName ?? "",
  email: "",
  mobNo: address.mobNo ?? "",
  addressLine1: address.addressLine1 ?? "",
  addressLine2: address.addressLine2 ?? "",
  city: address.city ?? "",
  state: address.state ?? "",
  zipCode: address.zipCode ?? "",
  country: "India",

  // Keep these empty while the fields are disabled.
  portal: "",
  staircase: "",
  floor: "",
  door: "",

  deliveryNotes: address.deliveryNotes ?? "",
  isDefault: address.isDefault ?? false,
});
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load your address.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [editId]);

  function change(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }


async function save(event: React.FormEvent<HTMLFormElement>) {
  event.preventDefault();
  setError("");

  startTransition(async () => {
    try {
 const addressData: CreateCustomerAddressInput = {
  ...form,
  email: "",
  country: "India",
  portal: "",
  staircase: "",
  floor: "",
  door: "",
};

const result = editingId
  ? await updateRegisteredCustomerAddress(editingId, addressData)
  : await addRegisteredCustomerAddress(addressData);

      if (!result.success) {
        setError(result.error);
        return;
      }

      const refreshed = await getRegisteredCustomerAddresses();

      if (!refreshed.success) {
        setError(
          "Address saved, but we could not reload it. Please return to checkout and refresh."
        );
        return;
      }

 const savedAddress = editingId
  ? refreshed.data.find((item) => item.id === editingId)
  : [...refreshed.data].reverse().find(
      (item) =>
        item.addressLine1 === form.addressLine1 &&
        item.mobNo === form.mobNo &&
        item.city === form.city
    );

      if (!savedAddress) {
        setError(
          "Address saved, but its ID could not be determined. Please return to checkout and select the address."
        );
        return;
      }

      // Save the selected address for the existing checkout flow.
      localStorage.setItem(
        "customer_address",
        JSON.stringify({ ...savedAddress, userId })
      );

      localStorage.setItem(
        "customer_address_Id",
        savedAddress.id
      );

      localStorage.setItem("order_user_Id", userId);

      localStorage.setItem(
        "customer_name",
        `${savedAddress.firstName ?? ""} ${
          savedAddress.lastName ?? ""
        }`.trim()
      );

      // Only allow navigation back to the local checkout page.
     if (returnTo === "/checkout") {
  const query = new URLSearchParams({
    addressId: savedAddress.id,
  });

  window.location.assign(`/checkout?${query.toString()}`);
  return;
}

// If opened from another page, stay on this form.
setAddresses(refreshed.data);
setEditingId(null);
setForm({ ...emptyAddress });
    } catch (error) {
      console.error("Failed to save customer address:", error);
      setError("Unable to save the address. Please try again.");
    }
  });
}

async function refreshAddresses() {
  const result = await getRegisteredCustomerAddresses();

  if (result.success) {
    setAddresses(result.data);
  }
}

function startEditing(address: CustomerAddress) {
  setForm({
    ...emptyAddress,
    firstName: address.firstName ?? "",
    lastName: address.lastName ?? "",
    email: "",
    mobNo: address.mobNo ?? "",
    addressLine1: address.addressLine1 ?? "",
    addressLine2: address.addressLine2 ?? "",
    city: address.city ?? "",
    state: address.state ?? "",
    zipCode: address.zipCode ?? "",
    country: "India",
    portal: "",
    staircase: "",
    floor: "",
    door: "",
    deliveryNotes: address.deliveryNotes ?? "",
    isDefault: address.isDefault ?? false,
  });

  setEditingId(address.id);
  setError("");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleDelete(addressId: string) {
  if (!window.confirm("Are you sure you want to delete this address?")) {
    return;
  }

  setError("");

  startTransition(async () => {
    try {
      const result = await deleteRegisteredCustomerAddress(addressId);

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (editingId === addressId) {
        setEditingId(null);
        setForm({ ...emptyAddress });
      }

      await refreshAddresses();
    } catch {
      setError("Unable to delete the address.");
    }
  });
}

function handleSetDefault(addressId: string) {
  setError("");

  startTransition(async () => {
    try {
      const result =
        await setRegisteredCustomerDefaultAddress(addressId);

      if (!result.success) {
        setError(result.error);
        return;
      }

      await refreshAddresses();
    } catch {
      setError("Unable to change the default address.");
    }
  });
}

function selectSavedAddress(address: CustomerAddress) {
  localStorage.setItem(
    "customer_address",
    JSON.stringify({ ...address, userId })
  );

  localStorage.setItem("customer_address_Id", address.id);
  localStorage.setItem("order_user_Id", userId);

  localStorage.setItem(
    "customer_name",
    `${address.firstName ?? ""} ${address.lastName ?? ""}`.trim()
  );

  const query = new URLSearchParams({
    addressId: address.id,
  });

  window.location.assign(`/checkout?${query.toString()}`);
}



  if (loading) {
    return <p className="py-8 text-center">Loading address...</p>;
  }

 

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
  <h1 className="text-2xl font-bold text-gray-900">
  {editingId ? "Edit delivery address" : "Add delivery address"}
</h1>

      <p className="mt-2 mb-6 text-sm text-gray-600">
        Save your delivery details and continue to checkout.
      </p>

      {error && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {error}
        </p>
      )}

      <form onSubmit={save} className="space-y-4">
     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
  {fields.map((field) => (
    <label key={field.name} className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && " *"}
      </span>

      <input
        name={field.name}
        type={field.type ?? "text"}
        value={String(form[field.name] ?? "")}
        required={field.required ?? false}
        maxLength={250}
        onChange={change}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  ))}

  {deliveryFields.map((field) => (
    <label key={field.name} className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {field.label}
      </span>

      <input
        name={field.name}
        type="text"
        value={String(form[field.name] ?? "")}
        maxLength={250}
        onChange={change}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  ))}
</div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            Delivery instructions
          </span>

          <textarea
            name="deliveryNotes"
            rows={3}
            maxLength={1000}
            value={form.deliveryNotes ?? ""}
            onChange={change}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.isDefault === true}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                isDefault: event.target.checked,
              }))
            }
          />
          Set as my default delivery address
        </label>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
          {isPending
  ? "Saving..."
  : editingId
    ? "Save changes and return"
    : "Save address and return"}
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => router.push(returnTo)}
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel1
          </button>
        </div>
      </form>

      {/* Previously saved addresses */}
{/* Previously saved addresses */}
<div className="mt-8 border-t border-gray-200 pt-6">
  <div className="mb-4 flex items-center justify-between">
    <h2 className="text-lg font-semibold text-gray-900">
      Saved addresses
    </h2>

    <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
      {addresses.length}
    </span>
  </div>

  {editingId && (
  <button
    type="button"
    disabled={isPending}
    onClick={() => {
      setEditingId(null);
      setForm({ ...emptyAddress });
    }}
    className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
  >
    Cancel editing
  </button>
)}

  {addresses.length === 0 ? (
    <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5 text-center text-sm text-gray-500">
      No saved addresses yet.
    </p>
  ) : (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {addresses.map((address) => (
        <article
          key={address.id}
          className="rounded-xl border border-gray-200 bg-gray-50 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-900">
                {[
                  address.firstName,
                  address.lastName,
                ]
                  .filter(Boolean)
                  .join(" ") ||
                  address.name ||
                  "Delivery address"}
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                {address.addressLine1}
              </p>

              {address.addressLine2 && (
                <p className="text-sm text-gray-600">
                  {address.addressLine2}
                </p>
              )}

              <p className="text-sm text-gray-600">
                {[
                  address.city,
                  address.state,
                  address.zipCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              {address.country && (
                <p className="text-sm text-gray-600">
                  {address.country}
                </p>
              )}

              {address.mobNo && (
                <p className="mt-2 text-sm text-gray-600">
                  Phone: {address.mobNo}
                </p>
              )}
            </div>

            {address.isDefault && (
              <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                Default
              </span>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-200 pt-4">
            {!address.isDefault && (
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSetDefault(address.id)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                Make default
              </button>
            )}

            <button
              type="button"
              disabled={isPending}
              onClick={() => startEditing(address)}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 disabled:opacity-50"
            >
              Edit
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => handleDelete(address.id)}
              className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Delete
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => selectSavedAddress(address)}
              className="ml-auto text-sm font-semibold text-green-700 hover:text-green-900 disabled:opacity-50"
            >
              Use this address
            </button>
          </div>
        </article>
      ))}
    </div>
  )}
</div>
    </section>
  );
}