import CustomerAddressesPage from "@/custom/address/CustomerAddressesPage";
import { Suspense } from "react";
 

export default function AddressesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-8 text-center text-sm text-gray-500">
          Loading addresses...
        </div>
      }
    >
      <CustomerAddressesPage />
    </Suspense>
  );
}