export type AttendanceMachineConnectionType =
  | "TCP_IP"
  | "WIFI"
  | "USB";

export type AttendanceMachineStatus =
  | "ACTIVE"
  | "INACTIVE";

export interface AttendanceMachine {
  id: string;

  // ==========================================
  // MACHINE INFORMATION
  // ==========================================

  name: string;

  // Example: "AiFace Orcus"
  model: string;

  // ==========================================
  // NETWORK CONFIGURATION
  // ==========================================

  ipAddress?: string;

  // Default AiFace Orcus TCP port is usually 4370.
  port?: number;

  // Device ID configured on the attendance machine.
  // Example: 1
  deviceId?: number;

  // ==========================================
  // CONNECTION
  // ==========================================

  connectionType: AttendanceMachineConnectionType;

  // ==========================================
  // STATUS
  // ==========================================

  status: AttendanceMachineStatus;

  // ==========================================
  // TIMESTAMPS
  // ==========================================

  createdAt: string;

  updatedAt: string;

  // Last successful communication with machine.
  lastConnectedAt?: string;
}