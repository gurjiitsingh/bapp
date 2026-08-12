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

  dateOfBirth?: string;

  joiningDate: string;

  departmentId?: string;
  designationId?: string;

  employmentType: EmploymentType;

  status: EmployeeStatus;

  /**
   * Optional connection to the application's
   * authentication user.
   */
  userId?: string;

  createdAt: string;
  updatedAt: string;
}