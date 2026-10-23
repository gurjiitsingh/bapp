
"use server";

import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

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

function getTodayIndiaDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
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

function indiaDayStart(date: string): Date {
  // India uses UTC+05:30 and does not observe daylight saving time.
  return new Date(`${date}T00:00:00+05:30`);
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

    // Default to today in India.
    const selectedDate = dateFilter || getTodayIndiaDate();

    if (
      selectedDate !== "all" &&
      !isValidDate(selectedDate)
    ) {
      return {
        success: false,
        error: "Invalid order date.",
      };
    }

    let query: FirebaseFirestore.Query =
      adminDb
        .collection("orderMaster")
        .where("customerId", "==", userId);

    if (selectedDate !== "all") {
      const start = indiaDayStart(selectedDate);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

      query = query
        .where("createdAt", ">=", Timestamp.fromDate(start))
        .where("createdAt", "<", Timestamp.fromDate(end));
    }

    // Sort in Firestore, rather than loading all records to sort in JS.
    const snapshot = await query
      .orderBy("createdAt", "desc")
      .get();

    const orders: CustomerOrder[] = snapshot.docs.map((doc) => {
      const order = doc.data();
      const timestamp = order.createdAt;

      let createdAt: string | null = null;

      if (
        timestamp &&
        typeof timestamp.toDate === "function"
      ) {
        createdAt = timestamp.toDate().toISOString();
      } else if (
        typeof timestamp === "string" ||
        typeof timestamp === "number"
      ) {
        const parsed = new Date(timestamp);

        if (!Number.isNaN(parsed.getTime())) {
          createdAt = parsed.toISOString();
        }
      }

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
        createdAt,
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
