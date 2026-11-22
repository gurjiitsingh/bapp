'use server';

import { hashPassword } from "@/lib/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { TuserSchem, userType } from "@/lib/types/userType";
import { FieldValue } from "firebase-admin/firestore";
import admin from 'firebase-admin';



export async function deletePosUser(id: string): Promise<{ message: { success: string } }> {
  await adminDb.collection("posUsers").doc(id).delete();
  return { message: { success: "ok" } };
}