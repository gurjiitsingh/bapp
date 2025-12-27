"use client";

import { useEffect, useState } from "react";

type Schedule = {
  day: string;
  open?: string;
  close?: string;
  isClosed?: boolean;
};

export default function StoreOpenStatus({
  schedule,
}: {
  schedule: Schedule[];
}) {
  const [status, setStatus] = useState({
    isOpen: false,
    message: "",
  });

  useEffect(() => {
    if (!schedule || schedule.length === 0) return;

    const now = new Date();
    const today = now
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase();

    const todaySchedule = schedule.find(
      (d) => d.day.toLowerCase() === today
    );

    if (!todaySchedule || todaySchedule.isClosed) {
      setStatus({ isOpen: false, message: "We are closed today" });
      return;
    }

    const [openH, openM] = todaySchedule.open!.split(":").map(Number);
    const [closeH, closeM] = todaySchedule.close!.split(":").map(Number);

    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = openH * 60 + openM;
    const closeMinutes = closeH * 60 + closeM;

    if (nowMinutes >= openMinutes && nowMinutes < closeMinutes) {
      setStatus({
        isOpen: true,
        message: `Open now • Closes at ${todaySchedule.close}`,
      });
    } else {
      setStatus({
        isOpen: false,
        message: `Closed • Opens at ${todaySchedule.open}`,
      });
    }
  }, [schedule]);

  return (
    <div
      className={`p-3 rounded-md text-sm font-medium ${
        status.isOpen
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
      }`}
    >
      {status.message}
    </div>
  );
}
