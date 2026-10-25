"use server";

import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { fromZonedTime } from "date-fns-tz";
import { DEFAULT_TIMEZONE } from "@/lib/localeConfig";
 

export type CustomerOrder = {
  id: string;
  srno: string;
  orderStatus: string;
  orderType: string;
  paymentStatus: string;
  paymentMode: string;
  grandTotal: number;
  customerName: string;
  createdAt: string | null;
  scheduledAt: string | null;
};

type GetCustomerOrdersResult =
  | {
      success: true;
      data: CustomerOrder[];
      date: string;
    }
  | {
      success: false;
      error: string;
    };

function getTodayLocalDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DEFAULT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

function localDayStart(date: string): Date {
  return fromZonedTime(
    `${date}T00:00:00`,
    DEFAULT_TIMEZONE
  );
}

function getNextDate(date: string): string {
  const next = new Date(`${date}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}

function timestampToISOString(value: unknown): string | null {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    const date = value.toDate();

    return date instanceof Date && !Number.isNaN(date.getTime())
      ? date.toISOString()
      : null;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return null;
}

export async function getCustomerOrders(
  userId: string,
  dateFilter?: string
): Promise<GetCustomerOrdersResult> {
  try {
    const session = await auth();

    if (
      !session?.user?.id ||
      session.user.role !== "user" ||
      session.user.id !== userId
    ) {
      return {
        success: false,
        error: "You are not authorized to view these orders.",
      };
    }

    // Default to today's date in the configured country/timezone.
    const selectedDate = dateFilter || getTodayLocalDate();

    if (
      selectedDate !== "all" &&
      !isValidDate(selectedDate)
    ) {
      return {
        success: false,
        error: "Invalid order date.",
      };
    }

    let query: FirebaseFirestore.Query = adminDb
      .collection("orderMaster")
      .where("customerId", "==", userId);

    if (selectedDate !== "all") {
      const start = localDayStart(selectedDate);
      const end = localDayStart(getNextDate(selectedDate));

      query = query
        .where("createdAt", ">=", Timestamp.fromDate(start))
        .where("createdAt", "<", Timestamp.fromDate(end));
    }

    const snapshot = await query
      .orderBy("createdAt", "desc")
      .get();

    const orders: CustomerOrder[] = snapshot.docs.map((doc) => {
      const order = doc.data();

      return {
        id: doc.id,
        srno:
          typeof order.srno === "string" ||
          typeof order.srno === "number"
            ? String(order.srno)
            : doc.id,
        orderStatus:
          typeof order.orderStatus === "string"
            ? order.orderStatus
            : "NEW",
        orderType:
          typeof order.orderType === "string"
            ? order.orderType
            : "ONLINE",
        paymentStatus:
          typeof order.paymentStatus === "string"
            ? order.paymentStatus
            : "NEW",
        paymentMode:
          typeof order.paymentMode === "string"
            ? order.paymentMode
            : "ONLINE",
        grandTotal: Number(order.grandTotal ?? 0),
        customerName:
          typeof order.customerName === "string"
            ? order.customerName
            : "",
        createdAt: timestampToISOString(order.createdAt),
        scheduledAt: timestampToISOString(order.scheduledAt),
      };
    });

    return {
      success: true,
      data: orders,
      date: selectedDate,
    };
  } catch (error) {
    console.error(
      "[CUSTOMER_ORDERS] Failed to fetch orders:",
      error
    );

    return {
      success: false,
      error: "Unable to load customer orders.",
    };
  }
}
 