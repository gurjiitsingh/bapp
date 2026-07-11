import { getDepartments } from "@/app/(universal)/action/department/getDepartments";
import DepartmentsPage from "./DepartmentsPage";
 

export default async function Page() {
  const departments = await getDepartments();

  return (
    <DepartmentsPage departments={departments} />
  );
}