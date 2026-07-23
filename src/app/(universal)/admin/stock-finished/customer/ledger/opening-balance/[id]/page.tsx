import { getCustomerAccount } from "@/app/(universal)/action/stock-finished/customer/getCutomerAccount";
import OpeningBalanceForm from "./OpeningBalanceForm";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch customer account
  const account = await getCustomerAccount(id);

  if (!account) {
    return <div>Customer not found.</div>;
  }

  return (
    <OpeningBalanceForm
      customerId={id}
      account={account}
    />
  );
}