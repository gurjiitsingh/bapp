import { fetchManagers } from "@/app/(universal)/action/department/fetchManagers";
import DepartmentForm from "./DepartmentForm";

export default async function Page() {
  // 🔥 Fetch managers from users collection
  const managers = await fetchManagers();

  return (
    <DepartmentForm
      employees={managers.map((m) => ({
        id: m.id,
        name: m.fullName,
      }))}
    />
  );
}