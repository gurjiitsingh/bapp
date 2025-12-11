"use client";

import React, { useEffect, useState } from "react";
import { fetchCategories, updateCategoryFlag } from "@/app/(universal)/action/category/dbOperations";
import { categoryType } from "@/lib/types/categoryType";
import { Button } from "@/components/ui/button";

const CategoryTogglePage = () => {
  const [categoryData, setCategoryData] = useState<categoryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      setLoading(true);
      const data = await fetchCategories();
      setCategoryData(data);
      setLoading(false);
    }
    loadCategories();
  }, []);

  const toggleFlag = (index: number) => {
    const newData = [...categoryData];
    newData[index].disablePickupDiscount = !newData[index].disablePickupDiscount;
    setCategoryData(newData);
  };

  const handleSave = async () => {
    setSaving(true);
    const promises = categoryData.map((category) =>
      updateCategoryFlag(category.id, category.disablePickupDiscount || false)
    );
    await Promise.all(promises);
    setSaving(false);
    alert("Changes saved successfully");
  };

  return (
    <div className="p-5 text-slate-500">
      <h1 className="text-xl font-bold mb-4">Disable Pickup Discount</h1>

      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <div className="flex flex-col gap-2">
          {categoryData.map((cat, index) => (
            <div
              key={cat.id}
              className="flex items-center justify-between bg-white p-2 rounded-xl shadow "
            >
              <span>{cat.name}</span>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!cat.disablePickupDiscount}
                  onChange={() => toggleFlag(index)}
                />
                <span>Disable Pickup Discount</span>
              </label>
            </div>
          ))}

          <Button disabled={saving} onClick={handleSave} className="form-btn-style">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CategoryTogglePage;
