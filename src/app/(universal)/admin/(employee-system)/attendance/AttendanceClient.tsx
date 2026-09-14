"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Save,
  UserRound,
  Pencil,
  Trash2,
  X,
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
  deleteAttendance,
} from "@/app/(universal)/action/employee-system/attendance/attendanceActions";

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
  // =========================================================
  // RECORDS
  // =========================================================

  const [records, setRecords] =
    useState<EmployeeAttendance[]>(initialRecords);

  // =========================================================
  // FORM STATE
  // =========================================================

  const [employeeId, setEmployeeId] = useState("");

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [status, setStatus] =
    useState<AttendanceStatus>("PRESENT");

 const [checkIn, setCheckIn] = useState("09:00");
const [checkOut, setCheckOut] = useState("17:00");

  const [overtimeHours, setOvertimeHours] =
    useState("0");

  const [leaveType, setLeaveType] = useState("");

  const [remarks, setRemarks] = useState("");

  // =========================================================
  // FORM / LOADING STATE
  // =========================================================

  const [saving, setSaving] = useState(false);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // EDIT STATE
  // =========================================================

  const [editingRecordId, setEditingRecordId] =
    useState<string | null>(null);

  // =========================================================
  // FILTER STATE
  // =========================================================

  const [filterDate, setFilterDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [filterEmployeeId, setFilterEmployeeId] =
    useState("ALL");

  const [filterStatus, setFilterStatus] =
    useState("ALL");

  // =========================================================
  // SELECTED EMPLOYEE
  // =========================================================

  const selectedEmployee = useMemo(
    () =>
      employees.find(
        (employee) => employee.id === employeeId
      ),
    [employees, employeeId]
  );

  // =========================================================
  // LOAD ATTENDANCE FOR FILTER DATE
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadAttendance() {
      try {
        setLoadingRecords(true);
        setError("");

        const data =
          await getAttendanceByDate(filterDate);

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
      } finally {
        if (!cancelled) {
          setLoadingRecords(false);
        }
      }
    }

    if (filterDate) {
      loadAttendance();
    }

    return () => {
      cancelled = true;
    };
  }, [filterDate]);

  // =========================================================
  // FILTER RECORDS
  // =========================================================

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
  }, [
    records,
    filterEmployeeId,
    filterStatus,
  ]);

  // =========================================================
  // CALCULATE WORKING HOURS
  // =========================================================

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

  // =========================================================
  // RESET FORM
  // =========================================================

  function resetForm() {
    setEditingRecordId(null);

    setEmployeeId("");

    setDate(
      new Date().toISOString().split("T")[0]
    );

    setStatus("PRESENT");

    // setCheckIn("");
    // setCheckOut("");

    // setOvertimeHours("0");

    setLeaveType("");

    setRemarks("");

    setError("");
  }

  // =========================================================
  // SAVE / UPDATE ATTENDANCE
  // =========================================================

  async function handleSave() {
    try {
      setError("");

      // -----------------------------------------------------
      // VALIDATION
      // -----------------------------------------------------

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

      const employeeName =
        selectedEmployee?.name || "Employee";

      // -----------------------------------------------------
      // SAVE TO FIRESTORE
      // -----------------------------------------------------

      const savedAttendance =
        await saveAttendance({
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
        });

      console.log(
        "Attendance saved successfully:",
        savedAttendance
      );

      // -----------------------------------------------------
      // RELOAD CURRENT FILTER DATE
      // -----------------------------------------------------

      const refreshedRecords =
        await getAttendanceByDate(filterDate);

      setRecords(refreshedRecords);

      // -----------------------------------------------------
      // RESET FORM
      // -----------------------------------------------------

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

  // =========================================================
  // EDIT ATTENDANCE
  // =========================================================

  function handleEdit(
    record: EmployeeAttendance
  ) {
    setEditingRecordId(record.id);

    setEmployeeId(record.employeeId);

    setDate(record.date);

    setStatus(record.status);

    setCheckIn(record.checkIn ?? "");

    setCheckOut(record.checkOut ?? "");

    setOvertimeHours(
      record.overtimeHours != null
        ? String(record.overtimeHours)
        : "0"
    );

    setLeaveType(record.leaveType ?? "");

    setRemarks(record.remarks ?? "");

    setError("");

    // Scroll back to the form
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================================================
  // DELETE ATTENDANCE
  // =========================================================

  async function handleDelete(
    record: EmployeeAttendance
  ) {
    const confirmed = window.confirm(
      `Delete attendance for ${record.employeeName} on ${record.date}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setLoadingRecords(true);

      await deleteAttendance(
        record.employeeId,
        record.date
      );

      // -----------------------------------------------------
      // REMOVE FROM CURRENT LIST
      // -----------------------------------------------------

      setRecords((current) =>
        current.filter(
          (item) => item.id !== record.id
        )
      );

      // -----------------------------------------------------
      // IF CURRENTLY EDITING THIS RECORD, CANCEL EDIT
      // -----------------------------------------------------

      if (editingRecordId === record.id) {
        resetForm();
      }
    } catch (err) {
      console.error(
        "Failed to delete attendance:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete attendance."
      );
    } finally {
      setLoadingRecords(false);
    }
  }

  // =========================================================
  // FORMAT STATUS
  // =========================================================

  function formatStatus(
    value: AttendanceStatus
  ) {
    return value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(
        /\b\w/g,
        (letter) => letter.toUpperCase()
      );
  }

  // =========================================================
  // STATUS STYLE
  // =========================================================

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

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          ADD / EDIT ATTENDANCE
      ===================================================== */}

      <Card className="border-0 shadow-sm">

        <CardHeader className="border-0 shadow-sm">

          <CardTitle className="flex items-center gap-2">

            <CalendarDays className="h-5 w-5" />

            {editingRecordId
              ? "Edit Attendance"
              : "Add Attendance"}

          </CardTitle>

        </CardHeader>

        <CardContent className="space-y-6">

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* =================================================
              EMPLOYEE + DATE
          ================================================= */}

          <div className="grid gap-4 md:grid-cols-2">

            {/* EMPLOYEE */}

            <div className="space-y-2">

              <label className="text-sm font-medium">
                Employee
              </label>

              <Select
                value={employeeId}
                onValueChange={setEmployeeId}
              >

                <SelectTrigger className="border-0 bg-slate-50 shadow-sm">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>

                <SelectContent className="border-0 shadow-sm bg-slate-50">

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

            {/* DATE */}

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

          {/* =================================================
              STATUS
          ================================================= */}

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

              <SelectTrigger className="border-0 bg-slate-50 shadow-sm">
                <SelectValue />
              </SelectTrigger>

              <SelectContent className="border-0 shadow-sm">

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

          {/* =================================================
              CHECK IN / CHECK OUT / WORKING HOURS
          ================================================= */}

          <div className="grid gap-4 md:grid-cols-3">

            {/* CHECK IN */}

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

            {/* CHECK OUT */}

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

            {/* WORKING HOURS */}

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

          {/* =================================================
              OVERTIME + LEAVE TYPE
          ================================================= */}

          <div className="grid gap-4 md:grid-cols-2">

            {/* OVERTIME */}

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

            {/* LEAVE TYPE */}

            {status === "LEAVE" && (

              <div className="space-y-2">

                <label className="text-sm font-medium">
                  Leave Type
                </label>

                <Input
                  placeholder="e.g. Annual Leave"
                  value={leaveType}
                  onChange={(event) =>
                    setLeaveType(
                      event.target.value
                    )
                  }
                />

              </div>

            )}

          </div>

          {/* =================================================
              REMARKS
          ================================================= */}

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

          {/* =================================================
              SAVE / UPDATE / CANCEL
          ================================================= */}

          <div className="flex justify-end gap-2">

            {editingRecordId && (

              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={saving}
              >

                <X className="mr-2 h-4 w-4" />

                Cancel

              </Button>

            )}

            <Button
              type="button"
              onClick={handleSave}
              disabled={
                saving ||
                employees.length === 0
              }
            >

              {saving ? (

                <>
                  <Clock3 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>

              ) : (

                <>
                  <Save className="mr-2 h-4 w-4" />

                  {editingRecordId
                    ? "Update Attendance"
                    : "Save Attendance"}

                </>

              )}

            </Button>

          </div>

        </CardContent>

      </Card>

      {/* =====================================================
          ATTENDANCE RECORDS
      ===================================================== */}

      <Card className="border-0 shadow-sm">

        <CardHeader>

          <CardTitle className="flex items-center gap-2">

            <UserRound className="h-5 w-5" />

            Attendance Records

          </CardTitle>

          {/* =================================================
              FILTERS
          ================================================= */}

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">

            {/* DATE */}

            <div>

              <label className="mb-1.5 block text-xs text-muted-foreground">
                Date
              </label>

              <Input
                type="date"
                value={filterDate}
                onChange={(event) =>
                  setFilterDate(
                    event.target.value
                  )
                }
                className="border-0 bg-slate-50 shadow-sm"
              />

            </div>

            {/* EMPLOYEE */}

            <div>

              <label className="mb-1.5 block text-xs text-muted-foreground">
                Employee
              </label>

              <Select
                value={filterEmployeeId}
                onValueChange={
                  setFilterEmployeeId
                }
              >

                <SelectTrigger className="border-0 bg-slate-50 shadow-sm">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>

                <SelectContent className="border-0 shadow-sm">

                  <SelectItem value="ALL">
                    All Employees
                  </SelectItem>

                  {employees.map(
                    (employee) => (

                      <SelectItem
                        key={employee.id}
                        value={employee.id}
                      >
                        {employee.name}
                      </SelectItem>

                    )
                  )}

                </SelectContent>

              </Select>

            </div>

            {/* STATUS */}

            <div>

              <label className="mb-1.5 block text-xs text-muted-foreground">
                Status
              </label>

              <Select
                value={filterStatus}
                onValueChange={
                  setFilterStatus
                }
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
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  );

                  setFilterEmployeeId(
                    "ALL"
                  );

                  setFilterStatus(
                    "ALL"
                  );

                }}
              >
                Reset Filters
              </Button>

            </div>

          </div>

        </CardHeader>

        <CardContent>

          {/* =================================================
              LOADING
          ================================================= */}

          {loadingRecords ? (

            <div className="py-10 text-center text-sm text-muted-foreground">
              Loading attendance...
            </div>

          ) : filteredRecords.length === 0 ? (

            <div className="rounded-lg bg-slate-50/70 py-10 text-center text-sm text-muted-foreground">
              No attendance records found for the selected filters.
            </div>

          ) : (

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

                    <th className="px-3 py-3 text-right font-medium">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredRecords.map(
                    (record) => (

                      <tr
                        key={record.id}
                        className="border-b last:border-0"
                      >

                        {/* EMPLOYEE */}

                        <td className="px-3 py-3 font-medium">
                          {record.employeeName}
                        </td>

                        {/* DATE */}

                        <td className="px-3 py-3">
                          {record.date}
                        </td>

                        {/* STATUS */}

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

                        {/* CHECK IN */}

                        <td className="px-3 py-3">
                          {record.checkIn || "-"}
                        </td>

                        {/* CHECK OUT */}

                        <td className="px-3 py-3">
                          {record.checkOut || "-"}
                        </td>

                        {/* HOURS */}

                        <td className="px-3 py-3 text-right">
                          {record.workingHours != null
                            ? record.workingHours.toFixed(2)
                            : "0.00"}
                        </td>

                        {/* OT */}

                        <td className="px-3 py-3 text-right">
                          {record.overtimeHours != null
                            ? record.overtimeHours.toFixed(2)
                            : "0.00"}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-3 py-3">

                          <div className="flex justify-end gap-1">

                            {/* EDIT */}

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                handleEdit(
                                  record
                                )
                              }
                              title="Edit attendance"
                            >

                              <Pencil className="h-4 w-4" />

                            </Button>

                            {/* DELETE */}

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                              onClick={() =>
                                handleDelete(
                                  record
                                )
                              }
                              title="Delete attendance"
                            >

                              <Trash2 className="h-4 w-4" />

                            </Button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </CardContent>

      </Card>

    </div>
  );
}