
"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  currentQuantity: number;
  onSave: (newQuantity: number) => Promise<void>;
};

export default function EditVanStockDialog({
  open,
  onOpenChange,
  productName,
  currentQuantity,
  onSave,
}: Props) {
  const [quantity, setQuantity] = useState(
    String(currentQuantity)
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setQuantity(String(currentQuantity));
    }
  }, [open, currentQuantity]);

  const newQuantity = Number(quantity);
  const difference = newQuantity - currentQuantity;

  async function handleSave() {
    if (
      quantity.trim() === "" ||
      !Number.isInteger(newQuantity) ||
      newQuantity < 0
    ) {
      return;
    }

    try {
      setSaving(true);

      await onSave(newQuantity);

      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-24px)] sm:max-w-sm bg-white">

        <DialogHeader>
          <DialogTitle>Edit Van Stock</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          <div>
            <p className="text-sm font-semibold text-slate-800">
              {productName}
            </p>
            <p className="text-xs text-slate-500">
              Adjust the loaded quantity
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">

            <div className="rounded-lg bg-slate-100 p-3">
              <p className="text-xs text-slate-500">
                Current Quantity
              </p>
              <p className="text-xl font-bold">
                {currentQuantity}
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-xs text-blue-600">
                Correct Quantity
              </p>
              <p className="text-xl font-bold text-blue-700">
                {quantity || 0}
              </p>
            </div>

          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              New Van Quantity
            </label>

            <Input
              type="number"
              min={0}
              step={1}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="h-12 text-center text-lg font-bold"
            />
          </div>

          <div className="rounded-lg bg-slate-50 p-3 flex justify-between">
            <span className="text-sm text-slate-600">
              Difference
            </span>

            <span className={`text-sm font-bold ${
              difference < 0
                ? "text-red-600"
                : difference > 0
                ? "text-green-600"
                : "text-slate-600"
            }`}>
              {difference > 0 ? "+" : ""}
              {difference}
            </span>
          </div>

        </div>

        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={
              saving ||
              quantity.trim() === "" ||
              !Number.isInteger(newQuantity) ||
              newQuantity < 0 ||
              newQuantity === currentQuantity
            }
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
