import { adminDb } from "@/lib/firebaseAdmin";
import EmployeeClient from "./EmployeeClient";
 

export default async function Page() {
  const snapshot = await adminDb
    .collection("employees")
    .orderBy("createdAt", "desc")
    .get();

  const employees = snapshot.docs.map((doc) => ({
    ...(doc.data() as any),
    id: doc.id,
  }));

  return (
    <EmployeeClient initialData={employees} />
  );
}