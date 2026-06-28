import { getCustomerAccount } from "@/app/(universal)/action/stock-finished/customer/getCutomerAccount";
import CustomerAccountView from "../../components/CustomerAccountView";
import { getCustomerLedgerByLimit } from "@/app/(universal)/action/stock-finished/customer/reports/getCustomerLedgerByLimit";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const account = await getCustomerAccount(id);

  const customerTransactions =
    await getCustomerLedgerByLimit({
      customerId: id,
    });

  return (
    <CustomerAccountView
      account={account}
      customerId={id}
      initialTransactions={
        customerTransactions.transactions
      }
    />
  );
}