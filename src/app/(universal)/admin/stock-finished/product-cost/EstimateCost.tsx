"use client";

import { useState } from "react";


 

import { ProductStockType } from "@/lib/types/productStockType";
import ProductionEstimateFormFast from "./ProductionEstimateFormFast";
import ProductSearch from "../../components/ProductSearch";
 


type Props = {
  products: ProductStockType[];
};

export default function CostEstimate({ products }: Props) {
  const [selectedProduct, setSelectedProduct] =
    useState<ProductStockType | null>(null);

  return (
    <div className="space-y-5 p-4">
      <div>
        <h1 className="text-xl font-semibold">
          Product Cost Calculator
        </h1>

        <p className="text-sm text-muted-foreground">
          Select a finished product to calculate its estimated
          production cost, including raw materials and additional expenses.
        </p>
      </div>

      <div className="max-full flex ">
        <ProductSearch
          products={products}
          selectedProductId={selectedProduct?.id}
          onSelect={(product) => {
            setSelectedProduct(product);
          }}
          placeholder="Search product to calculate cost..."
        />
     
      {selectedProduct && (


        <ProductionEstimateFormFast
          selectedProduct={selectedProduct}
          quantity={1}
          transactionUnit="kg"
        />
      )}
       </div>

    </div>
  );
}