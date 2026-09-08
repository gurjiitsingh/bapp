"use client";

import { useState } from "react";
import {
  Mail,
  Pencil,
  Phone,
  Search,
  UserRound,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type {
  Employee,
  EmployeeStatus,
} from "@/lib/types/payroll/EmployeeTypes";

import AddEmployeeDialog from "./AddEmployeeDialog";
import EmployeePayrollProfileDialog from "./EmployeePayrollProfileDialog";

type Props = {
  initialData?: Employee[];
};

export default function EmployeeClient({
  initialData = [],
}: Props) {
  const [employees, setEmployees] =
    useState<Employee[]>(initialData);

  const [search, setSearch] =
    useState("");

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [payrollProfileOpen, setPayrollProfileOpen] =
    useState(false);

  const activeEmployees =
    employees.filter(
      (employee) =>
        employee.status === "ACTIVE"
    ).length;

  const onLeaveEmployees =
    employees.filter(
      (employee) =>
        employee.status === "ON_LEAVE"
    ).length;

  const inactiveEmployees =
    employees.filter(
      (employee) =>
        employee.status === "RESIGNED" ||
        employee.status === "TERMINATED"
    ).length;

  const filteredEmployees =
    employees.filter((employee) => {
      const query =
        search.trim().toLowerCase();

      if (!query) return true;

      const fullName =
        `${employee.firstName} ${
          employee.lastName ?? ""
        }`.toLowerCase();

      return (
        fullName.includes(query) ||
        employee.employeeCode
          .toLowerCase()
          .includes(query) ||
        employee.email
          ?.toLowerCase()
          .includes(query) ||
        employee.phone
          ?.toLowerCase()
          .includes(query)
      );
    });

  function getStatusClass(
    status: EmployeeStatus
  ) {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";

      case "ON_LEAVE":
        return "bg-yellow-100 text-yellow-700";

      case "RESIGNED":
        return "bg-gray-100 text-gray-700";

      case "TERMINATED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  function formatDate(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function handleEmployeeCreated(
    employee: Employee
  ) {
    setEmployees((current) => [
      employee,
      ...current,
    ]);
  }

  function handleEditEmployee(
    employee: Employee
  ) {
    setSelectedEmployee(employee);
    setPayrollProfileOpen(true);
  }

  function handlePayrollProfileSaved() {
    setSelectedEmployee(null);
    setPayrollProfileOpen(false);
  }

  return (
    <div className="space-y-6 p-6">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Employees
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage employees, employment details
            and payroll profiles
          </p>
        </div>

        <AddEmployeeDialog
          onCreated={handleEmployeeCreated}
        />
      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Employees
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <p className="text-2xl font-bold">
                  {employees.length}
                </p>

                <p className="text-xs text-muted-foreground">
                  All employees
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-2">
                <UserRound className="h-5 w-5 text-green-600" />
              </div>

              <div>
                <p className="text-2xl font-bold">
                  {activeEmployees}
                </p>

                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* On Leave */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              On Leave
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-50 p-2">
                <UserRound className="h-5 w-5 text-yellow-600" />
              </div>

              <div>
                <p className="text-2xl font-bold">
                  {onLeaveEmployees}
                </p>

                <p className="text-xs text-muted-foreground">
                  Currently on leave
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inactive */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactive
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gray-100 p-2">
                <UserRound className="h-5 w-5 text-gray-600" />
              </div>

              <div>
                <p className="text-2xl font-bold">
                  {inactiveEmployees}
                </p>

                <p className="text-xs text-muted-foreground">
                  Resigned or terminated
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =====================================================
          EMPLOYEE LIST
      ===================================================== */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>
                Employee List
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                View and manage your employees
              </p>
            </div>

            <div className="relative w-full md:w-[320px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search employees..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* =================================================
              EMPTY STATE
          ================================================= */}
          {employees.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16">
              <div className="rounded-full bg-gray-100 p-5">
                <Users className="h-8 w-8 text-gray-500" />
              </div>

              <h3 className="mt-4 font-semibold text-gray-900">
                No employees yet
              </h3>

              <p className="mt-1 max-w-md text-center text-sm text-muted-foreground">
                Add your first employee to start
                managing employee information
                and payroll.
              </p>

              <div className="mt-5">
                <AddEmployeeDialog
                  onCreated={
                    handleEmployeeCreated
                  }
                />
              </div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16">
              <Search className="h-8 w-8 text-gray-400" />

              <h3 className="mt-4 font-semibold">
                No employees found
              </h3>

              <p className="mt-1 text-sm text-muted-foreground">
                Try a different employee name
                or code.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      Employee
                    </TableHead>

                    <TableHead>
                      Employee Code
                    </TableHead>

                    <TableHead>
                      Contact
                    </TableHead>

                    <TableHead>
                      Employment
                    </TableHead>

                    <TableHead>
                      Joining Date
                    </TableHead>

                    <TableHead>
                      Status
                    </TableHead>

                    <TableHead className="text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredEmployees.map(
                    (employee) => {
                      const fullName =
                        `${employee.firstName} ${
                          employee.lastName ?? ""
                        }`.trim();

                      return (
                        <TableRow
                          key={employee.id}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                                <UserRound className="h-4 w-4 text-gray-600" />
                              </div>

                              <div>
                                <p className="font-medium text-gray-900">
                                  {fullName}
                                </p>

                                {employee.email && (
                                  <p className="text-xs text-muted-foreground">
                                    {
                                      employee.email
                                    }
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="font-mono text-sm">
                              {
                                employee.employeeCode
                              }
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className="space-y-1">
                              {employee.phone && (
                                <div className="flex items-center gap-1.5 text-sm">
                                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                  {
                                    employee.phone
                                  }
                                </div>
                              )}

                              {employee.email && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Mail className="h-3.5 w-3.5" />
                                  {
                                    employee.email
                                  }
                                </div>
                              )}

                              {!employee.phone &&
                                !employee.email && (
                                  <span className="text-sm text-muted-foreground">
                                    —
                                  </span>
                                )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="text-sm">
                              {employee.employmentType.replace(
                                "_",
                                " "
                              )}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="text-sm">
                              {formatDate(
                                employee.joiningDate
                              )}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span
                              className={`
                                inline-flex
                                rounded-full
                                px-2.5
                                py-1
                                text-xs
                                font-medium
                                ${getStatusClass(
                                  employee.status
                                )}
                              `}
                            >
                              {employee.status.replace(
                                "_",
                                " "
                              )}
                            </span>
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleEditEmployee(
                                  employee
                                )
                              }
                            >
                              <Pencil className="mr-1.5 h-4 w-4" />
                              Payroll
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* =====================================================
          PAYROLL PROFILE DIALOG
      ===================================================== */}
      <EmployeePayrollProfileDialog
        employee={selectedEmployee}
        open={payrollProfileOpen}
        onOpenChange={(open) => {
          setPayrollProfileOpen(open);

          if (!open) {
            setSelectedEmployee(null);
          }
        }}
        onSaved={handlePayrollProfileSaved}
      />
    </div>
  );
}