import { Suspense } from "react";
import ListView from "./ListView";
import { fetchCategories } from "@/app/(universal)/action/category/fetchCategories";

export default async function Page() {
  const categories = await fetchCategories();

  return (
    <Suspense>
      <div className="h-screen flex flex-col"> 
        <ListView categories={categories} />
      </div>
    </Suspense>
  );
}