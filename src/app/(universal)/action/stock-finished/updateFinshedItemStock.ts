"use server";

import admin from "firebase-admin";
import { adminDb } from "@/lib/firebaseAdmin";
import { revalidatePath, revalidateTag } from "next/cache";

type AdjustStockType = {
  id: string;
  stockDirection: "IN" | "OUT";
  quantity: number;
  note?: string;
  createdBy?: string;
};

export async function updateFinishedItemStock({
  id,
  stockDirection,
  quantity,
  note,
  createdBy,
}: AdjustStockType) {
  try {
    // ================= VALIDATION =================
    if (!id) {
      return { success: false, message: "Product ID required" };
    }

    if (!quantity || quantity <= 0) {
      return { success: false, message: "Invalid quantity" };
    }

    const productRef = adminDb.collection("products").doc(id);

    // ================= TRANSACTION (IMPORTANT) =================
    await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(productRef);

      if (!snap.exists) {
        throw new Error("Product not found");
      }

      const data = snap.data();
      const previousStock = Number(data?.currentStock) || 0;

      let newStock = previousStock;

      if (stockDirection === "IN") {
        newStock = previousStock + quantity;
      } else {
        newStock = previousStock - quantity;

        if (newStock < 0 && !data?.allowNegativeStock) {
          throw new Error("Insufficient stock");
        }
      }

      // ✅ UPDATE STOCK
      tx.update(productRef, {
        currentStock: newStock,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // ================= OPTIONAL: STOCK HISTORY =================
      const logRef = adminDb.collection("productStockLogs").doc();

      tx.set(logRef, {
        productId: id,
        stockDirection,
        quantity,
        previousStock,
        newStock,
        note: note || "",
        createdBy: createdBy || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    // ================= REVALIDATE =================
    revalidateTag("products", "max");
    revalidatePath("/admin/products");
    revalidatePath("/admin/products/dashboard");

    return {
      success: true,
      message: "Stock updated successfully",
    };
  } catch (error: any) {
    console.error("❌ updateFinishedItemStock:", error);

    return {
      success: false,
      message: error.message || "Failed to update stock",
    };
  }
}