"use server";

import { auth } from "@/auth";

import {
  createCustomerAddressRecord,
  deleteCustomerAddressRecord,
  getCustomerAddressById,
  listCustomerAddresses,
  setDefaultCustomerAddressRecord,
  updateCustomerAddressRecord,
} from "./address.repository";

import {
  validateCreateCustomerAddress,
  validateUpdateCustomerAddress,
} from "../core/customer.validation";

import type {
  CreateCustomerAddressInput,
  CustomerAddress,
  UpdateCustomerAddressInput,
} from "../core/customer.types";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

async function getAuthenticatedCustomerId(): Promise<string | null> {
  const session = await auth();

  // Auth.js must expose the database user ID as session.user.id.
  const user = session?.user as
    | { id?: string; email?: string | null }
    | undefined;

  if (!user?.id) {
    return null;
  }

  return user.id;
}

async function getAuthenticatedCustomerId1(): Promise<string | null> {
  const session = await auth();

  console.log("[CustomerAccount] Session exists:", !!session);
  console.log("[CustomerAccount] User exists:", !!session?.user);
  console.log("[CustomerAccount] User ID:", session?.user?.id);
  console.log("[CustomerAccount] User email:", session?.user?.email);

  const user = session?.user as
    | { id?: string; email?: string | null }
    | undefined;

  return user?.id || null;
}

export async function getRegisteredCustomerAddresses(): Promise<
  ActionResult<CustomerAddress[]>
> {
  try {
    const userId = await getAuthenticatedCustomerId();

    if (!userId) {
      return { success: false, error: "Please sign in first." };
    }

    const addresses = await listCustomerAddresses(userId);

    return { success: true, data: addresses };
  } catch (error) {
    console.error("[CustomerAddress] List failed:", error);

    return {
      success: false,
      error: "Unable to load your addresses.",
    };
  }
}

export async function getRegisteredCustomerAddress(
  addressId: string
): Promise<ActionResult<CustomerAddress | null>> {
  try {
    const userId = await getAuthenticatedCustomerId();

    if (!userId) {
      return { success: false, error: "Please sign in first." };
    }

    if (!addressId?.trim()) {
      return { success: false, error: "Address ID is required." };
    }

    const address = await getCustomerAddressById(
      userId,
      addressId.trim()
    );

    return { success: true, data: address };
  } catch (error) {
    console.error("[CustomerAddress] Get failed:", error);

    return {
      success: false,
      error: "Unable to load the address.",
    };
  }
}

export async function addRegisteredCustomerAddress(
  input: CreateCustomerAddressInput
): Promise<ActionResult<CustomerAddress>> {
  try {
    const userId = await getAuthenticatedCustomerId();

    if (!userId) {
      return { success: false, error: "Please sign in first." };
    }

    const validation = validateCreateCustomerAddress(input);

    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    const address = await createCustomerAddressRecord(
      userId,
      validation.data
    );

    return { success: true, data: address };
  } catch (error) {
    console.error("[CustomerAddress] Create failed:", error);

    return {
      success: false,
      error: "Unable to save your address.",
    };
  }
}

export async function updateRegisteredCustomerAddress(
  addressId: string,
  input: UpdateCustomerAddressInput
): Promise<ActionResult<CustomerAddress>> {
  try {
    const userId = await getAuthenticatedCustomerId();

    if (!userId) {
      return { success: false, error: "Please sign in first." };
    }

    if (!addressId?.trim()) {
      return { success: false, error: "Address ID is required." };
    }

    const validation = validateUpdateCustomerAddress(input);

    if (!validation.success) {
      return { success: false, error: validation.error };
    }

    const address = await updateCustomerAddressRecord(
      userId,
      addressId.trim(),
      validation.data
    );

    if (!address) {
      return {
        success: false,
        error: "Address not found or you do not have permission to edit it.",
      };
    }

    return { success: true, data: address };
  } catch (error) {
    console.error("[CustomerAddress] Update failed:", error);

    return {
      success: false,
      error: "Unable to update your address.",
    };
  }
}

export async function deleteRegisteredCustomerAddress(
  addressId: string
): Promise<ActionResult<{ deleted: true }>> {
  try {
    const userId = await getAuthenticatedCustomerId();

    if (!userId) {
      return { success: false, error: "Please sign in first." };
    }

    if (!addressId?.trim()) {
      return { success: false, error: "Address ID is required." };
    }

    const deleted = await deleteCustomerAddressRecord(
      userId,
      addressId.trim()
    );

    if (!deleted) {
      return {
        success: false,
        error: "Address not found or you do not have permission to delete it.",
      };
    }

    return { success: true, data: { deleted: true } };
  } catch (error) {
    console.error("[CustomerAddress] Delete failed:", error);

    return {
      success: false,
      error: "Unable to delete your address.",
    };
  }
}

export async function setRegisteredCustomerDefaultAddress(
  addressId: string
): Promise<ActionResult<{ updated: true }>> {
  try {
    const userId = await getAuthenticatedCustomerId();

    if (!userId) {
      return { success: false, error: "Please sign in first." };
    }

    if (!addressId?.trim()) {
      return { success: false, error: "Address ID is required." };
    }

    const updated = await setDefaultCustomerAddressRecord(
      userId,
      addressId.trim()
    );

    if (!updated) {
      return {
        success: false,
        error: "Address not found or you do not have permission to change it.",
      };
    }

    return { success: true, data: { updated: true } };
  } catch (error) {
    console.error("[CustomerAddress] Set default failed:", error);

    return {
      success: false,
      error: "Unable to change your default address.",
    };
  }
}