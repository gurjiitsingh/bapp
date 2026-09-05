import { Suspense } from "react";

import ListView from "./components/ListView";

import Link from "next/link";

import { Plus, Package2, ArrowLeft } from "lucide-react"; 
 
 
import { fetchCategories } from "../../action/category/dbOperations";
 
import { fetchProductsStock } from "../../action/products/fetchProductsStock";


export default async function Page() {


  return (
    <Suspense>
      <div className="min-h-screen bg-[#f8fafc]">
          {/* CONTENT */}
        <div className="p-4 md:p-6">
          <ListView />
        </div>
      </div>
    </Suspense>
  );
}



     