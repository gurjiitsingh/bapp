"use client";

import { Trash2 } from "lucide-react";
import { deleteUnitConversion } from "@/app/(universal)/action/inventory/init/unit-conversion/deleteUnitConversion";
import { useRouter } from "next/navigation";

export default function DeleteUnitButton({
  id,
}: {
  id: string;
}) {
  const router = useRouter();

  async function handleDelete() {
    const ok = confirm(
      "Delete this unit conversion?"
    );

    if (!ok) return;

    const result =
      await deleteUnitConversion(id);

    if (!result.success) {
      alert(result.message);
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="
        h-8 w-8
        flex items-center justify-center
        rounded-lg
        text-red-600
        hover:bg-red-50
      "
    >
      <Trash2 size={16} />
    </button>
  );
}