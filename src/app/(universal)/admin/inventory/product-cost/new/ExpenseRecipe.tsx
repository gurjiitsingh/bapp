

"use client";

import React, { useEffect, useState } from "react";

import { Plus, Package2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ProductStockType } from "@/lib/types/productStockType";

import { addProductExpenseForCost } from "@/app/(universal)/action/otherExpenses/addProductExpenseForCost";
import { fetchProductExpenseByProductId } from "@/app/(universal)/action/otherExpenses/fetchProductExpenseByProductId";

// =====================================================
// TYPES
// =====================================================

export type ExpenseMasterType = {
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

export type ProductExpenseItemType = {
    expenseMasterId: string;
    expenseName: string;
    quantity: number;
    unit: string;
    cost: number;
    totalCost: number;
};

export type ProductExpenseRecipeType = {
    id: string;
    productId: string;
    productName: string;
    expenses: ProductExpenseItemType[];
    totalExpenseCost: number;
    createdAt?: string | null;
    updatedAt?: string | null;
};

// =====================================================
// PROPS
// =====================================================

type Props = {
    selectedProduct: ProductStockType | null;
    expenseMaster: ExpenseMasterType[];
    productExpenseRecipes: ProductExpenseRecipeType[];
};

// =====================================================
// COMPONENT
// =====================================================

export default function ExpenseRecipe({
    selectedProduct,
    expenseMaster,
    productExpenseRecipes,
}: Props) {


    // =====================================================
    // EXPENSE QUANTITIES
    // =====================================================

    const [expenseQuantities, setExpenseQuantities] =
        useState<Record<string, number>>({});

    const [expenseCosts, setExpenseCosts] =
        useState<Record<string, number>>({});

    // =====================================================
    // SUBMITTING STATE
    // =====================================================

    const [expenseSubmitting, setExpenseSubmitting] =
        useState<Record<string, boolean>>({});

    // =====================================================
    // LOAD EXISTING EXPENSES FOR SELECTED PRODUCT
    // =====================================================


    useEffect(() => {
        let cancelled = false;

        async function loadProductExpenses() {
            if (!selectedProduct?.id) {
                setExpenseQuantities({});
                setExpenseCosts({});
                return;
            }

            // Clear previous product values while loading.
            setExpenseQuantities({});
            setExpenseCosts({});

            const recipe = await fetchProductExpenseByProductId(
                selectedProduct.id
            );

            console.log("expances-----------------------",recipe)

            if (cancelled) return;

            const savedExpenseMap = new Map(
                (recipe?.expenses ?? []).map((expense) => [
                    expense.expenseMasterId,
                    expense,
                ])
            );

            const updatedQuantities: Record<string, number> = {};
            const updatedCosts: Record<string, number> = {};

            expenseMaster.forEach((expense) => {
                const saved = savedExpenseMap.get(expense.id);

                updatedQuantities[expense.id] = Number(
                    saved?.quantity ?? 0
                );

                updatedCosts[expense.id] = Number(
                    saved?.totalCost ?? 0
                );
            });

            setExpenseQuantities(updatedQuantities);
            setExpenseCosts(updatedCosts);
        }

        loadProductExpenses();

        return () => {
            cancelled = true;
        };
    }, [selectedProduct?.id, expenseMaster]);

    useEffect(() => {

        if (!selectedProduct) {
            setExpenseQuantities({});
            setExpenseCosts({});
            return;
        }

        // FIND PRODUCT EXPENSE DOCUMENT

        const productRecipe = productExpenseRecipes.find(
            (recipe) => recipe.productId === selectedProduct.id
        );

        // GET SAVED EXPENSE ARRAY

        const savedExpenses = productRecipe?.expenses ?? [];

        // CREATE EXPENSE LOOKUP MAP

        const savedExpenseMap = new Map(
            savedExpenses.map((expense) => [
                expense.expenseMasterId,
                expense,
            ])
        );

        // PREPARE INPUT VALUES

        const updatedQuantities: Record<string, number> = {};
        const updatedCosts: Record<string, number> = {};

        expenseMaster.forEach((expense) => {

            const saved = savedExpenseMap.get(expense.id);

            if (saved) {

                // EXISTING SAVED EXPENSE

                updatedQuantities[expense.id] =
                    Number(saved.quantity ?? 0);

                updatedCosts[expense.id] =
                    Number(saved.totalCost ?? 0);

            } else {

                // EXPENSE NOT YET ADDED TO PRODUCT

                updatedQuantities[expense.id] = 0;

                updatedCosts[expense.id] = 0;
            }

        });

        setExpenseQuantities(updatedQuantities);
        setExpenseCosts(updatedCosts);

    }, [
        selectedProduct?.id,
        productExpenseRecipes,
        expenseMaster,
    ]);

    // =====================================================
    // UPDATE EXPENSE QUANTITY
    // =====================================================

    const handleExpenseQuantityChange = (
        expense: ExpenseMasterType,
        quantity: number
    ) => {

        const safeQuantity = Math.max(0, quantity);

        setExpenseQuantities((prev) => ({
            ...prev,
            [expense.id]: safeQuantity,
        }));

        setExpenseCosts((prev) => ({
            ...prev,
            [expense.id]: safeQuantity * expense.cost,
        }));
    };

    // =====================================================
    // UPDATE EXPENSE COST
    // =====================================================

    const handleExpenseCostChange = (
        expense: ExpenseMasterType,
        cost: number
    ) => {

        const safeCost = Math.max(0, cost);

        setExpenseCosts((prev) => ({
            ...prev,
            [expense.id]: safeCost,
        }));

        if (expense.cost > 0) {
            setExpenseQuantities((prev) => ({
                ...prev,
                [expense.id]: safeCost / expense.cost,
            }));
        }
    };

    // =====================================================
    // SAVE PRODUCT EXPENSE
    // =====================================================

    async function onSaveExpense(
        expense: ExpenseMasterType
    ) {

        if (!selectedProduct) {
            alert("Please select a product first");
            return;
        }

        const quantity =
            expenseQuantities[expense.id] ?? 0;

        if (!Number.isFinite(quantity) || quantity <= 0) {
            alert("Please enter a valid amount required");
            return;
        }

        setExpenseSubmitting((prev) => ({
            ...prev,
            [expense.id]: true,
        }));

        try {

            const formData = new FormData();

            formData.append(
                "productId",
                selectedProduct.id
            );

            formData.append(
                "expenseMasterId",
                expense.id
            );

            formData.append(
                "quantity",
                String(quantity)
            );

            formData.append(
                "unit",
                expense.unit
            );

            const result =
                await addProductExpenseForCost(formData);

            if (result?.errors) {

                alert(
                    result.errors.duplicate ||
                    result.errors.expense ||
                    result.errors.general ||
                    "Could not save expense"
                );

                return;
            }

            alert("Expense saved successfully");

        } catch (error) {

            console.error("Expense save error:", error);

            alert("Something went wrong while saving expense");

        } finally {

            setExpenseSubmitting((prev) => ({
                ...prev,
                [expense.id]: false,
            }));

        }
    }

    // =====================================================
    // UI
    // =====================================================

    return (

        <div className="bg-white border border-gray-100 w-[500px] shadow-sm overflow-hidden h-[85dvh]">

            {/* HEADER */}

            <div className="border-b flex justify-between border-gray-100 px-1 py-1">

                <div className="flex flex-col">

                    <h2 className="text-xl font-bold text-gray-800">
                        Expense Master
                    </h2>

                    <p className="text-sm text-gray-500">
                        {selectedProduct
                            ? selectedProduct.name
                            : "Select product first"}
                    </p>

                </div>

                <div className="text-xs bg-green-50 text-green-700 px-3 py-2 rounded-xl mt-3 inline-block">
                    {expenseMaster.length} Expenses
                </div>

            </div>

            {/* EXPENSE LIST */}

            <div className="p-4 flex flex-col gap-4 overflow-y-auto h-[calc(85dvh-65px)]">

                {!selectedProduct ? (

                    <div className="h-[250px] flex flex-col items-center justify-center text-center">

                        <Package2
                            size={40}
                            className="text-gray-300 mb-3"
                        />

                        <h3 className="font-semibold text-gray-600">
                            No Product Selected
                        </h3>

                        <p className="text-sm text-gray-400 mt-1">
                            Select a product to enter expenses
                        </p>

                    </div>

                ) : expenseMaster.length === 0 ? (

                    <div className="py-10 text-center text-sm text-gray-400">
                        No expense master items found
                    </div>

                ) : (

                    expenseMaster.map((expense) => (

                        <div
                            key={expense.id}
                            className="border border-gray-100 rounded-xl p-3 flex items-center gap-3 hover:border-green-200 transition"
                        >

                            {/* EXPENSE NAME + MASTER PRICE + UNIT */}

                            <div className="min-w-[180px] flex-1">

                                <div className="font-semibold text-gray-800">
                                    {expense.name}
                                </div>

                                <div className="text-xs text-gray-500 mt-1">
                                    {expense.cost} / {expense.unit}
                                </div>

                            </div>

                            {/* AMOUNT REQUIRED */}

                            <div className="w-32 flex flex-col gap-1">

                                <label className="text-xs font-semibold text-gray-500">
                                    Amount
                                </label>

                                <input
                                    type="number"
                                    step="0.001"
                                    min="0"
                                    disabled={!selectedProduct}
                                    value={expenseQuantities[expense.id] ?? 0}
                                    onChange={(e) =>
                                        handleExpenseQuantityChange(
                                            expense,
                                            Number(e.target.value)
                                        )
                                    }
                                    className="input-style-4"
                                    placeholder="0"
                                />

                            </div>

                            {/* TOTAL COST */}

                            <div className="w-32 flex flex-col gap-1">

                                <label className="text-xs font-semibold text-gray-500">
                                    Cost
                                </label>

                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    disabled={!selectedProduct}
                                    value={expenseCosts[expense.id] ?? 0}
                                    onChange={(e) =>
                                        handleExpenseCostChange(
                                            expense,
                                            Number(e.target.value)
                                        )
                                    }
                                    className="input-style-4"
                                    placeholder="0.00"
                                />

                            </div>

                            {/* SAVE BUTTON */}

                            <Button
                                type="button"
                                disabled={
                                    !selectedProduct ||
                                    (expenseQuantities[expense.id] ?? 0) <= 0 ||
                                    !!expenseSubmitting[expense.id]
                                }
                                onClick={() => onSaveExpense(expense)}
                                className="bg-green-600 hover:bg-green-700 text-white mt-5"
                            >

                                {expenseSubmitting[expense.id] ? (
                                    "Saving..."
                                ) : (
                                    <Plus size={16} />
                                )}

                            </Button>

                        </div>

                    ))

                )}

            </div>

        </div>
    );
}

