
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type OrderStatusMap = Record<string, string>;

type OrderStatusContextType = {
  statuses: OrderStatusMap;
  getStatus: (orderId: string, fallback: string) => string;
};

const OrderStatusContext =
  createContext<OrderStatusContextType | null>(null);

type OrderStatusProviderProps = {
  children: ReactNode;
  date?: string;
  initialStatuses: OrderStatusMap;
};

export default function OrderStatusProvider({
  children,
  date,
  initialStatuses,
}: OrderStatusProviderProps) {
  const [statuses, setStatuses] =
    useState<OrderStatusMap>(initialStatuses);

  useEffect(() => {
    setStatuses(initialStatuses);
  }, [initialStatuses]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (date) {
      params.set("date", date);
    }

    const eventSource = new EventSource(
      `/api/user/orders/stream?${params.toString()}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.orders && Array.isArray(data.orders)) {
          const updatedStatuses: OrderStatusMap = {};

          for (const order of data.orders) {
            if (order.id && order.orderStatus) {
              updatedStatuses[order.id] = order.orderStatus;
            }
          }

          setStatuses(updatedStatuses);
        }
      } catch (error) {
        console.error("Order status update error:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Order status connection error:", error);
      // EventSource automatically attempts to reconnect.
    };

    return () => {
      eventSource.close();
    };
  }, [date]);

  const getStatus = useCallback(
    (orderId: string, fallback: string) => {
      return statuses[orderId] ?? fallback;
    },
    [statuses]
  );

  return (
    <OrderStatusContext.Provider value={{ statuses, getStatus }}>
      {children}
    </OrderStatusContext.Provider>
  );
}

export function useOrderStatus(
  orderId: string,
  fallback: string
) {
  const context = useContext(OrderStatusContext);

  if (!context) {
    throw new Error(
      "useOrderStatus must be used inside OrderStatusProvider"
    );
  }

  return context.getStatus(orderId, fallback);
}
