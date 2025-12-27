"use client";

import { Check } from "lucide-react";

type Props = {
  isStoreOpen: boolean;
  onSelect: (type: "instant" | "schedule") => void;
  selected?: "instant" | "schedule";
};

export default function OrderTypeSelector({
  isStoreOpen,
  onSelect,
  selected,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-3">
      {/* INSTANT ORDER */}
      <button
        disabled={!isStoreOpen}
        onClick={() => onSelect("instant")}
        className={`relative flex flex-col items-start rounded-lg border px-3 py-2 text-left transition
          ${
            selected === "instant"
              ? "bg-green-50 border-green-300"
              : "bg-white border-gray-200 hover:bg-gray-50"
          }
          ${!isStoreOpen && "opacity-50 cursor-not-allowed"}
        `}
      >
        {selected === "instant" && (
          <Check className="absolute top-2 right-2 text-green-600 w-4 h-4" />
        )}

        <span className="text-sm font-medium text-gray-800">
          Order Now
        </span>
        <span className="text-[12px] text-gray-500">
          {isStoreOpen ? "Ready immediately" : "Store closed"}
        </span>
      </button>

      {/* SCHEDULE ORDER */}
      <button
        onClick={() => onSelect("schedule")}
        className={`relative flex flex-col items-start rounded-lg border px-3 py-2 text-left transition
          ${
            selected === "schedule"
              ? "bg-green-50 border-green-300"
              : "bg-white border-gray-200 hover:bg-gray-50"
          }
        `}
      >
        {selected === "schedule" && (
          <Check className="absolute top-2 right-2 text-green-600 w-4 h-4" />
        )}

        <span className="text-sm font-medium text-gray-800">
          Schedule
        </span>
        <span className="text-[12px] text-gray-500">
          Choose date & time
        </span>
      </button>
    </div>
  );
}
