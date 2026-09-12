"use server";

import { adminDb } from "@/lib/firebaseAdmin";

import type {
  AttendanceStatus,
  EmployeeAttendance,
} from "@/lib/types/attendance/AttendanceTypes";

const ATTENDANCE_COLLECTION = "attendance";

export interface SaveAttendanceInput {
  employeeId: string;
  employeeName: string;

  date: string;

  status: AttendanceStatus;

  checkIn?: string;
  checkOut?: string;

  workingHours?: number;
  overtimeHours?: number;

  leaveType?: string;
  remarks?: string;
}

function validateDate(date: string) {
  if (!date?.trim()) {
    throw new Error("Attendance date is required.");
  }

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid attendance date.");
  }
}

function validateStatus(status: AttendanceStatus) {
  const allowedStatuses: AttendanceStatus[] = [
    "PRESENT",
    "ABSENT",
    "HALF_DAY",
    "LEAVE",
    "HOLIDAY",
    "WEEK_OFF",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid attendance status.");
  }
}

function validateHours(
  workingHours?: number,
  overtimeHours?: number
) {
  if (
    workingHours !== undefined &&
    (!Number.isFinite(workingHours) || workingHours < 0)
  ) {
    throw new Error("Invalid working hours.");
  }

  if (
    overtimeHours !== undefined &&
    (!Number.isFinite(overtimeHours) || overtimeHours < 0)
  ) {
    throw new Error("Invalid overtime hours.");
  }
}

/* =========================================================
   SAVE / UPDATE ATTENDANCE
========================================================= */

export async function saveAttendance(
  data: SaveAttendanceInput
): Promise<EmployeeAttendance> {
  if (!data.employeeId?.trim()) {
    throw new Error("Employee ID is required.");
  }

  if (!data.employeeName?.trim()) {
    throw new Error("Employee name is required.");
  }

  validateDate(data.date);
  validateStatus(data.status);

  validateHours(
    data.workingHours,
    data.overtimeHours
  );

  if (
    data.status === "LEAVE" &&
    !data.leaveType?.trim()
  ) {
    throw new Error(
      "Leave type is required for leave attendance."
    );
  }

  const attendanceId =
    `${data.employeeId.trim()}_${data.date}`;

  const attendanceRef = adminDb
    .collection(ATTENDANCE_COLLECTION)
    .doc(attendanceId);

  const existingSnapshot =
    await attendanceRef.get();

  const now = new Date().toISOString();

const attendance: EmployeeAttendance = {
  id: attendanceId,

  employeeId: data.employeeId.trim(),
  employeeName: data.employeeName.trim(),

  date: data.date,
  status: data.status,

  checkIn:
    data.checkIn?.trim() || "",

  checkOut:
    data.checkOut?.trim() || "",

  workingHours:
    data.workingHours !== undefined
      ? Number(data.workingHours)
      : undefined,

  overtimeHours:
    data.overtimeHours !== undefined
      ? Number(data.overtimeHours)
      : 0,

  leaveType:
    data.status === "LEAVE"
      ? data.leaveType?.trim() || ""
      : "",

  remarks:
    data.remarks?.trim() || "",

  createdAt: existingSnapshot.exists
    ? (
        existingSnapshot.data()
          ?.createdAt as string
      ) || now
    : now,

  updatedAt: now,
};

  await attendanceRef.set(
    attendance,
    { merge: true }
  );

  return attendance;
}

/* =========================================================
   GET ONE ATTENDANCE
========================================================= */

export async function getAttendance(
  employeeId: string,
  date: string
): Promise<EmployeeAttendance | null> {
  if (!employeeId?.trim()) {
    throw new Error("Employee ID is required.");
  }

  validateDate(date);

  const attendanceId =
    `${employeeId.trim()}_${date}`;

  const snapshot = await adminDb
    .collection(ATTENDANCE_COLLECTION)
    .doc(attendanceId)
    .get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    ...(snapshot.data() as EmployeeAttendance),
    id: snapshot.id,
  };
}

/* =========================================================
   GET EMPLOYEE ATTENDANCE
========================================================= */

export async function getEmployeeAttendance(
  employeeId: string,
  startDate?: string,
  endDate?: string
): Promise<EmployeeAttendance[]> {
  if (!employeeId?.trim()) {
    throw new Error("Employee ID is required.");
  }

  let query = adminDb
    .collection(ATTENDANCE_COLLECTION)
    .where(
      "employeeId",
      "==",
      employeeId.trim()
    );

  if (startDate) {
    validateDate(startDate);

    query = query.where(
      "date",
      ">=",
      startDate
    );
  }

  if (endDate) {
    validateDate(endDate);

    query = query.where(
      "date",
      "<=",
      endDate
    );
  }

  const snapshot = await query
    .orderBy("date", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    ...(doc.data() as EmployeeAttendance),
    id: doc.id,
  }));
}

/* =========================================================
   GET ATTENDANCE BY DATE
========================================================= */

export async function getAttendanceByDate(
  date: string
): Promise<EmployeeAttendance[]> {
  validateDate(date);

  const snapshot = await adminDb
    .collection(ATTENDANCE_COLLECTION)
    .where("date", "==", date)
    .orderBy("employeeName", "asc")
    .get();

  return snapshot.docs.map((doc) => ({
    ...(doc.data() as EmployeeAttendance),
    id: doc.id,
  }));
}

/* =========================================================
   GET ATTENDANCE FOR DATE RANGE
========================================================= */

export async function getAttendanceByDateRange(
  startDate: string,
  endDate: string
): Promise<EmployeeAttendance[]> {
  validateDate(startDate);
  validateDate(endDate);

  if (startDate > endDate) {
    throw new Error(
      "Start date cannot be after end date."
    );
  }

  const snapshot = await adminDb
    .collection(ATTENDANCE_COLLECTION)
    .where("date", ">=", startDate)
    .where("date", "<=", endDate)
    .orderBy("date", "desc")
    .get();

  return snapshot.docs.map((doc) => ({
    ...(doc.data() as EmployeeAttendance),
    id: doc.id,
  }));
}

/* =========================================================
   DELETE ATTENDANCE
========================================================= */

export async function deleteAttendance(
  employeeId: string,
  date: string
): Promise<void> {
  if (!employeeId?.trim()) {
    throw new Error("Employee ID is required.");
  }

  validateDate(date);

  const attendanceId =
    `${employeeId.trim()}_${date}`;

  await adminDb
    .collection(ATTENDANCE_COLLECTION)
    .doc(attendanceId)
    .delete();
}