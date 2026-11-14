
import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { adminDb } from "@/lib/firebaseAdmin";
import { fromZonedTime } from "date-fns-tz";
import { DEFAULT_TIMEZONE } from "@/lib/localeConfig";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Keep the existing NextAuth authentication.
  const session = await auth();

  const userId = session?.user?.id;

  if (!userId || session?.user?.role !== "user") {
    return new Response("Unauthorized", { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date");

  let query: FirebaseFirestore.Query = adminDb
    .collection("orderMaster")
    .where("customerId", "==", userId);

  // Apply the selected date unless the customer is viewing all orders.
  if (date && date !== "all") {
    const validDate =
      /^\d{4}-\d{2}-\d{2}$/.test(date) &&
      !Number.isNaN(Date.parse(`${date}T00:00:00Z`)) &&
      new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) === date;

    if (!validDate) {
      return new Response("Invalid date", { status: 400 });
    }

    const nextDate = new Date(`${date}T00:00:00Z`);
    nextDate.setUTCDate(nextDate.getUTCDate() + 1);
    const nextDateString = nextDate.toISOString().slice(0, 10);

    const start = fromZonedTime(
      `${date}T00:00:00`,
      DEFAULT_TIMEZONE
    );

    const end = fromZonedTime(
      `${nextDateString}T00:00:00`,
      DEFAULT_TIMEZONE
    );

    query = query
      .where("createdAt", ">=", start)
      .where("createdAt", "<", end);
  }

  query = query.orderBy("createdAt", "desc");

  const encoder = new TextEncoder();

  let unsubscribe: (() => void) | undefined;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let isClosed = false;

  const stream = new ReadableStream({
    start(controller) {
      const send = (data: unknown) => {
        if (isClosed) return;

        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          close();
        }
      };

      const close = () => {
        if (isClosed) return;

        isClosed = true;

        if (heartbeat) clearInterval(heartbeat);
        if (unsubscribe) unsubscribe();

        try {
          controller.close();
        } catch {
          // Stream may already be closed.
        }
      };

      // Keep the connection alive through proxies.
      heartbeat = setInterval(() => {
        if (!isClosed) {
          try {
            controller.enqueue(encoder.encode(": keep-alive\n\n"));
          } catch {
            close();
          }
        }
      }, 25000);

      unsubscribe = query.onSnapshot(
        (snapshot) => {
          const orders = snapshot.docs.map((doc) => ({
            id: doc.id,
            orderStatus: doc.get("orderStatus") ?? "PENDING",
          }));

          send({ orders });
        },
        (error) => {
          console.error("Customer order stream error:", error);
          send({ error: "Unable to receive order updates" });
          close();
        }
      );

      request.signal.addEventListener("abort", close);
    },

    cancel() {
      isClosed = true;

      if (heartbeat) clearInterval(heartbeat);
      if (unsubscribe) unsubscribe();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
