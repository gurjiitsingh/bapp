import { adminDb } from "@/lib/firebaseAdmin";
import { cartProductType } from "@/lib/types/cartDataType";


type StockCheckResult = {
  success: boolean;
  message?: string;
};



export async function checkStockAvailability(
  cartData: cartProductType[]
): Promise<StockCheckResult> {
  const insufficient: string[] = [];

  for (const item of cartData) {
    if (!item.id || !item.quantity) continue;

    // 🔍 Always read stock from DB (single source of truth)
    const ref = adminDb.collection("products").doc(item.id);
    const snap = await ref.get();

    if (!snap.exists) {
      insufficient.push(`${item.name} (Product not found)`);
      continue;
    }

    const data = snap.data() as { stockQty?: number };
    const stockQty = data?.stockQty ?? 0;

    if (item.quantity > stockQty) {
      insufficient.push(
        `${item.name} (Only ${stockQty} left)`
      );
    }
  }

  if (insufficient.length > 0) {
    return {
      success: false,
      message: `Insufficient stock for: ${insufficient.join(", ")}`,
    };
  }

  return { success: true };
}

