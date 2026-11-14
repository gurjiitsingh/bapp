
"use client";

import { useOrderStatus } from "./OrderStatusProvider";

type LiveStatusBadgeProps = {
  orderId: string;
  initialStatus: string;
};

export default function LiveStatusBadge({
  orderId,
  initialStatus,
}: LiveStatusBadgeProps) {
  const status = useOrderStatus(orderId, initialStatus);

  const getStatusStyle = (value: string) => {
    switch (value.toUpperCase()) {
      case "COMPLETED":
      case "READY":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      case "PREPARING":
      case "ACCEPTED":
        return "bg-amber-100 text-amber-700";

      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const formatStatus = (value: string) =>
    value
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
        status
      )}`}
    >
      {formatStatus(status)}
    </span>
  );
}
