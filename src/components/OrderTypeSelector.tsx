"use client";

type Props = {
  isStoreOpen: boolean;
  onSelect: (type: "instant" | "schedule") => void;
};

export default function OrderTypeSelector({ isStoreOpen, onSelect }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {/* Instant Order */}
      <button
        disabled={!isStoreOpen}
        onClick={() => onSelect("instant")}
        className={`p-5 rounded-xl border transition
          ${isStoreOpen
            ? "bg-green-50 border-green-400 hover:bg-green-100"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
      >
        <h3 className="font-semibold">Order Now</h3>
        <p className="text-sm">
          {isStoreOpen ? "Get your food immediately" : "Store is closed"}
        </p>
      </button>

      {/* Scheduled Order */}
      <button
        onClick={() => onSelect("schedule")}
        className="p-5 rounded-xl border bg-blue-50 hover:bg-blue-100"
      >
        <h3 className="font-semibold">Schedule Order</h3>
        <p className="text-sm">Choose date & time</p>
      </button>
    </div>
  );
}
