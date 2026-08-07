import { getCustomerSaleReport } from '@/app/(universal)/action/distribution/sale/getCustomerSaleReport';
import CustomerSaleReportTable from './CustomerSaleReportTable';

type Props = {
  params: Promise<{ customerId: string }>;
};

export default async function Page({
  params,
}: Props) {
  const { customerId } = await params;

  // Load all sales for this customer
  const rows =
    await getCustomerSaleReport({
      customerId,
    });

  const customerName =
    rows[0]?.customerName ||
    'Customer';

  return (
    <CustomerSaleReportTable
      customerId={customerId}
      customerName={customerName}
      initialRows={rows}
    />
  );
}