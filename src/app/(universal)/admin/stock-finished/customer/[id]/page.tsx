
import { getCustomerAccount } from "@/app/(universal)/action/stock-finished/customer/getCutomerAccount";
import CustomerAccountView from "../components/CustomerAccountView";


 


export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const account = await getCustomerAccount(id);

  return (
    <CustomerAccountView 
      account={account}
      customerId ={id}   // ✅ PASS HERE
    />
  );
}