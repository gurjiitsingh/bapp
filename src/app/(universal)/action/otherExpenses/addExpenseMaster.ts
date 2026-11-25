
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";
import { newExpenseMasterSchema } from "./OtherExpenseType";

 

// export interface ExpenseMasterErrors {
//   general?: string[];
//   name?: string[];
//   cost?: string[];
//   unit?: string[];
//   description?: string[];
//   isFavourite?: string[];
//   isActive?: string[];
// }

// export type ExpenseMasterResult =
//   | {
//       success: true;
//       id?: string;
//       message?: string;
//     }
//   | {
//       errors: ExpenseMasterErrors;
//     }; 


// export async function addExpenseMaster(
//   formData: FormData
// ): Promise<ExpenseMasterResult> {





export async function addExpenseMaster(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name"),
      cost: formData.get("cost"),
      unit: formData.get("unit"),
      description: formData.get("description") || "",
      isFavourite: formData.get("isFavourite") === "true",
      isActive: formData.get("isActive") === "true",
    };

    console.log("rawdata---------------------", rawData)
    const validation = newExpenseMasterSchema.safeParse(rawData);

    if (!validation.success) {
      return {
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const data = validation.data;

    const docRef = await adminDb
      .collection("expenseMaster")
      .add({
        name: data.name.trim(),
        cost: data.cost,
        unit: data.unit,
        description: data.description,
        isFavourite: data.isFavourite,
        isActive: data.isActive,
        createdAt: new Date(),
        modifiedAt: new Date(),
      });

    revalidateTag("expense-master", "max");
    revalidatePath("/admin/expense-master");

    return {
      success: true,
      id: docRef.id,
    };

  } catch (error) {
    console.error("ADD EXPENSE MASTER ERROR:", error);

    return {
      errors: {
        general: "Failed to save expense",
      },
    };
  }
}
