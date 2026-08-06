"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Search, Package2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getDepartmentStock,

} from "@/app/(universal)/action/production/departments/getDepartmentStock";

import { autoStockProduction } from "@/app/(universal)/action/stock-finished/autoStockProduction";

import { InventoryItemType, InventoryUnit } from "@/lib/types/InventoryItemType";
import { ProductStockType } from "@/lib/types/productStockType";
import toast from "react-hot-toast";
import Link from "next/link";
import { DepartmentStockType } from "@/lib/types/department/DepartmentStockType";
 

type Props = {
  products: ProductStockType[];
  departments: { id: string; name: string; employeeCount: number, managerName: string; }[];
  inventoryItems: InventoryItemType[];
};

type FormType = {
  id: string;
  quantity: number;
  transactionUnit: InventoryUnit;
  note: string;
};

export default function ProductionForm({
  products,
  departments,
  inventoryItems,
}: Props) {

  const [departmentStock, setDepartmentStock] = useState<DepartmentStockType[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [showDropdown, setShowDropdown] =
    useState(false);

  const [
    selectedProduct,
    setSelectedProduct,
  ] = useState<ProductStockType | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
  } = useForm<FormType>({
    defaultValues: {
      quantity: 0,
      transactionUnit: "kg",
      note: "",
    },
  });


  const transactionUnit = watch("transactionUnit");
  const productionQuantity = watch("quantity");

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return [];

    return products
      .filter((item) =>
        item.name
          ?.toLowerCase()
          .includes(search.toLowerCase())
      )
      .slice(0, 20);
  }, [search, products]);







  async function onSubmit(data: FormType) {
    if (isSubmitting) return;

    if (!selectedProduct) {
      toast.error("Please select a product.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await autoStockProduction({
        id: data.id,
        batchId: "fromUpdate",
        productName: selectedProduct.name,
        sellingPrice: selectedProduct.sellingPrice,
        wholesalePrice: selectedProduct.wholesalePrice!,
        costPrice: selectedProduct.costPrice,
        avgCost: selectedProduct.avgCost!,
        direction: "IN",
        quantity: Number(data.quantity),
        transactionUnit: data.transactionUnit,
        note: data.note,
        createdBy: "admin",


        departmentId,
        departmentName: selectedDepartment?.name || "",
        managerName: selectedDepartment?.managerName || "",
        employeeCount: selectedDepartment?.employeeCount || 0,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      setSelectedProduct({
        ...selectedProduct,
        currentStock:
          (selectedProduct.currentStock || 0) +
          Number(data.quantity),
      });

      reset({
        id: selectedProduct.id,
        quantity: 0,
        transactionUnit: transactionUnit,
        note: "",
      });
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }
      


const selectedDepartment = departments.find(
  (d) => d.id === departmentId
);



  async function addDummyProductionForAllProducts() {

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {

      let successCount = 0;


      for (const product of products) {

        const result = await autoStockProduction({

          id: product.id,

          batchId: "dummy-production",

          productName: product.name,

          sellingPrice:
            product.sellingPrice ?? 0,

          wholesalePrice:
            product.wholesalePrice ?? 0,

          costPrice:
            product.costPrice ?? 0,

          avgCost:
            product.avgCost ?? 0,


          direction: "IN",


          // ADD 100 QTY FOR EVERY PRODUCT
          quantity: 100,


          transactionUnit:
            product.sellingUnit ?? "kg",


          note: "Dummy production stock",

          createdBy: "admin",


          departmentId: "DUMMY",

          departmentName:
            "Dummy Production",

          managerName:
            "Admin",

          employeeCount: 0,

        });


        if (result.success) {

          successCount++;

          console.log(
            "Dummy stock added:",
            product.name
          );

        } else {

          console.error(
            "Failed:",
            product.name,
            result.message
          );

        }

      }


      toast.success(
        `${successCount} products stock added successfully`
      );


    } catch (error) {

      console.error(
        "Dummy production error:",
        error
      );

      toast.error(
        "Failed to add dummy stock"
      );


    } finally {

      setIsSubmitting(false);

    }

  }

  useEffect(() => {
    async function loadDepartmentStock() {
      if (!departmentId) {
        setDepartmentStock([]);
        return;
      }

      try {
        const stock = await getDepartmentStock(departmentId);
        setDepartmentStock(stock);

        // Optional: clear previous items
        setItems([]);
      } catch (e) {
        console.error(e);
        toast.error("Failed to load department stock");
      }
    }

    loadDepartmentStock();
  }, [departmentId]);

  return (
  <Button
  type="button"
  disabled={isSubmitting}
  onClick={addDummyProductionForAllProducts}
  className="h-11 bg-green-600 hover:bg-green-700"
>
  {isSubmitting
    ? "Adding Stock..."
    : "Add Dummy 100 Qty All Products"}
</Button>
  );
}