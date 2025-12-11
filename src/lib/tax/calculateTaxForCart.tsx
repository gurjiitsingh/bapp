import { CartItem } from "../types/cartDataType";

export async function calculateTaxForCart(cartItems: CartItem[]) {
  let totalTax = 0;

  const products = cartItems.map((item) => {
    const price = Number(item.price);  // 🔥 convert to number
    const qty = Number(item.quantity);

    const taxRate = item.taxRate ?? 0;
    const isExclusive = item.taxType === "exclusive";

    let taxAmount = 0;
    let finalPrice = price;

    if (isExclusive) {
      taxAmount = Number((price * (taxRate / 100)).toFixed(3));
      finalPrice = Number((price + taxAmount).toFixed(3)); // 🔥 numeric final price
    } else {
      // inclusive tax (optional)
      taxAmount = Number((price - price / (1 + taxRate / 100)).toFixed(3));
      finalPrice = price;
    }

    const taxTotal = Number((taxAmount * qty).toFixed(3));
    const finalTotal = Number((finalPrice * qty).toFixed(3)); // 🔥 numeric final total

    totalTax += taxTotal;

    return {
      ...item,
      taxAmount,
      taxTotal,
      finalPrice,
      finalTotal,
    };
  });

  return {
    totalTax: Number(totalTax.toFixed(3)),
    products,
  };
}