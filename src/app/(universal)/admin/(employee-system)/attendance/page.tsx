import { CalendarDays, Clock3, Users } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { adminDb } from "@/lib/firebaseAdmin";
import AttendanceClient from "./AttendanceClient";

export default async function AttendancePage() {
  // =====================================================
  // TODAY
  // =====================================================

  const today = new Date()
    .toISOString()
    .split("T")[0];

  // =====================================================
  // EMPLOYEES
  // =====================================================

  const employeeSnapshot = await adminDb
    .collection("employees")
    .orderBy("createdAt", "desc")
    .get();

  const employees = employeeSnapshot.docs.map((doc) => {
    const data = doc.data() as any;

    return {
      id: doc.id,
      name: `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim(),
    };
  });

  // =====================================================
  // TODAY ATTENDANCE
  // =====================================================

  const attendanceSnapshot = await adminDb
    .collection("attendance")
    .where("date", "==", today)
    .get();

  const todayAttendance = attendanceSnapshot.docs.map(
    (doc) => doc.data() as any
  );

  // =====================================================
  // TODAY SUMMARY
  // =====================================================

  const presentToday = todayAttendance.filter(
    (record) => record.status === "PRESENT"
  ).length;

  const overtimeToday = todayAttendance.reduce(
    (total, record) =>
      total + (Number(record.overtimeHours) || 0),
    0
  );

  return (
    <div className="space-y-6 p-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Attendance
        </h1>

        <p className="text-sm text-muted-foreground">
          Manage employee attendance, working hours, leave and overtime.
        </p>
      </div>

      {/* =====================================================
          TODAY SUMMARY
      ===================================================== */}

      <div className="grid gap-4 md:grid-cols-3">

        {/* EMPLOYEES */}

        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Employees
              </p>

              <p className="text-2xl font-semibold">
                {employees.length}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* PRESENT TODAY */}

        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-green-100 p-3 text-green-700">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Present Today
              </p>

              <p className="text-2xl font-semibold">
                {presentToday}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* OVERTIME */}

        <Card className="border-0 shadow-sm">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-orange-100 p-3 text-orange-700">
              <Clock3 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Overtime Hours
              </p>

              <p className="text-2xl font-semibold">
                {overtimeToday.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* =====================================================
          ATTENDANCE CLIENT
      ===================================================== */}

      <AttendanceClient employees={employees} />
    </div>
  );
}