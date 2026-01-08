"use server";


import { adminDb } from "@/lib/firebaseAdmin";
import { outletSchema } from "@/lib/types/outletType";
import { FieldValue } from "firebase-admin/firestore";

export async function saveOutlet(input: any) {
  const parsed = outletSchema.safeParse(input);

  if (!parsed.success) {
    const errors: Record<string, string> = {};
    parsed.error.issues.forEach((i) => {
      errors[i.path[0] as string] = i.message;
    });
    return { errors };
  }

  const data = parsed.data;
  const outletId = data.outletId;

  const payload = {
    ownerId: data.ownerId || null,

    // DISPLAY
    outletName: data.outletName,

    // ADDRESS
    addressLine1: data.addressLine1,
    addressLine2: data.addressLine2 || null,
    addressLine3: data.addressLine3 || null,     // ⭐ NEW
    city: data.city,
    state: data.state || null,
    zipcode: data.zipcode || null,
    country: data.country || "India",

    // CONTACT
    phone: data.phone || null,
    phone2: data.phone2 || null,
    email: data.email || null,                   // ⭐ already in schema
    web: data.web || null,                       // ⭐ NEW

    // TAX
    taxType: data.taxType || null,
    gstVatNumber: data.gstVatNumber || null,

    // PRINTER
    printerWidth: Number(data.printerWidth),
    footerNote: data.footerNote || null,

    // STATUS
    isActive: data.isActive,

    // META
    updatedAt: FieldValue.serverTimestamp(),
  };

  try {
    if (outletId) {
      await adminDb.collection("outlets").doc(outletId).update(payload);
      return { success: true, outletId };
    }

    const docRef = await adminDb.collection("outlets").add({
      ...payload,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true, outletId: docRef.id };
  } catch (error) {
    console.error("Outlet save failed:", error);
    return { errors: { general: "Firestore error" } };
  }
}




// app/(universal)/action/outlet/fetchOutlet.ts


export async function fetchOutletInternal() {
  const snap = await adminDb.collection("outlets").limit(1).get();
  if (snap.empty) return null;

  const doc = snap.docs[0];

  return {
    outletId: doc.id,
    ...doc.data(),
  };
}



export async function deleteOutlet(outletId: string) {
  if (!outletId) {
    return { errors: { outletId: "Outlet ID is required" } };
  }

  try {
    const ref = adminDb.collection("outlets").doc(outletId);
    const snap = await ref.get();

    if (!snap.exists) {
      return { errors: { general: "Outlet not found" } };
    }

    // 🔒 SAFETY: single-outlet system guard
    await ref.delete();

    return { success: true };
  } catch (error) {
    console.error("❌ Outlet delete failed:", error);
    return { errors: { general: "Failed to delete outlet" } };
  }
}


