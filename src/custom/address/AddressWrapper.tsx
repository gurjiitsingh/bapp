
import { auth } from "@/auth";
import AddressES from "./AddressES";
import CustomerAddressBook from "./CustomerAddressBook";
import { getCustomerAddresses } from "@/modules/customer-account/addresses/actions";

export default async function AddressWrapper() {
  const session = await auth();
  const userId = session?.user?.id;
  const role = session?.user?.role;

// Guests and non-customer users use the checkout address form.
if (role !== "user" || !userId) {
return <AddressES />;
}

// Load addresses saved to this customer's account.
const addresses = await getCustomerAddresses(userId);

// No saved address: capture the first address.
// if (!addresses || addresses.length === 0) {
// return <AddressES />;
// }

  

  return (
    <CustomerAddressBook
      userId={userId}
      addresses={addresses}
    />
  );
}
