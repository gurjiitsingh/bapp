"use server";

import { adminDb } from "@/lib/firebaseAdmin";

import type {
  AttendanceMachine,
  AttendanceMachineConnectionType,
  AttendanceMachineStatus,
} from "@/lib/types/attendance/AttendanceMachineTypes";

const ATTENDANCE_MACHINE_COLLECTION =
  "attendanceMachines";

// =========================================================
// VALIDATION
// =========================================================

function validateMachineName(name: string) {
  if (!name?.trim()) {
    throw new Error("Attendance machine name is required.");
  }
}

function validateModel(model: string) {
  if (!model?.trim()) {
    throw new Error("Attendance machine model is required.");
  }
}

function validateConnectionType(
  connectionType: AttendanceMachineConnectionType
) {
  const allowedTypes: AttendanceMachineConnectionType[] = [
    "TCP_IP",
    "WIFI",
    "USB",
  ];

  if (!allowedTypes.includes(connectionType)) {
    throw new Error("Invalid attendance machine connection type.");
  }
}

function validateStatus(
  status: AttendanceMachineStatus
) {
  const allowedStatuses: AttendanceMachineStatus[] = [
    "ACTIVE",
    "INACTIVE",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid attendance machine status.");
  }
}

function validateNetworkSettings(
  connectionType: AttendanceMachineConnectionType,
  ipAddress?: string,
  port?: number,
  deviceId?: number
) {
  if (
    connectionType === "TCP_IP" ||
    connectionType === "WIFI"
  ) {
    if (!ipAddress?.trim()) {
      throw new Error(
        "IP address is required for network attendance machines."
      );
    }

    if (
      port !== undefined &&
      (!Number.isInteger(port) ||
        port < 1 ||
        port > 65535)
    ) {
      throw new Error("Invalid attendance machine port.");
    }

    if (
      deviceId !== undefined &&
      (!Number.isInteger(deviceId) ||
        deviceId < 1 ||
        deviceId > 254)
    ) {
      throw new Error(
        "Device ID must be between 1 and 254."
      );
    }
  }
}

// =========================================================
// CREATE
// =========================================================

export async function createAttendanceMachine(
  data: Omit<
    AttendanceMachine,
    "id" | "createdAt" | "updatedAt"
  >
): Promise<string> {
  validateMachineName(data.name);
  validateModel(data.model);

  validateConnectionType(
    data.connectionType
  );

  validateStatus(data.status);

  validateNetworkSettings(
    data.connectionType,
    data.ipAddress,
    data.port,
    data.deviceId
  );

  const machineRef = adminDb
    .collection(ATTENDANCE_MACHINE_COLLECTION)
    .doc();

  const now = new Date().toISOString();

  const machine: AttendanceMachine = {
    id: machineRef.id,

    name: data.name.trim(),

    model: data.model.trim(),

    ipAddress:
      data.ipAddress?.trim() || "",

    port:
      data.port !== undefined
        ? Number(data.port)
        : 4370,

    deviceId:
      data.deviceId !== undefined
        ? Number(data.deviceId)
        : 1,

    connectionType:
      data.connectionType,

    status:
      data.status,

    createdAt: now,

    updatedAt: now,

    lastConnectedAt:
      data.lastConnectedAt || undefined,
  };

  await machineRef.set(machine);

  return machineRef.id;
}

// =========================================================
// GET ONE
// =========================================================

export async function getAttendanceMachine(
  machineId: string
): Promise<AttendanceMachine | null> {
  if (!machineId?.trim()) {
    throw new Error(
      "Attendance machine ID is required."
    );
  }

  const snapshot = await adminDb
    .collection(ATTENDANCE_MACHINE_COLLECTION)
    .doc(machineId.trim())
    .get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    ...(snapshot.data() as AttendanceMachine),
    id: snapshot.id,
  };
}

// =========================================================
// GET ALL
// =========================================================

export async function getAttendanceMachines(): Promise<
  AttendanceMachine[]
> {
  const snapshot = await adminDb
    .collection(ATTENDANCE_MACHINE_COLLECTION)
    .orderBy("createdAt", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    ...(doc.data() as AttendanceMachine),
    id: doc.id,
  }));
}

// =========================================================
// GET ACTIVE MACHINES
// =========================================================

export async function getActiveAttendanceMachines(): Promise<
  AttendanceMachine[]
> {
  const snapshot = await adminDb
    .collection(ATTENDANCE_MACHINE_COLLECTION)
    .where("status", "==", "ACTIVE")
    .orderBy("name", "asc")
    .get();

  return snapshot.docs.map((doc) => ({
    ...(doc.data() as AttendanceMachine),
    id: doc.id,
  }));
}

// =========================================================
// UPDATE
// =========================================================

export async function updateAttendanceMachine(
  machineId: string,
  data: Partial<
    Omit<
      AttendanceMachine,
      "id" | "createdAt"
    >
  >
): Promise<void> {
  if (!machineId?.trim()) {
    throw new Error(
      "Attendance machine ID is required."
    );
  }

  const machineRef = adminDb
    .collection(ATTENDANCE_MACHINE_COLLECTION)
    .doc(machineId.trim());

  const existingSnapshot =
    await machineRef.get();

  if (!existingSnapshot.exists) {
    throw new Error(
      "Attendance machine not found."
    );
  }

  const existing =
    existingSnapshot.data() as AttendanceMachine;

  const connectionType =
    data.connectionType ??
    existing.connectionType;

  const name =
    data.name ??
    existing.name;

  const model =
    data.model ??
    existing.model;

  const status =
    data.status ??
    existing.status;

  const ipAddress =
    data.ipAddress ??
    existing.ipAddress;

  const port =
    data.port ??
    existing.port;

  const deviceId =
    data.deviceId ??
    existing.deviceId;

  validateMachineName(name);
  validateModel(model);

  validateConnectionType(
    connectionType
  );

  validateStatus(status);

  validateNetworkSettings(
    connectionType,
    ipAddress,
    port,
    deviceId
  );

  const updateData: Partial<AttendanceMachine> = {
    ...data,

    name: name.trim(),

    model: model.trim(),

    ipAddress:
      ipAddress?.trim() || "",

    port:
      port !== undefined
        ? Number(port)
        : 4370,

    deviceId:
      deviceId !== undefined
        ? Number(deviceId)
        : 1,

    connectionType,

    status,

    updatedAt:
      new Date().toISOString(),
  };

  await machineRef.update(updateData);
}

// =========================================================
// DELETE
// =========================================================

export async function deleteAttendanceMachine(
  machineId: string
): Promise<void> {
  if (!machineId?.trim()) {
    throw new Error(
      "Attendance machine ID is required."
    );
  }

  const machineRef = adminDb
    .collection(ATTENDANCE_MACHINE_COLLECTION)
    .doc(machineId.trim());

  const snapshot =
    await machineRef.get();

  if (!snapshot.exists) {
    throw new Error(
      "Attendance machine not found."
    );
  }

  await machineRef.delete();
}

// =========================================================
// UPDATE LAST CONNECTED TIME
// =========================================================

export async function updateAttendanceMachineLastConnected(
  machineId: string
): Promise<void> {
  if (!machineId?.trim()) {
    throw new Error(
      "Attendance machine ID is required."
    );
  }

  const machineRef = adminDb
    .collection(ATTENDANCE_MACHINE_COLLECTION)
    .doc(machineId.trim());

  const snapshot =
    await machineRef.get();

  if (!snapshot.exists) {
    throw new Error(
      "Attendance machine not found."
    );
  }

  const now = new Date().toISOString();

  await machineRef.update({
    lastConnectedAt: now,
    updatedAt: now,
  });
}