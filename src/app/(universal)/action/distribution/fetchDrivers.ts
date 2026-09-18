"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { userDashboardType } from "@/lib/types/userDashboardType";


export async function fetchDrivers(): Promise<userDashboardType[]> {
  const data: userDashboardType[] = [];

  const snapshot = await adminDb
    .collection("employees")
    .where("roleId", "==", "driver")
    .get();

  snapshot.forEach((doc) => {
    const docData = doc.data();

    data.push({
      id: doc.id,

      // ==========================================
      // EMPLOYEE BASIC INFORMATION
      // ==========================================
      fullName: [
        docData.firstName || "",
        docData.lastName || "",
      ]
        .filter(Boolean)
        .join(" "),

      username: docData.employeeCode || "",

      email: docData.email || "",
      mobile: docData.phone || "",

      // Employee collection does not store password
      hashedPassword: "",

      // ==========================================
      // ROLE
      // ==========================================
      role: docData.role || "Driver",
      userType: "employee",

      // Employee status
      status: docData.status || "ACTIVE",

      isAdmin: false,
      isVerfied: true,

      // ==========================================
      // EMPLOYEE ID
      // ==========================================
      employeeId: doc.id,

      // ==========================================
      // DEPARTMENT
      // ==========================================
      department: docData.departmentName || "",

      // ==========================================
      // ADDRESS / NOTES
      // ==========================================
      address: docData.address || "",
      notes: docData.notes || "",

      // ==========================================
      // TIMESTAMPS
      // ==========================================
      createdAt:
        docData.createdAt?.toDate?.()?.toISOString() ||
        docData.createdAt ||
        undefined,

      updatedAt:
        docData.updatedAt?.toDate?.()?.toISOString() ||
        docData.updatedAt ||
        undefined,
    });
  });

  return data;
}
 


export async function fetchDrivers_old(): Promise<userDashboardType[]> {
  const data: userDashboardType[] = [];

  const snapshot = await adminDb
    .collection("users")
   // .where("department", "==", "DRIVER") // or "Driver" depending on your data
  //  .where("status", "==", "active")
   // .orderBy("fullName")
    .get();

  snapshot.forEach((doc) => {
    const docData = doc.data();

    data.push({
      id: doc.id,

      fullName: docData.fullName || "",
      username: docData.username || "",

      email: docData.email || "",
      mobile: docData.mobile || "",

      hashedPassword: docData.hashedPassword || "",

      role: docData.role || "user",
       userType:  docData.userType || "",
      status: docData.status || "active",

      isAdmin: docData.isAdmin ?? false,
      isVerfied: docData.isVerified ?? false,

      employeeId: docData.employeeId || "",

      department: docData.department || "",

      address: docData.address || "",

      notes: docData.notes || "",

      createdAt:
        docData.createdAt?.toDate?.()?.toISOString() || undefined,

      updatedAt:
        docData.updatedAt?.toDate?.()?.toISOString() || undefined,
    });
  });

  return data;
}