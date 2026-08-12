export type FaultPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type FaultStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELLED";

/**
 * =========================================================
 * CLOUDINARY FAULT PHOTO
 * =========================================================
 */

export type FaultPhoto = {
  id: string;
  url: string;
  fileName: string;

  uploadedBy: string;
  uploadedByName?: string;

  uploadedAt: string | null;
};

/**
 * =========================================================
 * CREATE FAULT INPUT
 * =========================================================
 */

export type CreateFaultInput = {
  machineId: string;
  machineName: string;

  machineCode?: string;

  departmentId?: string;
  departmentName?: string;

  location?: string;

  faultTitle: string;
  faultDescription: string;

  priority: FaultPriority;

  reportedBy: string;
  reportedByName?: string;

  assignedTo?: string;
  assignedToName?: string;

  /**
   * Images are sent from the client as
   * base64 strings.
   *
   * They are uploaded to Cloudinary
   * inside the server action.
   */
  images?: {
    fileName: string;
    data: string;
  }[];
};

/**
 * =========================================================
 * MAINTENANCE FAULT
 * =========================================================
 */

export type MaintenanceFault = {
  id: string;

  ticketNumber: string;

  machineId: string;
  machineName: string;
  machineCode: string;

  departmentId: string;
  departmentName: string;

  location: string;

  faultTitle: string;
  faultDescription: string;

  priority: FaultPriority;
  status: FaultStatus;

  reportedBy: string;
  reportedByName: string;

  reportedAt: string | null;

  assignedTo: string | null;
  assignedToName: string | null;

  assignedAt: string | null;

  startedAt: string | null;

  resolvedAt: string | null;

  closedAt: string | null;

  diagnosis: string;

  repairDescription: string;

  downtimeMinutes: number;

  remarks: string;

  photos: FaultPhoto[];

  createdAt: string | null;

  updatedAt: string | null;
};