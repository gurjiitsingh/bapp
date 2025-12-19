type CalcInput = {
  itemTotal: number;
  deliveryFee?: number;

  // discounts
  flatDiscount?: number;
  couponDiscount?: number;
  pickupDiscount?: number;

  // tax
  taxBeforeDiscount: number;
};

export function calculateOrderTotals(input: CalcInput) {
  const {
    itemTotal,
    deliveryFee = 0,
    flatDiscount = 0,
    couponDiscount = 0,
    pickupDiscount = 0,
    taxBeforeDiscount,
  } = input;

  // -----------------------------
  // 1️⃣ TOTAL DISCOUNT
  // -----------------------------
  const discountTotal =
    flatDiscount + couponDiscount + pickupDiscount;

  // Safety guard
  const safeItemTotal = Math.max(itemTotal, 0);

  // -----------------------------
  // 2️⃣ DISCOUNT RATIO
  // -----------------------------
  const discountRatio =
    safeItemTotal > 0
      ? Math.min(discountTotal / safeItemTotal, 1)
      : 0;

  // -----------------------------
  // 3️⃣ ADJUSTED TAX
  // -----------------------------
  const taxAfterDiscount =
    taxBeforeDiscount * (1 - discountRatio);

  // -----------------------------
  // 4️⃣ SUBTOTAL (after discount, before tax)
  // -----------------------------
  const subTotal =
    safeItemTotal - discountTotal;

  // -----------------------------
  // 5️⃣ GRAND TOTAL
  // -----------------------------
  const grandTotal =
    subTotal + taxAfterDiscount + deliveryFee;

  return {
    // clean fields (new)
    discountTotal,
    taxBeforeDiscount,
    taxAfterDiscount,
    subTotal,
    deliveryFee,
    grandTotal,

    // legacy compatibility (optional but recommended)
    totalTax: taxAfterDiscount,
    endTotalG: grandTotal,
    finalGrandTotal: grandTotal,
  };
}
