 
import { getDepartments } from "../../action/department/getDepartments";
import DepartmentTable from "./components/DepartmentTable";
 

export default async function Page() {
  const departments = await getDepartments();

  return <DepartmentTable departments={departments} />;
}