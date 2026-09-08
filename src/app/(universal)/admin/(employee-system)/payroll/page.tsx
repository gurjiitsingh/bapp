import { adminDb } from "@/lib/firebaseAdmin";
import PayrollClient from "./PayrollClient";

export default async function Page() {
  const snapshot = await adminDb
    .collection("payrollRuns")
    .orderBy("createdAt", "desc")
    .get();

  const payrolls = snapshot.docs.map((doc) => ({
    ...(doc.data() as any),
    id: doc.id,
  }));

  return (
    <PayrollClient initialData={payrolls} />
  );
}