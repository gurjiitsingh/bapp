"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchCategories } from "@/app/(universal)/action/category/dbOperations";
import { updateCouponExcludedCategories, fetchSingleCoupon } from "@/app/(universal)/action/coupon/dbOperation";
import { categoryType } from "@/lib/types/categoryType";
import { Button } from "@/components/ui/button";

export default function ExcludeCategorySelector() {
  const searchParams = useSearchParams();
  const couponId = searchParams.get("id") || "";

  const [categories, setCategories] = useState<categoryType[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load categories and coupon data
  useEffect(() => {
    const load = async () => {
      if (!couponId) return;

      setLoading(true);

      const [categoryData, couponData] = await Promise.all([
        fetchCategories(),
        fetchSingleCoupon(couponId)
      ]);

      setCategories(categoryData);

      const excluded = couponData?.excludedCategoryIds ?? [];
      setSelectedIds(excluded);

      setLoading(false);
    };
    load();
  }, [couponId]);

  const toggleCategory = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((catId) => catId !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!couponId) {
      alert("Invalid coupon ID");
      return;
    }

    setSaving(true);
    await updateCouponExcludedCategories(couponId, selectedIds);
    setSaving(false);
    alert("Excluded categories updated successfully");
  };

  return (
    <div className="p-5 text-slate-700">
      <h2 className="text-xl font-bold mb-4">Exclude Categories for Coupon</h2>
      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <div className="space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between bg-white p-2 rounded-md shadow"
            >
              <span>{cat.name}</span>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                />
                Exclude
              </label>
            </div>
          ))}
        </div>
      )}

      <Button
        className="form-btn mt-4"
        disabled={saving || !couponId}
        onClick={handleSave}
      >
        {saving ? "Saving..." : "Save Excluded Categories"}
      </Button>
    </div>
  );
}
