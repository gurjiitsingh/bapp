
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { revalidatePath, revalidateTag } from "next/cache";
import { newOtherExpenseSchema, OtherExpenseType } from "./OtherExpenseType";
 


import { cache } from "react";
 

// FETCH ALL INVENTORY ITEMS
export const fetchProductionExp = cache(
  async (): Promise<ProductionExpType[]> => {
    try {
      const snapshot = await adminDb
        .collection("productionExp")
        //.orderBy("createdAt", "desc")
        .get();

      const ProductionExp = snapshot.docs.map((doc) => {
        const data = doc.data();


  //       purchaseMappings:
  // data.purchaseMappings?.length
  //   ? data.purchaseMappings
  //   : [
  //       {
  //         purchaseUnit:
  //           data.purchaseUnit ||
  //           data.consumptionUnit ||
  //           "pcs",
  //         consumptionUnit:
  //           data.consumptionUnit || "pcs",
  //         factor:
  //           Number(data.conversionFactor) || 1,
  //       },
  //     ],

      return {
  id: doc.id,

  name: data.name || "",

  sku: data.sku || "",

  barcode: data.barcode || "",

  consumptionUnit:
    data.consumptionUnit || "pcs",

  purchaseMappings:
    data.purchaseMappings || [],
purchaseUnit:data.purchaseUnit || "",
conversionFactor:data.conversionFactor || 1 ,
    
  currentStock:
    Number(data.currentStock) || 0,

  minStock:
    Number(data.minStock) || 0,

  averageCost:
    Number(data.averageCost) || 0,
purchaseUnitCost:  Number(data.purchaseUnitCost) || 0,
  stockValue:
    Number(data.stockValue) || 0,

  sellingPrice:
    Number(data.sellingPrice) || 0, 

  categoryId:
    data.categoryId || "",

  supplierId:
    data.supplierId || "",

  supplierIds:
    data.supplierIds || [],

  isActive:
    data.isActive ?? true,

  createdAt:
    data.createdAt?.toDate?.().toISOString() || null,

  updatedAt:
    data.updatedAt?.toDate?.().toISOString() || null,
};
      }) as ProductionExpType[];

      return ProductionExp;
    } catch (error) {
      console.error(
        "❌ Error fetching inventory items:",
        error
      );

      return [];
    }
  }
);


export async function deleteProductionExp(id: string) {
  try {
    // ==========================
    // CHECK TRANSACTIONS
    // ==========================

    // const transactionSnapshot = await adminDb
    //   .collection("inventoryTransactions")
    //   .where("ProductionExpId", "==", id)
    //   .limit(1)
    //   .get();

    // if (!transactionSnapshot.empty) {
    //   return {
    //     success: false,
    //     message:
    //       "Inventory item has transaction history and cannot be deleted.",
    //   };
    // }

    // ==========================
    // FIND RELATED RECIPES
    // ==========================

    const recipeSnapshot = await adminDb
      .collection("productRecipes")
      .where("ProductionExpId", "==", id)
      .get();

    // ==========================
    // DELETE RECIPES + INVENTORY
    // ==========================

    const batch = adminDb.batch();

    // Remove all recipe entries using this inventory item
    recipeSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete inventory item
    const inventoryRef = adminDb
      .collection("productionExp")
      .doc(id);

    batch.delete(inventoryRef);

    await batch.commit();

    // ==========================
    // REVALIDATE
    // ==========================

    revalidateTag("inventory-items", "max");

    revalidatePath("/admin/stock-finished/");
    revalidatePath("/admin/stock-finished/form");
    revalidatePath("/admin/stock-finished/editform");

    return {
      success: true,
      message: recipeSnapshot.empty
        ? "Inventory item deleted successfully."
        : `Inventory item deleted successfully. ${recipeSnapshot.size} recipe entries were also removed.`,
    };
  } catch (error) {
    console.error("❌ Error deleting inventory item:", error);

    return {
      success: false,
      message: "Failed to delete inventory item.",
    };
  }
}


 


// FETCH SINGLE INVENTORY ITEM
export async function fetchProductionExpById(
  id: string
): Promise<ProductionExpType | null> {

 
  try {
    const docRef = await adminDb
      .collection("productionExp")
      .doc(id)
      .get();

    if (!docRef.exists) {
      return null;
    }

    return {
      id: docRef.id,
      ...docRef.data(),
    } as ProductionExpType;
  } catch (error) {
    console.error(
      "❌ Error fetching inventory item:",
      error
    );

    return null;
  }
}



export async function getProductionExpById(
  id: string
): Promise<ProductionExpType | null> {
  try {
    const docRef = await adminDb
      .collection("productionExp")
      .doc(id)
      .get();

    if (!docRef.exists) {
      return null;
    }

    const data = docRef.data();
console.log("data-------------------------")
    return {
      id: docRef.id,

      ...data,

createdAt:
  data?.createdAt &&
  typeof data.createdAt.toMillis === "function"
    ? data.createdAt.toMillis()
    : typeof data?.createdAt === "number"
    ? data.createdAt
    : null,

updatedAt:
  data?.updatedAt &&
  typeof data.updatedAt.toMillis === "function"
    ? data.updatedAt.toMillis()
    : typeof data?.updatedAt === "number"
    ? data.updatedAt
    : null,
    } as any;

    
  } catch (error) {
    console.error(
      "❌ Error fetching inventory item:",
      error
    );

    return null;
  }
}




















// =====================================================
// ADD OTHER EXPENSE
// =====================================================

export async function addOtherExpense(formData: FormData) {
  try {
    const receivedData = {
      expenseName: formData.get("expenseName") as string,
      amount: formData.get("amount"),
      expenseDate: formData.get("expenseDate") as string,
      description: (formData.get("description") as string) || "",
    };

    // VALIDATION
    const result = newOtherExpenseSchema.safeParse(receivedData);

    if (!result.success) {
      const zodErrors: Record<string, string> = {};

      result.error.issues.forEach((issue) => {
        zodErrors[String(issue.path[0])] = issue.message;
      });

      return { errors: zodErrors };
    }

    const {
      expenseName,
      amount,
      expenseDate,
      description,
    } = result.data;

    // FIRESTORE DATA
    const data: Omit<OtherExpenseType, "id"> = {
      expenseName,
      amount,
      expenseDate,
      description,

      createdAt: admin.firestore.FieldValue.serverTimestamp() as any,
    };

    console.log("expense data-------------", data);

    // SAVE
    const docRef = await adminDb
      .collection("productionExp")
      .add(data);

    // REVALIDATE
    revalidateTag("other-expenses", "max");

    revalidatePath("/admin/other-expenses");

    return {
      success: true,
      message: "Expense added successfully",
      id: docRef.id,
    };

  } catch (error) {
    console.error("❌ Other expense save failed:", error);

    return {
      errors: {
        general: "Could not save expense",
      },
    };
  }
}

// =====================================================
// FETCH OTHER EXPENSES
// =====================================================

export async function fetchOtherExpenses(): Promise<OtherExpenseType[]> {
  try {
    const snapshot = await adminDb
      .collection("productionExp")
      .orderBy("expenseDate", "desc")
      .get();

    if (snapshot.empty) return [];

    return snapshot.docs.map((doc) => {
      const data = doc.data();

      let createdAt: string | null = null;

      if (data.createdAt?.toDate) {
        createdAt = data.createdAt.toDate().toISOString();
      } else if (typeof data.createdAt === "string") {
        createdAt = data.createdAt;
      }

      return {
        id: doc.id,
        expenseName: data.expenseName ?? "",
        amount: data.amount ?? 0,
        expenseDate: data.expenseDate ?? "",
        description: data.description ?? "",
        createdAt,
      };
    });

  } catch (error) {
    console.error("❌ Failed to fetch other expenses:", error);
    return [];
  }
}
