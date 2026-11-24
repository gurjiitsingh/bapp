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

import { addProductRecipe, addProductRecipeFast } from "@/app/(universal)/action/productRecipes/dbOperations";
import { deleteProductRecipe } from "@/app/(universal)/action/productRecipes/deleteProductRecipe";
import { MdDeleteForever } from "react-icons/md";
import { ProductStockType } from "@/lib/types/productStockType";
import { addProductExpenseRecipe } from "@/app/(universal)/action/otherExpenses/dbOperations";
import ExpenseRecipe from "./ExpenseRecipe";
import ProductSearch from "./ProductSearch";
import AddComponentForm from "./AddComponentForm";


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

          <div className="xl:col-span-2 bg-white w-[340px] h-[85dvh]  border border-gray-100 shadow-sm overflow-hidden">

            <div className="border-b border-gray-100 px-1 py-1">
              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    Recipe Components
                  </h2>

                  <p className="text-sm text-gray-500">
                    {selectedProduct
                      ? selectedProduct.name
                      : " Select product to view Recipe"}
                  </p>
                </div>

                {selectedProduct && (
                  <div className="text-sm bg-blue-50 text-blue-700 px-4 py-2 rounded-xl">
                    {
                      currentRecipes.length
                    }{" "}
                    Component
                  </div>
                )}
              </div>
            </div>

            <div className="p-6">

              {!selectedProduct ? (
                <div className="h-[350px] flex flex-col items-center justify-center text-center">

                  <Package2
                    size={50}
                    className="text-gray-300 mb-4"
                  />

                  <h3 className="text-lg font-semibold text-gray-600">
                    No Product Selected
                  </h3>

                  <p className="text-sm text-gray-400 mt-1">
                    Search and select product from top search bar
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">

                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 text-sm font-semibold text-gray-600">
                          Ingredient
                        </th>

                        <th className="text-left py-3 text-sm font-semibold text-gray-600">
                          Quantity
                        </th>

                        <th className="text-left py-3 text-sm font-semibold text-gray-600">
                          Unit
                        </th>
                        <th className="text-right py-3 text-sm font-semibold text-gray-600">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {currentRecipes.map((recipe) => (
                        <tr
                          key={recipe.id}
                          className="border-b border-gray-50 hover:bg-gray-50"
                        >
                          <td className="py-4 font-medium text-gray-800">
                            {recipe.inventoryItemName}
                          </td>

                          <td className="py-4 text-gray-600">
                            {recipe.quantity}
                          </td>

                          <td className="py-4 text-gray-600">
                            {recipe.unit}
                          </td>

                          {/* ✅ NEW DELETE BUTTON */}
                          <td className="py-4 text-right">
                            <button
                              type="button"
                              onClick={async () => {
                                if (!confirm("Delete this item?")) return;

                                const res = await deleteProductRecipe(recipe.id);

                                if (!res?.errors) {
                                  // ✅ remove locally (no refresh needed)
                                  const updated = currentRecipes.filter(
                                    (r) => r.id !== recipe.id
                                  );

                                  // hack: force refresh via state
                                  setSelectedProduct({ ...selectedProduct! });
                                }
                              }}
                              className="px-3 py-3  rounded-xl bg-rose-300 hover:bg-rose-700 text-white shadow-sm"
                            >
                              <MdDeleteForever size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                </div>
              )}
            </div>
          </div>


        </div>



      </div>
    </div>
  );
}