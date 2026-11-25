"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  ChefHat,
  Plus,
  Search,
  Package2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  ProductRecipeType,
  TnewProductRecipeSchema,
  newProductRecipeSchema,
} from "@/lib/types/ProductRecipeType";



import { InventoryItemType } from "@/lib/types/InventoryItemType";

 
import { deleteProductRecipe } from "@/app/(universal)/action/productRecipes/deleteProductRecipe";
import { MdDeleteForever } from "react-icons/md";
import { ProductStockType } from "@/lib/types/productStockType";
import { addProductExpenseRecipe } from "@/app/(universal)/action/otherExpenses/dbOperations";
import ExpenseRecipe from "./ExpenseRecipe";
import ProductSearch from "./ProductSearch";
import AddComponentForm from "./AddComponentForm";
import { addProductRecipeFast } from "@/app/(universal)/action/productRecipesF/addProductRecipeFast";


type ExpenseMasterType = {
  id: string;
  name: string;
  cost: number;
  unit: string;
  description: string;
  isFavourite: boolean;
  isActive: boolean;
  createdAt: string | null;
  modifiedAt: string | null;
};
type ProductExpenseRecipeType = {
  id: string;
  productId: string;
  expenseMasterId: string;
  quantity: number;
  unit: string;
  cost: number;
  totalCost: number;
};

type Props = {
  products: ProductStockType[];
  inventoryItems: InventoryItemType[];
  recipes: ProductRecipeType[];
  initialProductId?: string | null; // ✅ NEW
  expenseMaster: ExpenseMasterType[];
  productExpenseRecipes: ProductExpenseRecipeType[];
};

export default function FormView({
  products,
  inventoryItems,
  recipes,
  initialProductId,
  expenseMaster,
  productExpenseRecipes,
}: Props) {
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  // =====================================================
  // PRODUCT SEARCH
  // =====================================================

  const [selectedProduct, setSelectedProduct] =
    useState<ProductStockType | null>(null);


  // =====================================================
  // INVENTORY SEARCH
  // =====================================================

  const [
    inventorySearch,
    setInventorySearch,
  ] = useState("");

  const [
    showInventory,
    setShowInventory,
  ] = useState(false);



  const inventoryRef =
    useRef<HTMLDivElement>(null);

  // =====================================================
  // FORM
  // =====================================================

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TnewProductRecipeSchema>({
    resolver: zodResolver(
      newProductRecipeSchema
    ),
  });

  const selectedInventoryId = watch(
    "inventoryItemId"
  );

  // =====================================================
  // AUTO SET UNIT
  // =====================================================

  useEffect(() => {
    if (!selectedInventoryId) return;

    const inventory =
      inventoryItems.find(
        (item) =>
          item.id === selectedInventoryId
      );

    if (inventory) {
      setValue("unit", inventory.consumptionUnit);
    }
  }, [
    selectedInventoryId,
    inventoryItems,
    setValue,
  ]);


  // =====================================================
  // CLOSE DROPDOWNS
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target = event.target as Node;



      if (
        inventoryRef.current &&
        !inventoryRef.current.contains(target)
      ) {
        setShowInventory(false);
      }


    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);





  // =====================================================
  // CURRENT PRODUCT RECIPES
  // =====================================================

  const currentRecipes = useMemo(() => {
    if (!selectedProduct) return [];

    return recipes.filter(
      (recipe) =>
        recipe.productId ===
        selectedProduct.id
    );
  }, [recipes, selectedProduct]);

  // =====================================================
  // CLOSE DROPDOWNS
  // =====================================================

  useEffect(() => {
    function handleClickOutside(
      event: MouseEvent
    ) {


      if (
        inventoryRef.current &&
        !inventoryRef.current.contains(
          event.target as Node
        )
      ) {
        setShowInventory(false);
      }
    }

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (event.key === "Escape") {

        setShowInventory(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);


  // =====================================================
  // SUBMIT
  // =====================================================

  async function onSubmit(
    data: TnewProductRecipeSchema
  ) {
    setIsSubmitting(true);

    try {
      const formData = new FormData();

      formData.append(
        "productId",
        data.productId
      );

      formData.append(
        "inventoryItemId",
        data.inventoryItemId
      );

      formData.append(
        "quantity",
        String(data.quantity)
      );

      formData.append(
        "unit",
        data.unit
      );

      const result =
        await addProductRecipeFast(
          formData
        );

      if (!result?.errors) {
        reset({
          productId: data.productId,
          quantity: 0,
          unit: "",
          inventoryItemId: "",
        });

        setInventorySearch("");
      }
    } catch (error) {
      console.error(error);

      alert("Something went wrong");
    }

    setIsSubmitting(false);
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] p-1 1">
      <div className="w-full flex flex-col gap-6">
        {/* ALLREADY ADDED  */}

{/* grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] */}

        <div className="flex flex-row  gap-0 w-full items-start">


          <ProductSearch
            products={products}
            selectedProductId={selectedProduct?.id}
            onSelect={(product) => {
              setSelectedProduct(product);
              setValue("productId", product.id);
            }}
          />

          {/* RAW METIRAL */}

          <AddComponentForm
            selectedProduct={selectedProduct}
            inventoryItems={inventoryItems}
            
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />

          {/* EXPENSE LIST */}
          {/* =====================================================
              FOURTH COLUMN - EXPENSE MASTER
              ===================================================== */}

          <ExpenseRecipe
            selectedProduct={selectedProduct}
            expenseMaster={expenseMaster}
            productExpenseRecipes={productExpenseRecipes}
          />

     


        </div>



      </div>
    </div>
  );
}