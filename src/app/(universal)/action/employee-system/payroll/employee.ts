"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { Employee } from "@/lib/types/payroll/EmployeeTypes";

const EMPLOYEE_COLLECTION = "employees";

export async function createEmployee(
  employee: Employee
): Promise<string> {

  console.log("emplooye-------------------",employee)
  const docRef = adminDb
    .collection(EMPLOYEE_COLLECTION)
    .doc();

  const now = new Date().toISOString();

  await docRef.set({
    ...employee,

    // ==========================================
    // SYSTEM ID
    // ==========================================
    id: docRef.id,

    // ==========================================
    // DEPARTMENT
    // ==========================================
    // departmentId   = stable department reference
    // departmentName = display/snapshot name
    departmentId:
      employee.departmentId?.trim() || undefined,

    departmentName:
      employee.departmentName?.trim() || undefined,

    // ==========================================
    // ROLE
    // ==========================================
    // roleId = stable role reference
    // role   = human-readable role name
    roleId:
      employee.roleId?.trim() || undefined,

    role:
      employee.role?.trim() || undefined,

    // ==========================================
    // WEEKLY OFF
    // ==========================================
    // 0 = Sunday
    // 1 = Monday
    // 2 = Tuesday
    // 3 = Wednesday
    // 4 = Thursday
    // 5 = Friday
    // 6 = Saturday
    //
    // [] = employee has no weekly off
    // [0] = Sunday off
    // [0, 6] = Sunday + Saturday off
    weeklyOffDays: Array.isArray(employee.weeklyOffDays)
      ? employee.weeklyOffDays
      : [],

    // ==========================================
    // TIMESTAMPS
    // ==========================================
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

export async function createEmployee_old(
  employee: Employee
): Promise<string> {
  const docRef = adminDb
    .collection(EMPLOYEE_COLLECTION)
    .doc();

  const now = new Date().toISOString();

  await docRef.set({
    ...employee,

    id: docRef.id,

    // ==========================================
    // WEEKLY OFF
    // ==========================================
    // 0 = Sunday
    // 1 = Monday
    // 2 = Tuesday
    // 3 = Wednesday
    // 4 = Thursday
    // 5 = Friday
    // 6 = Saturday
    //
    // [] = employee has no weekly off
    // [0] = Sunday off
    // [0, 6] = Sunday + Saturday off
    weeklyOffDays: Array.isArray(employee.weeklyOffDays)
      ? employee.weeklyOffDays
      : [],

    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

export async function getEmployee(
  employeeId: string
): Promise<Employee | null> {
  const doc = await adminDb
    .collection(EMPLOYEE_COLLECTION)
    .doc(employeeId)
    .get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data() as Employee;

  return {
    ...data,
    id: doc.id,

    // Existing employees that don't have
    // weeklyOffDays get an empty array.
    weeklyOffDays: Array.isArray(data.weeklyOffDays)
      ? data.weeklyOffDays
      : [],
  };
}

export async function getEmployees(): Promise<Employee[]> {
  const snapshot = await adminDb
    .collection(EMPLOYEE_COLLECTION)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Employee;

    return {
      ...data,
      id: doc.id,

      // Backward compatibility for
      // existing employee records.
      weeklyOffDays: Array.isArray(data.weeklyOffDays)
        ? data.weeklyOffDays
        : [],
    };
  });
}

export async function updateEmployee(
  employeeId: string,
  data: Partial<Employee>
): Promise<void> {
  const updateData: Partial<Employee> & {
    updatedAt: string;
  } = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  // ==========================================
  // WEEKLY OFF
  // ==========================================
  //
  // If weeklyOffDays is supplied, save it.
  //
  // [] is valid and means:
  // "This employee has no weekly off."
  //
  if (data.weeklyOffDays !== undefined) {
    updateData.weeklyOffDays =
      Array.isArray(data.weeklyOffDays)
        ? data.weeklyOffDays
        : [];
  }

  await adminDb
    .collection(EMPLOYEE_COLLECTION)
    .doc(employeeId)
    .update(updateData);
}

export async function deleteEmployee(
  employeeId: string
): Promise<void> {
  await adminDb
    .collection(EMPLOYEE_COLLECTION)
    .doc(employeeId)
    .delete();
}