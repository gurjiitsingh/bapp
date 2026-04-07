"use server";

import { adminDb } from "@/lib/firebaseAdmin";

export async function addNewClient(formData: FormData) {
  try {
    const clientId = formData.get("clientId") as string;

    const apiKey = formData.get("apiKey") as string;
    const applicationId = formData.get("applicationId") as string;
    const projectId = formData.get("projectId") as string;

    // 🔥 NEW FIELDS
    const status = formData.get("status") as string;
    const renewDate = formData.get("renewDate") as string;
    const warningDays = Number(formData.get("warningDays"));

    const maxWaiters = Number(formData.get("maxWaiters"));
    const maxPOS = Number(formData.get("maxPOS"));

    const docRef = adminDb.collection("clients").doc(clientId);

    const existing = await docRef.get();
    if (existing.exists) {
      return { errors: { clientId: "Client already exists" } };
    }

    const clientKey = crypto.randomUUID();

    await docRef.set({
      clientId,
      clientKey,

      apiKey,
      applicationId,
      projectId,

      status,
      renewDate: new Date(renewDate), // 🔥 Timestamp
      warningDays,

      maxWaiters,
      maxPOS,

      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return {
      message: {
        success: "Client Created",
        clientKey,
      },
    };
  } catch (e) {
    console.error(e);
    return { errors: "Something went wrong" };
  }
}


export async function getAllClients() {
  const snapshot = await adminDb.collection("clients").get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();

    return {
      clientId: data.clientId,
      clientKey: data.clientKey,
      apiKey: data.apiKey,
      applicationId: data.applicationId,
      projectId: data.projectId,

      status: data.status,

      // ✅ FIX: convert Timestamp → string
      renewDate: data.renewDate?.toDate().toISOString(),

      warningDays: data.warningDays,
      maxWaiters: data.maxWaiters,
      maxPOS: data.maxPOS,

      isActive: data.isActive,

      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
    };
  });
}


export async function updateClient(clientId: string, data: any) {
  if (data.renewDate) {
    data.renewDate = new Date(data.renewDate);
  }

  data.updatedAt = new Date();

  await adminDb.collection("clients").doc(clientId).update(data);

  return { success: true };
}


export async function getClientById(clientId: string) {
  const doc = await adminDb.collection("clients").doc(clientId).get();
  const data = doc.data();

  if (!data) return null;

  return {
    clientId: data.clientId,
    clientKey: data.clientKey,
    apiKey: data.apiKey,
    applicationId: data.applicationId,
    projectId: data.projectId,

    status: data.status,

    // ✅ FIX ALL TIMESTAMPS
    renewDate: data.renewDate?.toDate().toISOString(),
    createdAt: data.createdAt?.toDate().toISOString(),
    updatedAt: data.updatedAt?.toDate().toISOString(),

    warningDays: data.warningDays,
    maxWaiters: data.maxWaiters,
    maxPOS: data.maxPOS,

    isActive: data.isActive,
  };
}