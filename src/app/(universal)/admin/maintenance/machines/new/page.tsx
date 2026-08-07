 

import { getDepartments } from "@/app/(universal)/action/department/getDepartments";
import MachineForm from "../MachineForm";

type Department = {
  id: string;
  name: string;
};

export default async function NewMachinePage() {
  /**
   * =========================================================
   * FETCH DEPARTMENTS
   * =========================================================
   */

  const result: any =
    await getDepartments();

  /**
   * =========================================================
   * HANDLE DIFFERENT POSSIBLE RETURN STRUCTURES
   *
   * If getDepartments() directly returns an array:
   * [
   *   { id: "...", name: "Production" }
   * ]
   *
   * If it returns:
   * { departments: [...] }
   *
   * or:
   * { data: [...] }
   *
   * this also handles those.
   * =========================================================
   */

  const rawDepartments = Array.isArray(result)
    ? result
    : result?.departments ??
      result?.data ??
      [];

  /**
   * =========================================================
   * NORMALIZE DEPARTMENT DATA
   * =========================================================
   */

  const departments: Department[] =
    rawDepartments.map(
      (department: any) => ({
        id:
          department.id ??
          department.departmentId ??
          "",

        name:
          department.name ??
          department.departmentName ??
          "",
      })
    ).filter(
      (department: Department) =>
        department.id && department.name
    );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="border-b bg-white px-6 py-4">
        <h1 className="text-2xl font-semibold">
          Add Machine
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Add a machine to the maintenance
          system.
        </p>
      </div>

      {/* =====================================================
          MACHINE FORM
      ====================================================== */}

      <MachineForm
        departments={departments}
      />

    </div>
  );
}