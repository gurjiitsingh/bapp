export type AttendanceStatus =
  | "PRESENT"
  | "ABSENT"
  | "HALF_DAY"
  | "LEAVE"
  | "HOLIDAY"
  | "WEEK_OFF";

export interface EmployeeAttendance {
  id: string;

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

  createdAt: Date | string;
  updatedAt: Date | string;
}