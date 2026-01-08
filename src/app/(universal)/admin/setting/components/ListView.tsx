"use client";

type productTableProps = {
  limit?: number;
  title?: string;
};

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  // TableCell,
  TableHead,
  TableHeader,
  TableRow,
  // TableCaption,
} from "@/components/ui/table";

import TableRows from "./TableRows";

import { ProductType } from "@/lib/types/productType";
import { fetchCategories } from "@/app/(universal)/action/category/dbOperations";
import { categoryType } from "@/lib/types/categoryType";
import CategoryComp from "./CategoryComp";
import { fetchProductByCategoryId } from "@/app/(universal)/action/products/dbOperation";
//import FeaturProductUpdate from "./FeaturProductUpdate";

const ListView = ({ title }: productTableProps) => {
  const [productData, setProductData] = useState<ProductType[]>([]);
  const [categoryData, setCategoryData] = useState<categoryType[]>([]);
  const [cateId, setCateId ] = useState<string>('');
  // var pageNo = 1;
  // var limit = 10

  useEffect(() => {
    async function fetchcate() {
      try {      
      const categories = await fetchCategories()
      categories.sort((a, b) => a.sortOrder! - b.sortOrder!);
        setCategoryData(categories);
       } catch (error) {
        console.log(error);
      }
    }
    fetchcate();
    
  }, []);


  useEffect(() => {
    // console.log("cat id from -------", cateId)
     async function fetchProduct() {
       try {
         const productData = await fetchProductByCategoryId(cateId);
         productData.sort((a, b) => a.sortOrder - b.sortOrder);
         setProductData(productData);
       } catch (error) {
         console.log(error);
       }
     }
     fetchProduct();
     
   }, [ cateId]);

  

  function fetchServiceHandler(id:string){
    setCateId(id)
  }

  

  return (
    <>
      <div className="mt-2 ">
      <h3 className="text-xl mb-4 font-semibold">
       Select Category
        </h3>
        <div className="flex flex-wrap gap-3">
{categoryData.map((cate)=>{
  return <CategoryComp name={cate.name} id={cate.id} key={cate.name} cateId={cateId} fetchServiceHandler={fetchServiceHandler} />
})}
          
        </div>
        <h3 className="text-2xl mb-4 font-semibold">
          {title ? title : "Products"}
        </h3>
        <div className="bg-slate-50 rounded-lg p-1">
          <Table>
            {/* <TableCaption>Product List</TableCaption> */}
            <TableHeader>
              <TableRow>
              <TableHead className="hidden md:table-cell">Image</TableHead>
                <TableHead className="hidden md:table-cell">
                   Name
                </TableHead>
                <TableHead className="hidden md:table-cell">
                   Price
                </TableHead>
                <TableHead className="hidden md:table-cell">
                   Discount Price
                </TableHead>

                {/* <TableHead>Category</TableHead> */}
                {/* <TableHead>Status</TableHead> */}
                <TableHead>Desc</TableHead>
                <TableHead className="hidden md:table-cell">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productData.map((product) => {
                return <TableRows key={product.id} product={product} />;
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default ListView;
