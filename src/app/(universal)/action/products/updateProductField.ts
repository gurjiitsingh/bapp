"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { fetchCategories } from "@/app/(universal)/action/category/dbOperations";
import { revalidatePath, revalidateTag } from "next/cache";



/**
 * Inline update for specific product fields (for editable table rows)
 */



export async function updateProductField(
    productId: string,
    updates: Partial<{
        name: string;
        searchCode: string;
        categoryId: string;
        price: number;
        discountPrice: number;
        taxRate: number;
        taxType: "inclusive" | "exclusive";
        currentStock: number;
        sortOrder: number;
        discountEligible: boolean;
    }>
) {
    try {

        console.log("🔥 UPDATE PRODUCT CALLED");
        console.log("🔥 productId:", productId);
        console.log("🔥 updates:", updates);
        console.log(
            "🔥 discountEligible received:",
            updates.discountEligible,
            typeof updates.discountEligible
        );


        const productRef = adminDb.collection("products").doc(productId);
        const productSnap = await productRef.get();

        if (!productSnap.exists) {
            return { success: false, error: "Product not found" };
        }

        const safeUpdates: Record<string, any> = {};

        // ✅ Sanitize input
        // ✅ Sanitize input
        for (const key in updates) {
            const val = updates[key as keyof typeof updates];

            if (val === undefined || val === null) continue;

            // Boolean fields
            if (key === "discountEligible") {
                safeUpdates[key] = Boolean(val);
                continue;
            }

            // String fields
            if (
                ["name", "searchCode", "categoryId", "taxType"].includes(key)
            ) {
                safeUpdates[key] = val;
                continue;
            }

            // Numeric fields
            if (typeof val === "string" && !isNaN(Number(val))) {
                safeUpdates[key] = parseFloat(val);
            } else {
                safeUpdates[key] = val;
            }
        }

        // ✅ Fetch category name
        if (safeUpdates.categoryId) {
            try {
                const categories = await fetchCategories();

                const matchedCategory = categories.find(
                    (cat) => cat.id === safeUpdates.categoryId
                );

                safeUpdates.productCat =
                    matchedCategory?.name ?? "Uncategorized";
            } catch (err) {
                console.error("⚠️ Failed to fetch categories:", err);
                safeUpdates.productCat = "Uncategorized";
            }
        }

        safeUpdates.updatedAt = new Date().toISOString();

        await productRef.update(safeUpdates);

        // =========================================================
        // 🔥 Revalidate cached product data
        // =========================================================
        revalidateTag("products", "max");
        //    REVALIDATE ALL PRODUCT PAGES 
        revalidatePath("/admin/store-pos/products/bulk"); // admin product list


        console.log("✅ Product updated:", productId, safeUpdates);

        return {
            success: true,
            message: "Product field updated successfully",
        };
    } catch (error) {
        console.error("❌ updateProductField error:", error);

        return {
            success: false,
            error: "Failed to update product field",
        };
    }
}