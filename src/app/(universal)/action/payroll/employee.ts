"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { Employee } from "@/lib/types/payroll/EmployeeTypes";

const EMPLOYEE_COLLECTION = "employees";

export async function createEmployee(
  employee: Employee
): Promise<string> {
  const docRef = adminDb
    .collection(EMPLOYEE_COLLECTION)
    .doc();

  await docRef.set({
    ...employee,
    id: docRef.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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

  return doc.data() as Employee;
}

export async function getEmployees(): Promise<Employee[]> {
  const snapshot = await adminDb
    .collection(EMPLOYEE_COLLECTION)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    ...(doc.data() as Employee),
    id: doc.id,
  }));
}

export async function updateEmployee(
  employeeId: string,
  data: Partial<Employee>
): Promise<void> {
  await adminDb
    .collection(EMPLOYEE_COLLECTION)
    .doc(employeeId)
    .update({
      ...data,
      updatedAt: new Date().toISOString(),
    });
}

export async function deleteEmployee(
  employeeId: string
): Promise<void> {
  await adminDb
    .collection(EMPLOYEE_COLLECTION)
    .doc(employeeId)
    .delete();
}