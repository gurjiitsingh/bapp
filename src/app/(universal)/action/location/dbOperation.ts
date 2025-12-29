// /app/(universal)/action/location/dbOperation.ts
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { locationType } from "@/lib/types/locationType";
import { FieldValue } from "firebase-admin/firestore";




export async function addNewLocation(formData: FormData) {
  try {
    const deliveryCost = Number(formData.get("deliveryCost"));
    const minSpend = Number(formData.get("minSpend"));

    // Optional: may be null / undefined
    const deliveryDistanceRaw = formData.get("deliveryDistance");
    const deliveryDistance =
      deliveryDistanceRaw !== null && deliveryDistanceRaw !== ""
        ? Number(deliveryDistanceRaw)
        : null;

    const docRef = await adminDb.collection("locations").add({
      name: formData.get("name"),
      city: formData.get("city"),
      state: formData.get("state"),

      deliveryCost,    // number ✔
      minSpend,        // number ✔
      deliveryDistance, // number | null ✔

      notes: formData.get("notes") ?? "",

      createdAt: FieldValue.serverTimestamp(),
    });

    return { id: docRef.id };
  } catch (e) {
    console.error("Error adding location:", e);
    return { errors: true };
  }
}





export async function fetchLocations() {
  const snapshot = await adminDb
    .collection("locations")
    .orderBy("name")
    .get();

  return snapshot.docs.map(doc => {
    const data = doc.data();

    return {
      id: doc.id,
      name: data.name ?? "",
      city: data.city ?? "",
      state: data.state ?? "",
      deliveryCost: Number(data.deliveryCost ?? 0),
      minSpend: Number(data.minSpend ?? 0),
      deliveryDistance:
        data.deliveryDistance !== undefined
          ? Number(data.deliveryDistance)
          : null,
      notes: data.notes ?? "",

      // 👇 convert Timestamp → number (ms)
      createdAt: data.createdAt?.toMillis?.() ?? null,
    };
  });
}



export async function deleteLocation(id: string) {
  await adminDb.collection("locations").doc(id).delete();
}



export async function getLocationById(id: string): Promise<locationType | null> {
  const doc = await adminDb.collection("locations").doc(id).get();

  if (!doc.exists) return null;

  const data = doc.data()!;

  return {
    id: doc.id,
    name: data.name,
    city: data.city,
    state: data.state,
    deliveryCost: Number(data.deliveryCost),
    minSpend: Number(data.minSpend),
    deliveryDistance: data.deliveryDistance ?? null,
    notes: data.notes ?? "",
    createdAt: data.createdAt?.toMillis?.() ?? null,
  };
}



export async function updateLocation(id: string, formData: FormData) {
  await adminDb.collection("locations").doc(id).update({
    name: formData.get("name"),
    city: formData.get("city"),
    state: formData.get("state"),
    deliveryCost: Number(formData.get("deliveryCost")),
    minSpend: Number(formData.get("minSpend")),
    deliveryDistance:
      formData.get("deliveryDistance")
        ? Number(formData.get("deliveryDistance"))
        : null,
    notes: formData.get("notes") ?? "",
  });

  return { success: true };
}
