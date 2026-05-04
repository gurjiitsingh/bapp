"use client";

import { getModifierGroups } from "@/app/(universal)/action/modifierGroups/dbOperation";
import { getProductModifiers, saveProductModifiers } from "@/app/(universal)/action/productModifier/dbOpertaion";
import { useEffect, useState } from "react";

export default function ModifierModal({
  productId,
  onClose,
}: {
  productId: string;
  onClose: () => void;
}) {
  const [groups, setGroups] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getModifierGroups();
      setGroups(data);
    }
    load();
  }, []);

  useEffect(() => {
    async function load() {
      const data = await getProductModifiers(productId);
      setSelected(data.map((d: any) => d.groupId));
    }
    load();
  }, [productId]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  }

  async function save() {
    await saveProductModifiers(productId, selected);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-lg w-[400px]">
        <h2 className="text-lg font-semibold mb-4">
          Assign Modifiers
        </h2>

        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {groups.map((g) => (
            <label key={g.id} className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={selected.includes(g.id)}
                onChange={() => toggle(g.id)}
              />
              {g.name}
            </label>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose}>Cancel</button>

          <button
            onClick={save}
            className="bg-green-600 text-white px-3 py-1 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}