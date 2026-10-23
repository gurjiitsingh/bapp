"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  getRegisteredCustomerAddresses,
  addRegisteredCustomerAddress,
  updateRegisteredCustomerAddress,
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

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    startTransition(async () => {
      try {
        const result = editId
          ? await updateRegisteredCustomerAddress(editId, form)
          : await addRegisteredCustomerAddress(form);

        if (!result.success) {
          setError(result.error);
          return;
        }

        // Reload the saved address from the server.
        const refreshed = await getRegisteredCustomerAddresses();

        if (!refreshed.success) {
          setError(
            "Address saved, but we could not reload it. Please return to checkout and refresh."
          );
          return;
        }

        const savedAddress = editId
          ? refreshed.data.find((item) => item.id === editId)
          : [...refreshed.data].reverse().find(
              (item) =>
                item.addressLine1 === form.addressLine1 &&
                item.mobNo === form.mobNo &&
                item.city === form.city
            );

        if (!savedAddress) {
          setError(
            "Address saved, but its ID could not be determined. Please select it at checkout."
          );
          router.push(returnTo);
          return;
        }

        // Preserve the keys used by your existing checkout flow.
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

        // Return to the existing checkout page.
        router.push(
          `${returnTo}?addressId=${encodeURIComponent(savedAddress.id)}`
        );

        router.refresh();
      } catch {
        setError("Unable to save the address. Please try again.");
      }
    });
  }

  if (loading) {
    return <p className="py-8 text-center">Loading address...</p>;
  }

  const fields = [
    { name: "firstName", label: "First name", required: true },
    { name: "lastName", label: "Last name", required: true },
    { name: "email", label: "Email", type: "email" },
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
    { name: "country", label: "Country", required: true },
    { name: "portal", label: "Portal / Entrance" },
    { name: "staircase", label: "Staircase" },
    { name: "floor", label: "Floor" },
    { name: "door", label: "Door / Apartment" },
  ] as const;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
      <h1 className="text-2xl font-bold text-gray-900">
        {editId ? "Edit delivery address" : "Add delivery address"}
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
                {"required" in field && field.required && " *"}
              </span>

              <input
                name={field.name}
                type={"type" in field ? field.type : "text"}
                value={String(form[field.name] ?? "")}
                required={"required" in field && field.required}
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
              : editId
                ? "Save changes and return"
                : "Save address and return"}
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => router.push(returnTo)}
            className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}