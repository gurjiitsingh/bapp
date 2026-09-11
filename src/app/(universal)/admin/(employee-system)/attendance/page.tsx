import { CalendarDays, Clock3, Users } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import AttendanceClient from "./AttendanceClient";

export default function AttendancePage() {
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
          SUMMARY
      ===================================================== */}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Employees
              </p>

              <p className="text-2xl font-semibold">
                0
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-green-100 p-3 text-green-700">
              <CalendarDays className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Present Today
              </p>

              <p className="text-2xl font-semibold">
                0
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-lg bg-orange-100 p-3 text-orange-700">
              <Clock3 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Overtime Hours
              </p>

              <p className="text-2xl font-semibold">
                0
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* =====================================================
          ATTENDANCE CLIENT
      ===================================================== */}

      <AttendanceClient />
    </div>
  );
}