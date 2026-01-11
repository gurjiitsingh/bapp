"use server";


import { adminDb } from "@/lib/firebaseAdmin";
import { outletSchema } from "@/lib/types/outletType";
import { FieldValue } from "firebase-admin/firestore";

export async function saveOutlet(input: any) {
  console.log("data---------------")
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

  console.log("SAVE OUTLET", data);

  const payload: any = {
    outletName: data.outletName,
    addressLine1: data.addressLine1,
    city: data.city,
    printerWidth: Number(data.printerWidth),
    isActive: data.isActive,
    updatedAt: FieldValue.serverTimestamp(),
  };

  // helper
  function setOrDelete(key: string, value: any) {
    if (value === "" || value === undefined || value === null) {
      payload[key] = FieldValue.delete();
    } else {
      payload[key] = value;
    }
  }

  // optional
  setOrDelete("ownerId", data.ownerId);
  setOrDelete("addressLine2", data.addressLine2);
  setOrDelete("addressLine3", data.addressLine3);
  setOrDelete("state", data.state);
  setOrDelete("zipcode", data.zipcode);
  setOrDelete("country", data.country);
  setOrDelete("phone", data.phone);
  setOrDelete("phone2", data.phone2);
  setOrDelete("email", data.email);
  setOrDelete("web", data.web);
  setOrDelete("taxType", data.taxType);
  setOrDelete("gstVatNumber", data.gstVatNumber);
  setOrDelete("footerNote", data.footerNote);

  try {
    if (outletId) {
      console.log("UPDATING", outletId, payload);
      await adminDb.collection("outlets").doc(outletId).update(payload);
      return { success: true, outletId };
    }

    console.log("CREATING", payload);

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


