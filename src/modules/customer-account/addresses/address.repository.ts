import "server-only";

import { adminDb } from "@/lib/firebaseAdmin";
import type {
  CreateCustomerAddressInput,
  CustomerAddress,
  UpdateCustomerAddressInput,
} from "../core/customer.types";

const DEFAULT_COLLECTION = "address";

function addressCollection(collectionName = DEFAULT_COLLECTION) {
  return adminDb.collection(collectionName);
}

function toCustomerAddress(
  id: string,
  data: Record<string, unknown>
): CustomerAddress {
  return {
    ...(data as Omit<CustomerAddress, "id">),
    id,
  } as CustomerAddress;
}

export async function listCustomerAddresses1(
  userId: string,
  collectionName = DEFAULT_COLLECTION
): Promise<CustomerAddress[]> {
  const snapshot = await addressCollection(collectionName)
    .where("userId", "==", userId)
    .get();

  const addresses = snapshot.docs.map((doc) =>
    toCustomerAddress(
      doc.id,
      doc.data() as Record<string, unknown>
    )
  );

  return addresses.sort((a, b) => {
    if (a.isDefault === b.isDefault) {
      return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
    }

    return a.isDefault ? -1 : 1;
  });
}

export async function listCustomerAddresses(
  userId: string,
  collectionName = DEFAULT_COLLECTION
): Promise<CustomerAddress[]> {
  console.log("[CustomerAddress] Authenticated userId:", userId);

  const snapshot = await addressCollection(collectionName).get();

  console.log(
    "[CustomerAddress] Total address documents:",
    snapshot.size
  );

  for (const doc of snapshot.docs) {
    const data = doc.data();

    console.log("[CustomerAddress] Document:", {
      id: doc.id,
      email: data.email,
      userId: data.userId,
      mobNo: data.mobNo,
    });
  }

  const matchingSnapshot = await addressCollection(collectionName)
    .where("userId", "==", userId)
    .get();

  console.log(
    "[CustomerAddress] Matching documents:",
    matchingSnapshot.size
  );

  return matchingSnapshot.docs.map((doc) =>
    toCustomerAddress(
      doc.id,
      doc.data() as Record<string, unknown>
    )
  );
}

export async function getCustomerAddressById(
  userId: string,
  addressId: string,
  collectionName = DEFAULT_COLLECTION
): Promise<CustomerAddress | null> {
  const doc = await addressCollection(collectionName)
    .doc(addressId)
    .get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data() as Record<string, unknown>;

  // Ownership check: knowing an address ID is not enough.
  if (data.userId !== userId) {
    return null;
  }

  return toCustomerAddress(doc.id, data);
}

export async function createCustomerAddressRecord(
  userId: string,
  input: CreateCustomerAddressInput,
  collectionName = DEFAULT_COLLECTION
): Promise<CustomerAddress> {
  const collection = addressCollection(collectionName);
  const now = new Date().toISOString();

  const existing = await collection
    .where("userId", "==", userId)
    .get();

  const makeDefault =
    input.isDefault === true || existing.empty;

  const batch = adminDb.batch();

  if (makeDefault) {
    for (const doc of existing.docs) {
      batch.update(doc.ref, {
        isDefault: false,
        updatedAt: now,
      });
    }
  }

  const newRef = collection.doc();

  const record = {
    ...input,
    userId,
    isDefault: makeDefault,
    createdAt: now,
    updatedAt: now,
  };

  batch.set(newRef, record);
  await batch.commit();

  return toCustomerAddress(newRef.id, record);
}


export async function updateCustomerAddressRecord(
  userId: string,
  addressId: string,
  input: UpdateCustomerAddressInput,
  collectionName = DEFAULT_COLLECTION
): Promise<CustomerAddress | null> {
  const collection = addressCollection(collectionName);
  const targetRef = collection.doc(addressId);
  const target = await targetRef.get();

  if (!target.exists || target.data()?.userId !== userId) {
    return null;
  }

  const now = new Date().toISOString();
  const batch = adminDb.batch();

  if (input.isDefault === true) {
    const allCustomerAddresses = await collection
      .where("userId", "==", userId)
      .get();

    for (const doc of allCustomerAddresses.docs) {
      batch.update(doc.ref, {
        isDefault: doc.id === addressId,
        updatedAt: now,
      });
    }
  }

  // Preserve the input fields while giving Firestore a compatible update type.
  const patch = {
    ...input,
    updatedAt: now,
  };

  batch.update(targetRef, patch);
  await batch.commit();

  const updated = await targetRef.get();

  return updated.exists
    ? toCustomerAddress(
        updated.id,
        updated.data() as Record<string, unknown>
      )
    : null;
}


export async function deleteCustomerAddressRecord(
  userId: string,
  addressId: string,
  collectionName = DEFAULT_COLLECTION
): Promise<boolean> {
  const collection = addressCollection(collectionName);
  const targetRef = collection.doc(addressId);
  const target = await targetRef.get();

  if (!target.exists || target.data()?.userId !== userId) {
    return false;
  }

  await targetRef.delete();
  return true;
}

export async function setDefaultCustomerAddressRecord(
  userId: string,
  addressId: string,
  collectionName = DEFAULT_COLLECTION
): Promise<boolean> {
  const collection = addressCollection(collectionName);
  const targetRef = collection.doc(addressId);
  const target = await targetRef.get();

  if (!target.exists || target.data()?.userId !== userId) {
    return false;
  }

  const snapshot = await collection
    .where("userId", "==", userId)
    .get();

  const batch = adminDb.batch();
  const now = new Date().toISOString();

  for (const doc of snapshot.docs) {
    batch.update(doc.ref, {
      isDefault: doc.id === addressId,
      updatedAt: now,
    });
  }

  await batch.commit();
  return true;
}