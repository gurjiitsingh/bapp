'use client';

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
//import { getAllCategories, setDisplayCategory } from "@/app/(universal)/action/setting/dbOperations";
import Link from "next/link";
import { fetchCategories } from "@/app/(universal)/action/category/dbOperations";
import { setDisplayCategory } from "@/app/(universal)/action/setting/dbOperations";


type Category = {
  id: string;
  name: string;
};

type FormData = {
  category_id: string;
};

export default function DisplayCategoryForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategoriesData = async () => {
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (error: any) {
        alert("Failed to load categories: " + error.message);
      }
    };
    fetchCategoriesData();
  }, []);

  const onSubmit = async (data: FormData) => {

      try {
      await setDisplayCategory(data.category_id);
      alert("Display category set successfully!");
    } catch (error: any) {
      alert("Failed to set display category: " + error.message);
    }
  };

  return (
    <div className="h-screen flex flex-col gap-3">
      <div className="flex justify-start gap-3">
        <Link href='/admin/categories/disable-display'>
          <button className="bg-[#313131] text-sm text-white px-4 py-2 rounded-lg">
            Disable display category
          </button>
        </Link>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 border rounded-lg bg-white shadow-md">
        <label className="block text-sm font-medium text-gray-700">Select Display Category</label>
        <select
          {...register("category_id", { required: true })}
          className="block w-full mt-1 p-2 border border-gray-300 rounded-md"
          defaultValue=""
        >
          <option value="" disabled>Select a category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.category_id && <span className="text-red-500 text-sm">Please select a category</span>}

        <button
          type="submit"
          className="form-btn "
        >
          Save Category
        </button>
      </form>
    </div>
  );
}
