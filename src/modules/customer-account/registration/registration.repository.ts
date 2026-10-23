import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export type NewCustomer = {
  fullName: string;
  email: string;
  mobile: string;
  hashedPassword: string;
};

export async function findCustomerByEmail(email: string) {
  return adminDb
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();
}

export async function findCustomerByMobile(mobile: string) {
  return adminDb
    .collection("users")
    .where("mobile", "==", mobile)
    .limit(1)
    .get();
}

export async function createCustomer(data: NewCustomer) {
  const customerRef = adminDb.collection("users").doc();

  await customerRef.create({
    fullName: data.fullName,
    username: "",
    email: data.email,
    mobile: data.mobile,
    hashedPassword: data.hashedPassword,

    // Customer account only. Never accept this role from the form.
    role: "user",
    accountType: "customer",

    status: "active",
    active: true,
    isVerified: false,

    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return customerRef.id;
}