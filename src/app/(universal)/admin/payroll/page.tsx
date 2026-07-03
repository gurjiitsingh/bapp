import { adminDb } from "@/lib/firebaseAdmin";
import PayrollClient from "./PayrollClient";

export default async function Page() {
  const snapshot = await adminDb
    .collection("employeePayroll")
    .orderBy("createdAt", "desc")
    .get();

  const payrolls = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  
  return <div></div>
  // return <PayrollClient initialData={payrolls} />;
}