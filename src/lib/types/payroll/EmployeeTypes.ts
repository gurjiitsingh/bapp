export type EmployeeStatus =
  | "ACTIVE"
  | "ON_LEAVE"
  | "RESIGNED"
  | "TERMINATED";

export type EmploymentType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "TEMPORARY";

export interface Employee {
   id: string;

  employeeCode: string;

  firstName: string;
  lastName?: string;

  email?: string;
  phone?: string;

  joiningDate: string;

  departmentId?: string;
  designationId?: string;

  employmentType: string;

  status: string;

  userId?: string;

  // ==========================================
  // WEEKLY OFF DAYS
  // ==========================================
  // 0 = Sunday
  // 1 = Monday
  // 2 = Tuesday
  // 3 = Wednesday
  // 4 = Thursday
  // 5 = Friday
  // 6 = Saturday
  //
  // [] = no weekly off
  weeklyOffDays: number[];

  createdAt: string;
  updatedAt: string;
}