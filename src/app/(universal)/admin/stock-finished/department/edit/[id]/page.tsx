import { fetchManagers } from "@/app/(universal)/action/department/fetchManagers";
import { adminDb } from "@/lib/firebaseAdmin";
import EditDepartmentForm from "../editDepartmentForm";
 

type TDepartmentForm = {
  id?: string;

  name: string;
  code: string;
  type: "PRODUCTION" | "SERVICE";
  description?: string;
 employeeCount: number;
  managerId?: string;
  managerName?: string;

  isActive: boolean;
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ FIX

  const doc = await adminDb
    .collection("departments")
    .doc(id)
    .get();

  

  const departmentData = doc.data();

if (!doc.exists || !departmentData) {
  return <div>Department not found</div>;
}

const department: TDepartmentForm = {
  id,

  name: departmentData.name || "",
  code: departmentData.code || "",
  type: departmentData.type || "PRODUCTION",
  description: departmentData.description || "",
 employeeCount:  departmentData.employeeCount,
  managerId: departmentData.managerId || "",
  managerName: departmentData.managerName || "",

  isActive: departmentData.isActive ?? true,
};

  const managers = await fetchManagers();

 return (
  <EditDepartmentForm
    initialData={department}
    employees={managers.map((m) => ({
      id: m.id,
      name: m.fullName,
    }))}
  />
);
}