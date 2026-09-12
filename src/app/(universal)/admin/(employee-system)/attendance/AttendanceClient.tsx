"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Save,
  UserRound,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Textarea } from "@/components/ui/textarea";

import type {
  AttendanceStatus,
  EmployeeAttendance,
} from "@/lib/types/attendance/AttendanceTypes";
import {
  getAttendanceByDate,
  saveAttendance,
} from "@/app/(universal)/action/employee-system/attendance/attendanceActions";
import { Label } from "recharts";

type EmployeeOption = {
  id: string;
  name: string;
};

type Props = {
  employees?: EmployeeOption[];
  initialRecords?: EmployeeAttendance[];
};

export default function AttendanceClient({
  employees = [],
  initialRecords = [],
}: Props) {
  const [records, setRecords] =
    useState<EmployeeAttendance[]>(initialRecords);

  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [status, setStatus] =
    useState<AttendanceStatus>("PRESENT");

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [overtimeHours, setOvertimeHours] =
    useState("0");

  const [leaveType, setLeaveType] = useState("");

  const [remarks, setRemarks] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [filterEmployeeId, setFilterEmployeeId] = useState("ALL");

  const [filterStatus, setFilterStatus] = useState("ALL");

  const [loadingRecords, setLoadingRecords] = useState(false);

  const selectedEmployee = useMemo(
    () =>
      employees.find(
        (employee) => employee.id === employeeId
      ),
    [employees, employeeId]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadAttendance() {
      try {
        setError("");

        const data = await getAttendanceByDate(date);

        if (!cancelled) {
          setRecords(data);
        }
      } catch (err) {
        console.error(
          "Failed to load attendance:",
          err
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load attendance records."
          );
        }
      }
    }

    if (date) {
      loadAttendance();
    }

    return () => {
      cancelled = true;
    };
  }, [date]);


  useEffect(() => {
    const loadAttendance = async () => {
      if (!filterDate) return;

      try {
        setLoadingRecords(true);

        const data = await getAttendanceByDate(filterDate);

        setRecords(data);
      } catch (error) {
        console.error("Failed to load attendance:", error);
      } finally {
        setLoadingRecords(false);
      }
    };

    loadAttendance();
  }, [filterDate]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const employeeMatch =
        filterEmployeeId === "ALL" ||
        record.employeeId === filterEmployeeId;

      const statusMatch =
        filterStatus === "ALL" ||
        record.status === filterStatus;

      return employeeMatch && statusMatch;
    });
  }, [records, filterEmployeeId, filterStatus]);

  function calculateWorkingHours() {
    if (!checkIn || !checkOut) {
      return 0;
    }

    const start = new Date(
      `1970-01-01T${checkIn}:00`
    );

    const end = new Date(
      `1970-01-01T${checkOut}:00`
    );

    let difference =
      (end.getTime() - start.getTime()) /
      (1000 * 60 * 60);

    // Overnight shift
    if (difference < 0) {
      difference += 24;
    }

    return Number(difference.toFixed(2));
  }

  const workingHours = calculateWorkingHours();

  async function handleSave1() {
    try {
      setError("");

      if (!employeeId) {
        setError("Please select an employee.");
        return;
      }

      if (!date) {
        setError("Please select a date.");
        return;
      }

      if (
        status === "LEAVE" &&
        !leaveType.trim()
      ) {
        setError("Please enter the leave type.");
        return;
      }

      setSaving(true);

      const now = new Date().toISOString();

      const employeeName =
        selectedEmployee?.name || "Employee";

      const attendance: EmployeeAttendance = {
        id: `${employeeId}_${date}`,

        employeeId,
        employeeName,

        date,

        status,

        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,

        workingHours:
          workingHours > 0
            ? workingHours
            : undefined,

        overtimeHours:
          Number(overtimeHours) || 0,

        leaveType:
          status === "LEAVE"
            ? leaveType.trim()
            : undefined,

        remarks:
          remarks.trim() || undefined,

        createdAt: now,
        updatedAt: now,
      };

      const savedAttendance = await saveAttendance({
        employeeId: attendance.employeeId,
        employeeName: attendance.employeeName,
        date: attendance.date,
        status: attendance.status,
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        workingHours: attendance.workingHours,
        overtimeHours: attendance.overtimeHours,
        leaveType: attendance.leaveType,
        remarks: attendance.remarks,
      });

      setRecords((current) => {
        const existingIndex = current.findIndex(
          (item) =>
            item.employeeId === savedAttendance.employeeId &&
            item.date === savedAttendance.date
        );

        if (existingIndex === -1) {
          return [savedAttendance, ...current];
        }

        const updated = [...current];

        updated[existingIndex] = savedAttendance;

        return updated;
      });

      resetForm();
    } catch (err) {
      console.error(
        "Failed to save attendance:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save attendance."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleSave() {
    try {
      setError("");

      if (!employeeId) {
        setError("Please select an employee.");
        return;
      }

      if (!date) {
        setError("Please select a date.");
        return;
      }

      if (status === "LEAVE" && !leaveType.trim()) {
        setError("Please enter the leave type.");
        return;
      }

      setSaving(true);

      const employeeName =
        selectedEmployee?.name || "Employee";

      const savedAttendance = await saveAttendance({
        employeeId,
        employeeName,
        date,
        status,
        checkIn: checkIn || undefined,
        checkOut: checkOut || undefined,
        workingHours:
          workingHours > 0 ? workingHours : undefined,
        overtimeHours: Number(overtimeHours) || 0,
        leaveType:
          status === "LEAVE"
            ? leaveType.trim()
            : undefined,
        remarks:
          remarks.trim() || undefined,
      });

      console.log(
        "Attendance saved successfully:",
        savedAttendance
      );

      // 🔥 Reload directly from Firestore
      const refreshedRecords =
        await getAttendanceByDate(date);

      console.log(
        "Attendance records after save:",
        refreshedRecords
      );

      setRecords(refreshedRecords);

      resetForm();
    } catch (err) {
      console.error(
        "Failed to save attendance:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save attendance."
      );
    } finally {
      setSaving(false);
    }
  }



  function resetForm() {
    setEmployeeId("");
    setStatus("PRESENT");
    setCheckIn("");
    setCheckOut("");
    setOvertimeHours("0");
    setLeaveType("");
    setRemarks("");
  }

  function formatStatus(
    value: AttendanceStatus
  ) {
    return value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  function statusClass(
    value: AttendanceStatus
  ) {
    switch (value) {
      case "PRESENT":
        return "bg-green-100 text-green-700";

      case "ABSENT":
        return "bg-red-100 text-red-700";

      case "HALF_DAY":
        return "bg-yellow-100 text-yellow-700";

      case "LEAVE":
        return "bg-blue-100 text-blue-700";

      case "HOLIDAY":
        return "bg-purple-100 text-purple-700";

      case "WEEK_OFF":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  return (
    <div className="space-y-6">
      {/* =====================================================
          ADD ATTENDANCE
      ===================================================== */}

 <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">

          {/* DATE */}
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">
              Date
            </Label>

            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border-0 bg-slate-50 shadow-sm"
            />
          </div>

          {/* EMPLOYEE */}
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">
              Employee
            </Label>

            <Select
              value={filterEmployeeId}
              onValueChange={setFilterEmployeeId}
            >
              <SelectTrigger className="border-0 bg-slate-50 shadow-sm">
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>

              <SelectContent className="border-0 shadow-sm">
                <SelectItem value="ALL">
                  All Employees
                </SelectItem>

                {employees?.map((employee) => (
                  <SelectItem
                    key={employee.id}
                    value={employee.id}
                  >
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* STATUS */}
          <div>
            <Label className="mb-1.5 block text-xs text-muted-foreground">
              Status
            </Label>

            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="border-0 bg-slate-50 shadow-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>

              <SelectContent className="border-0 shadow-sm">
                <SelectItem value="ALL">
                  All Status
                </SelectItem>

                <SelectItem value="PRESENT">
                  Present
                </SelectItem>

                <SelectItem value="ABSENT">
                  Absent
                </SelectItem>

                <SelectItem value="HALF_DAY">
                  Half Day
                </SelectItem>

                <SelectItem value="LEAVE">
                  Leave
                </SelectItem>

                <SelectItem value="HOLIDAY">
                  Holiday
                </SelectItem>

                <SelectItem value="WEEK_OFF">
                  Week Off
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* RESET */}
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              className="w-full border-0 bg-slate-50 shadow-sm"
              onClick={() => {
                setFilterDate(
                  new Date().toISOString().split("T")[0]
                );
                setFilterEmployeeId("ALL");
                setFilterStatus("ALL");
              }}
            >
              Reset Filters
            </Button>
          </div>

        </div>


      <Card className="border-0 shadow-sm">
        <CardHeader className="border-0 shadow-sm">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 border-0 shadow-sm" />
            Add Attendance
          </CardTitle>
        </CardHeader>

       

        <CardContent className="space-y-6 border-0 shadow-sm">
          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Employee + Date */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Employee */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Employee
              </label>

              <Select
                value={employeeId}
                onValueChange={setEmployeeId}
              >
                <SelectTrigger border-0 shadow-sm>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>

                <SelectContent border-0 shadow-sm>
                  {employees.length === 0 ? (
                    <SelectItem
                      value="__none__"
                      disabled
                    >
                      No employees available
                    </SelectItem>
                  ) : (
                    employees.map((employee) => (
                      <SelectItem
                        key={employee.id}
                        value={employee.id}
                      >
                        {employee.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Date
              </label>

              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(event.target.value)
                  }
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Attendance Status
            </label>

            <Select
              value={status}
              onValueChange={(value) =>
                setStatus(
                  value as AttendanceStatus
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent border-0 shadow-sm>
                <SelectItem className="border-0 shadow-sm" value="PRESENT">
                  Present
                </SelectItem>

                <SelectItem className="border-0 shadow-sm" value="ABSENT">
                  Absent
                </SelectItem>

                <SelectItem className="border-0 shadow-sm" value="HALF_DAY">
                  Half Day
                </SelectItem>

                <SelectItem className="border-0 shadow-sm" value="LEAVE">
                  Leave
                </SelectItem>

                <SelectItem className="border-0 shadow-sm" value="HOLIDAY">
                  Holiday
                </SelectItem>

                <SelectItem className="border-0 shadow-sm" value="WEEK_OFF">
                  Week Off
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Check In / Check Out */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Check In
              </label>

              <div className="relative">
                <Clock3 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  type="time"
                  value={checkIn}
                  onChange={(event) =>
                    setCheckIn(event.target.value)
                  }
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Check Out
              </label>

              <div className="relative">
                <Clock3 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  type="time"
                  value={checkOut}
                  onChange={(event) =>
                    setCheckOut(event.target.value)
                  }
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Working Hours
              </label>

              <Input
                value={
                  workingHours > 0
                    ? workingHours.toFixed(2)
                    : "0.00"
                }
                readOnly
              />
            </div>
          </div>

          {/* Overtime */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Overtime Hours
              </label>

              <Input
                type="number"
                min="0"
                step="0.5"
                value={overtimeHours}
                onChange={(event) =>
                  setOvertimeHours(
                    event.target.value
                  )
                }
              />
            </div>

            {/* Leave Type */}
            {status === "LEAVE" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Leave Type
                </label>

                <Input
                  placeholder="e.g. Annual Leave"
                  value={leaveType}
                  onChange={(event) =>
                    setLeaveType(event.target.value)
                  }
                />
              </div>
            )}
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Remarks
            </label>

            <Textarea
              placeholder="Optional remarks..."
              value={remarks}
              onChange={(event) =>
                setRemarks(event.target.value)
              }
              rows={3}
            />
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving || employees.length === 0}
            >
              {saving ? (
                <>
                  <Clock3 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Attendance
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* =====================================================
          ATTENDANCE RECORDS
      ===================================================== */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5" />
            Attendance Records
          </CardTitle>
        </CardHeader>

        <CardContent>
        {loadingRecords ? (
  <div className="py-10 text-center text-sm text-muted-foreground">
    Loading attendance...
  </div>
) : filteredRecords.length === 0 ? (
  <div className="rounded-lg bg-slate-50/70 py-10 text-center text-sm text-muted-foreground">
    No attendance records found for the selected filters.
  </div>
)  : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-3 py-3 font-medium">
                      Employee
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Date
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Check In
                    </th>

                    <th className="px-3 py-3 font-medium">
                      Check Out
                    </th>

                    <th className="px-3 py-3 text-right font-medium">
                      Hours
                    </th>

                    <th className="px-3 py-3 text-right font-medium">
                      OT
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b last:border-0"
                    >
                      <td className="px-3 py-3 font-medium">
                        {record.employeeName}
                      </td>

                      <td className="px-3 py-3">
                        {record.date}
                      </td>

                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                            record.status
                          )}`}
                        >
                          {formatStatus(
                            record.status
                          )}
                        </span>
                      </td>

                      <td className="px-3 py-3">
                        {record.checkIn || "-"}
                      </td>

                      <td className="px-3 py-3">
                        {record.checkOut || "-"}
                      </td>

                      <td className="px-3 py-3 text-right">
                        {record.workingHours
                          ? record.workingHours.toFixed(2)
                          : "0.00"}
                      </td>

                      <td className="px-3 py-3 text-right">
                        {record.overtimeHours
                          ? record.overtimeHours.toFixed(2)
                          : "0.00"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}