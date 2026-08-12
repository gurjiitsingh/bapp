"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { EmployeePayrollProfile } from "@/lib/types/payroll/EmployeePayrollProfile";
 

const COLLECTION = "payrollEmployeeProfiles";

export async function getEmployeePayrollProfile(
  employeeId: string
): Promise<EmployeePayrollProfile | null> {
  const doc = await adminDb
    .collection(COLLECTION)
    .doc(employeeId)
    .get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as EmployeePayrollProfile;
}

export async function saveEmployeePayrollProfile(
  profile: EmployeePayrollProfile
): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(profile.employeeId)
    .set(
      {
        ...profile,
        updatedAt: new Date(),
      },
      { merge: true }
    );
}

export async function deleteEmployeePayrollProfile(
  employeeId: string
): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(employeeId)
    .delete();
}