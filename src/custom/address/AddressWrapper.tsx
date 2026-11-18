"use server"

import { auth } from "@/auth";
import AddressES from "./AddressES";
import CustomerAddressBook from "./CustomerAddressBook";
import { getCustomerAddresses } from "@/modules/customer-account/addresses/actions";

export default async function AddressWrapper() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role;

 

  if (role !== "user" || !userId) {
    return <div className="text-2xl">Please Login as customer</div>;
  }

  const addresses = await getCustomerAddresses(userId);

  return (
    <CustomerAddressBook
      userId={userId}
      addresses={addresses}
    />
  );
}
