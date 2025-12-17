"use client";
import React, { useEffect, useState } from "react";
import { useCartContext } from "@/store/CartContext";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import { createNewOrder } from "@/app/(universal)/action/orders/dbOperations";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLanguage } from "@/store/LanguageContext";
import { formatCurrencyNumber } from "@/utils/formatCurrency";

import { calculateTaxForCart } from "@/lib/tax/calculateTaxForCart-withRounding";  // ✅ ADDED
import PaymentSelector from "@/app/(universal)/(purchase)/checkout/components/PaymentSelector";
import {
  CartItem,
 
  orderDataType,

} from "@/lib/types/cartDataType";
import {  convertProductsToCartItemsPOS } from "@/lib/cart/convertProductsToCartItems";

export default function POSCheckout() {
  const router = useRouter();
  const { TEXT } = useLanguage();
  const { cartData, setEndTotalG } = useCartContext();
  const { settings, paymentType } = UseSiteContext();

  const [itemTotal, setItemTotal] = useState(0);
  const [itemTotalFormatted, setItemTotalFormatted] = useState("");
  const [taxTotal, setTaxTotal] = useState(0);
  const [finalTotalFormatted, setFinalTotalFormatted] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // -------------------------
  // CALCULATE SUBTOTAL + TAX with YOUR LIB FUNCTION
  // -------------------------
useEffect(() => {
  if (!cartData || cartData.length === 0) return;
//const cartItems: CartItem[] = convertProductsToCartItemsPOS(cartData);
const cartItems: CartItem[] = convertProductsToCartItemsPOS(cartData);

// CartItem = {
//   id: ;
//   name: ;
//   price: ;
//   quantity: ;
//   stockQty: ;

//   // category + tax info copied from product
//   categoryId: ;
//   productCat: ;
//   taxRate:;
//   taxType: ;
//   image: ;
//    taxAmount: ;   // per one item
//   taxTotal: ;    // tax * quantity
//   finalPrice:;  // price + tax
//   finalTotal: ;  // finalPrice * quantity
// }


  async function calculateTotals() {
    // 🔥 Get tax-calculated products
    const { totalTax, products } = await calculateTaxForCart(cartItems);

    // 🔥 Subtotal BEFORE tax
    const subtotal = products.reduce(
      (sum, p) => sum + Number(p.price) * Number(p.quantity),
      0
    );

    setItemTotal(Number(subtotal.toFixed(2)));
    setTaxTotal(Number(totalTax.toFixed(2)));

    const netTotal = subtotal + totalTax;
    setEndTotalG(Number(netTotal.toFixed(2)));

    if (settings?.currency && settings?.locale) {
      setItemTotalFormatted(
        formatCurrencyNumber(subtotal, settings.currency as string, settings.locale as string)
      );
      setFinalTotalFormatted(
        formatCurrencyNumber(netTotal, settings.currency as string, settings.locale as string)
      );
    }
  }

  calculateTotals();
}, [cartData, settings]);



  // -------------------------
  // POS ORDER CREATION
  // -------------------------
  async function createPOSOrder() {
    try {
      setIsLoading(true);

      if (!paymentType) {
        toast.error("Select payment method");
        return;
      }

      if (cartData.length === 0) {
        toast.error("Cart is empty");
        return;
      }

      // Final price from state
      const endTotal = itemTotal + taxTotal;

      const posOrder = {
        userId: "POS",
        customerName: "POS Customer",
        email: "pos@local",
        cartData,
        itemTotal,
        endTotalG: endTotal,
        totalDiscountG: 0,
        addressId: "POS_ORDER",
        paymentType,
        deliveryCost: 0,
        calculatedPickUpDiscountL: 0,
        flatDiscount: 0,
        calCouponDiscount: 0,
        couponDiscountPercentL: 0,
        couponCode: "NA",
        pickUpDiscountPercentL: 0,
        noOffers: true,
      } as orderDataType;


      

      const orderResult = await createNewOrder(posOrder);

      if (!orderResult.success) {
        toast.error(orderResult.message || "Order failed");
        return;
      }

      const orderId = orderResult.orderId;

      router.push(`/pos/complete?paymentType=${paymentType}&orderMasterId=${orderId}&deliveryType=pickup`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="bg-white border rounded-2xl p-5 flex flex-col gap-4 w-full">
      <h2 className="text-xl font-semibold border-b pb-3">POS Checkout</h2>
 <PaymentSelector />
      <div className="flex justify-between text-md font-semibold">
        <span>Subtotal</span>
        <span>{itemTotalFormatted}</span>
      </div>

      <div className="flex justify-between text-md font-semibold">
        <span>Tax</span>
        <span>{settings?.currency} {taxTotal.toFixed(2)}</span>
      </div>

      <div className="flex justify-between text-lg font-bold border-t pt-3">
        <span>Total</span>
        <span>{finalTotalFormatted}</span>
      </div>

      <button
        onClick={createPOSOrder}
        disabled={isLoading}
        className="w-full px-4 py-2 font-bold rounded-xl text-[1.2rem] bg-green-600 text-white hover:bg-green-700"
      >
        {isLoading ? "Processing..." : "Confirm POS Order"}
      </button>
    </div>
  );
}
