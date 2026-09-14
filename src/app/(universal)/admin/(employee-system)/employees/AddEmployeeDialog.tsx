"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type {
  Employee,
  EmployeeStatus,
  EmploymentType,
} from "@/lib/types/payroll/EmployeeTypes";

import { createEmployee } from "../../../action/employee-system/payroll/employee";

type Props = {
  onCreated?: (employee: Employee) => void;
};

const WEEK_DAYS = [
  { value: 0, label: "Sunday", short: "Sun" },
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
];

export default function AddEmployeeDialog({
  onCreated,
}: Props) {
  const [open, setOpen] = useState(false);

  const [employeeCode, setEmployeeCode] =
    useState("");

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [dateOfBirth, setDateOfBirth] =
    useState("");

  const [joiningDate, setJoiningDate] =
    useState("");

  const [departmentId, setDepartmentId] =
    useState("");

  const [designationId, setDesignationId] =
    useState("");

  const [employmentType, setEmploymentType] =
    useState<EmploymentType>("FULL_TIME");

  const [status, setStatus] =
    useState<EmployeeStatus>("ACTIVE");

  // =========================================================
  // WEEKLY OFF DAYS
  // =========================================================
  //
  // []       = no weekly off
  // [0]      = Sunday
  // [0, 6]   = Sunday + Saturday
  //
  // 0 = Sunday
  // 1 = Monday
  // 2 = Tuesday
  // 3 = Wednesday
  // 4 = Thursday
  // 5 = Friday
  // 6 = Saturday
  //
  const [weeklyOffDays, setWeeklyOffDays] =
    useState<number[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  function toggleWeeklyOff(day: number) {
    setWeeklyOffDays((current) => {
      if (current.includes(day)) {
        return current.filter(
          (item) => item !== day
        );
      }

      return [...current, day].sort(
        (a, b) => a - b
      );
    });
  }

  function resetForm() {
    setEmployeeCode("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setDateOfBirth("");
    setJoiningDate("");
    setDepartmentId("");
    setDesignationId("");
    setEmploymentType("FULL_TIME");
    setStatus("ACTIVE");

    // Reset weekly offs
    setWeeklyOffDays([]);

    setError("");
  }

  function validate(): string | null {
    if (!employeeCode.trim()) {
      return "Please enter an employee code.";
    }

    if (!firstName.trim()) {
      return "Please enter the employee first name.";
    }

    if (!joiningDate) {
      return "Please select the joining date.";
    }

    return null;
  }

  async function handleCreate() {
    setError("");

    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const now = new Date().toISOString();

      const employee: Employee = {
        id: "",
        employeeCode: employeeCode.trim(),
        firstName: firstName.trim(),
        lastName:
          lastName.trim() || undefined,
        email:
          email.trim() || undefined,
        phone:
          phone.trim() || undefined,
        dateOfBirth:
          dateOfBirth || undefined,
        joiningDate,

        departmentId:
          departmentId.trim() || undefined,

        designationId:
          designationId.trim() || undefined,

        employmentType,
        status,

        // =================================================
        // WEEKLY OFF DAYS
        // =================================================
        weeklyOffDays: [...weeklyOffDays],

        createdAt: now,
        updatedAt: now,
      };

      const employeeId =
        await createEmployee(employee);

      const createdEmployee: Employee = {
        ...employee,
        id: employeeId,
      };

      onCreated?.(createdEmployee);

      setOpen(false);
      resetForm();
    } catch (err) {
      console.error(
        "Failed to create employee:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create employee."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);

        if (!value) {
          setError("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </DialogTrigger>

      <DialogContent
        className="
          w-[calc(100%-2rem)]
          max-w-[700px]
          max-h-[90vh]
          overflow-y-auto
          bg-white
          text-gray-900
          border
          border-gray-200
          shadow-2xl
          opacity-100
        "
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Add Employee
          </DialogTitle>

          <DialogDescription className="text-gray-500">
            Enter the employee's basic employment information.
            Payroll details can be configured after the employee
            is created.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Basic Information
              </h3>

              <p className="text-xs text-gray-500">
                Employee identification and contact details.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* Employee Code */}
              <div className="space-y-2">
                <Label className="text-gray-700">
                  Employee Code
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </Label>

                <Input
                  value={employeeCode}
                  onChange={(e) =>
                    setEmployeeCode(e.target.value)
                  }
                  placeholder="EMP-001"
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>

              {/* First Name */}
              <div className="space-y-2">
                <Label className="text-gray-700">
                  First Name
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </Label>

                <Input
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(e.target.value)
                  }
                  placeholder="John"
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label className="text-gray-700">
                  Last Name
                </Label>

                <Input
                  value={lastName}
                  onChange={(e) =>
                    setLastName(e.target.value)
                  }
                  placeholder="Smith"
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label className="text-gray-700">
                  Phone
                </Label>

                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  placeholder="+91 98765 43210"
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>

              {/* Email */}
              <div className="space-y-2 sm:col-span-2">
                <Label className="text-gray-700">
                  Email
                </Label>

                <Input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="employee@example.com"
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label className="text-gray-700">
                  Date of Birth
                </Label>

                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) =>
                    setDateOfBirth(e.target.value)
                  }
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>

              {/* Joining Date */}
              <div className="space-y-2">
                <Label className="text-gray-700">
                  Joining Date
                  <span className="ml-1 text-red-500">
                    *
                  </span>
                </Label>

                <Input
                  type="date"
                  value={joiningDate}
                  onChange={(e) =>
                    setJoiningDate(e.target.value)
                  }
                  className="bg-white text-gray-900 border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* =================================================
              EMPLOYMENT
          ================================================= */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Employment
              </h3>

              <p className="text-xs text-gray-500">
                Define the employee's employment type and status.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* Employment Type */}
              <div className="space-y-2">
                <Label className="text-gray-700">
                  Employment Type
                </Label>

                <Select
                  value={employmentType}
                  onValueChange={(value) =>
                    setEmploymentType(
                      value as EmploymentType
                    )
                  }
                >
                  <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent className="bg-white">
                    <SelectItem value="FULL_TIME">
                      Full Time
                    </SelectItem>

                    <SelectItem value="PART_TIME">
                      Part Time
                    </SelectItem>

                    <SelectItem value="CONTRACT">
                      Contract
                    </SelectItem>

                    <SelectItem value="TEMPORARY">
                      Temporary
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-gray-700">
                  Status
                </Label>

                <Select
                  value={status}
                  onValueChange={(value) =>
                    setStatus(
                      value as EmployeeStatus
                    )
                  }
                >
                  <SelectTrigger className="bg-white text-gray-900 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent className="bg-white">
                    <SelectItem value="ACTIVE">
                      Active
                    </SelectItem>

                    <SelectItem value="ON_LEAVE">
                      On Leave
                    </SelectItem>

                    <SelectItem value="RESIGNED">
                      Resigned
                    </SelectItem>

                    <SelectItem value="TERMINATED">
                      Terminated
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label className="text-gray-700">
                  Department ID
                </Label>

                <Input
                  value={departmentId}
                  onChange={(e) =>
                    setDepartmentId(e.target.value)
                  }
                  placeholder="e.g. KITCHEN"
                  className="bg-white text-gray-900 border-gray-300"
                />

                <p className="text-xs text-gray-500">
                  We can replace this with a department selector later.
                </p>
              </div>

              {/* Designation */}
              <div className="space-y-2">
                <Label className="text-gray-700">
                  Designation ID
                </Label>

                <Input
                  value={designationId}
                  onChange={(e) =>
                    setDesignationId(e.target.value)
                  }
                  placeholder="e.g. CHEF"
                  className="bg-white text-gray-900 border-gray-300"
                />

                <p className="text-xs text-gray-500">
                  We can replace this with a designation selector later.
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              WEEKLY OFF
          ================================================= */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Weekly Off
              </h3>

              <p className="text-xs text-gray-500">
                Select the employee's normal weekly days off.
                Leave all unselected if the employee normally
                works every day.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {WEEK_DAYS.map((day) => {
                const selected =
                  weeklyOffDays.includes(day.value);

                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() =>
                      toggleWeeklyOff(day.value)
                    }
                    disabled={loading}
                    className={`
                      rounded-lg
                      border
                      px-3
                      py-2.5
                      text-sm
                      font-medium
                      transition-colors
                      ${
                        selected
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{day.label}</span>

                      <span
                        className={`
                          flex h-4 w-4 items-center justify-center
                          rounded border text-[10px]
                          ${
                            selected
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-gray-300 bg-white"
                          }
                        `}
                      >
                        {selected ? "✓" : ""}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
              {weeklyOffDays.length === 0 ? (
                <>
                  <span className="font-medium text-gray-900">
                    No weekly off selected.
                  </span>{" "}
                  This employee can work every day.
                </>
              ) : (
                <>
                  <span className="font-medium text-gray-900">
                    Weekly off:
                  </span>{" "}
                  {weeklyOffDays
                    .map(
                      (day) =>
                        WEEK_DAYS.find(
                          (item) =>
                            item.value === day
                        )?.label
                    )
                    .filter(Boolean)
                    .join(", ")}
                </>
              )}
            </div>
          </div>

          {/* =================================================
              ERROR
          ================================================= */}
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* ===================================================
            FOOTER
        =================================================== */}
        <DialogFooter className="border-t border-gray-100 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={loading}
            onClick={handleCreate}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Create Employee
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}