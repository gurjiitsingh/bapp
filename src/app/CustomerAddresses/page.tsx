
"use client";

import { useEffect, useState, useTransition, type FormEvent } from "react";

import {
  getRegisteredCustomerAddresses,
  addRegisteredCustomerAddress,
  updateRegisteredCustomerAddress,
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
  | "door"
  | "deliveryNotes";

const fields: {
  name: AddressField;
  label: string;
  required?: boolean;
  full?: boolean;
  placeholder?: string;
}[] = [
  { name: "firstName", label: "First name", required: true },
  { name: "lastName", label: "Last name", required: true },
  { name: "email", label: "Email address", placeholder: "name@example.com" },
  { name: "mobNo", label: "Mobile number", required: true },
  {
    name: "addressLine1",
    label: "Address line 1",
    required: true,
    full: true,
    placeholder: "House number and street",
  },
  {
    name: "addressLine2",
    label: "Address line 2",
    full: true,
    placeholder: "Apartment, building, etc.",
  },
  { name: "city", label: "City", required: true },
  { name: "state", label: "State / Province" },
  { name: "zipCode", label: "Postal code", required: true },
  { name: "country", label: "Country", required: true },
];

const deliveryFields: {
  name: AddressField;
  label: string;
}[] = [
  { name: "portal", label: "Portal / Entrance" },
  { name: "staircase", label: "Staircase" },
  { name: "floor", label: "Floor" },
  { name: "door", label: "Door / Apartment" },
];

export default function CustomerAddressesPage() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [form, setForm] =
    useState<CreateCustomerAddressInput>({ ...emptyAddress });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadAddresses() {
    setLoading(true);

    try {
      const result = await getRegisteredCustomerAddresses();

      if (!result.success) {
        setError(result.error);
        return;
      }

      setAddresses(result.data);
      setError("");
    } catch {
      setError("Unable to load addresses. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAddresses();
  }, []);

  function updateField(name: AddressField, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm({ ...emptyAddress });
    setEditingId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    startTransition(async () => {
      try {
        const result = editingId
          ? await updateRegisteredCustomerAddress(editingId, form)
          : await addRegisteredCustomerAddress(form);

        if (!result.success) {
          setError(result.error);
          return;
        }

        setMessage(
          editingId
            ? "Address updated successfully."
            : "Address added successfully."
        );

        resetForm();
        await loadAddresses();
      } catch {
        setError("Unable to save the address. Please try again.");
      }
    });
  }

  function startEditing(address: CustomerAddress) {
    setForm({
      firstName: address.firstName ?? "",
      lastName: address.lastName ?? "",
      name: address.name ?? "",
      email: address.email ?? "",
      mobNo: address.mobNo ?? "",
      addressLine1: address.addressLine1 ?? "",
      addressLine2: address.addressLine2 ?? "",
      city: address.city ?? "",
      state: address.state ?? "",
      zipCode: address.zipCode ?? "",
      country: address.country ?? "India",
      portal: address.portal ?? "",
      staircase: address.staircase ?? "",
      floor: address.floor ?? "",
      door: address.door ?? "",
      deliveryNotes: address.deliveryNotes ?? "",
      isDefault: address.isDefault ?? false,
    });

    setEditingId(address.id);
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(addressId: string) {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    setMessage("");
    setError("");

    startTransition(async () => {
      try {
        const result =
          await deleteRegisteredCustomerAddress(addressId);

        if (!result.success) {
          setError(result.error);
          return;
        }

        if (editingId === addressId) {
          resetForm();
        }

        setMessage("Address deleted successfully.");
        await loadAddresses();
      } catch {
        setError("Unable to delete the address.");
      }
    });
  }

  function handleSetDefault(addressId: string) {
    setMessage("");
    setError("");

    startTransition(async () => {
      try {
        const result =
          await setRegisteredCustomerDefaultAddress(addressId);

        if (!result.success) {
          setError(result.error);
          return;
        }

        setMessage("Default address updated.");
        await loadAddresses();
      } catch {
        setError("Unable to change the default address.");
      }
    });
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          My Addresses
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your delivery addresses for faster checkout.
        </p>
      </header>

      {message && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingId ? "Edit address" : "Add a new address"}
          </h2>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Cancel editing
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div
                key={field.name}
                className={field.full ? "sm:col-span-2" : ""}
              >
                <label
                  htmlFor={field.name}
                  className="mb-1.5 block text-sm font-medium text-gray-700"
                >
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type={field.name === "email" ? "email" : "text"}
                  required={field.required}
                  value={String(form[field.name] ?? "")}
                  onChange={(event) =>
                    updateField(field.name, event.target.value)
                  }
                  placeholder={field.placeholder ?? field.label}
                  maxLength={250}
                  autoComplete={
                    field.name === "firstName"
                      ? "given-name"
                      : field.name === "lastName"
                        ? "family-name"
                        : field.name === "email"
                          ? "email"
                          : field.name === "mobNo"
                            ? "tel"
                            : field.name === "addressLine1"
                              ? "address-line1"
                              : field.name === "addressLine2"
                                ? "address-line2"
                                : field.name === "city"
                                  ? "address-level2"
                                  : field.name === "state"
                                    ? "address-level1"
                                    : field.name === "zipCode"
                                      ? "postal-code"
                                      : field.name === "country"
                                        ? "country-name"
                                        : "off"
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            ))}
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-800">
              Additional delivery details
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {deliveryFields.map((field) => (
                <div key={field.name}>
                  <label
                    htmlFor={field.name}
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    {field.label}
                  </label>

                  <input
                    id={field.name}
                    name={field.name}
                    value={String(form[field.name] ?? "")}
                    onChange={(event) =>
                      updateField(field.name, event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="deliveryNotes"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              Delivery instructions
            </label>

            <textarea
              id="deliveryNotes"
              name="deliveryNotes"
              rows={3}
              maxLength={1000}
              value={form.deliveryNotes ?? ""}
              onChange={(event) =>
                updateField("deliveryNotes", event.target.value)
              }
              placeholder="Optional instructions for the delivery person"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isDefault === true}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isDefault: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            Set as my default delivery address
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending
                ? "Saving..."
                : editingId
                  ? "Update address"
                  : "Save address"}
            </button>

            {editingId && (
              <button
                type="button"
                disabled={isPending}
                onClick={resetForm}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Saved addresses
          </h2>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
            {addresses.length}
          </span>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
            Loading your addresses...
          </div>
        ) : addresses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <p className="font-medium text-gray-800">
              No saved addresses yet
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Add your first address using the form above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {addresses.map((address) => (
              <article
                key={address.id}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
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

                    <p className="mt-1 text-sm text-gray-600">
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

                <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-100 pt-4">
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
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
