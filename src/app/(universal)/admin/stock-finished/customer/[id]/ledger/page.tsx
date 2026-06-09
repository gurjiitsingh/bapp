import { getSupplierLedger } from "@/app/(universal)/action/stock-finished/ItemSupplier/reports/getSupplierLedger";


export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: { from?: string; to?: string };
}) {
  const { id } = await params; // ✅ FIX

  console.log("buyerId------------", id);

  const fromDate = searchParams?.from;
  const toDate = searchParams?.to;

  const res = await getSupplierLedger({
    buyerId:id,
    fromDate,
    toDate,
  });

  const data = res?.data;

  return (
    <div style={{ padding: 20 }}>
      <h2>Supplier Ledger</h2>

      {/* FILTER */}
      <form>
        <input type="date" name="from" defaultValue={fromDate} />
        <input type="date" name="to" defaultValue={toDate} />
        <button type="submit">Filter</button>
      </form>

      {/* SUMMARY */}
      <div style={{ marginTop: 20 }}>
        <p>Total Purchase: ₹ {data?.summary.totalPurchase}</p>
        <p>Total Paid: ₹ {data?.summary.totalPaid}</p>
        <p>Total Return: ₹ {data?.summary.totalReturn}</p>
        <h3>Balance: ₹ {data?.summary.balance}</h3>
      </div>

      {/* TABLE */}
      <table border={1} cellPadding={8} style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Note</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Due</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {data?.transactions.map((t: any) => (
            <tr key={t.id}>
              <td>
                {t.date
                  ? new Date(t.date).toLocaleDateString()
                  : "-"}
              </td>
              <td>{t.type}</td>
              <td>{t.note}</td>
              <td>₹ {t.totalAmount}</td>
              <td>₹ {t.paidAmount}</td>
              <td>₹ {t.dueAmount}</td>
              <td>₹ {t.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}