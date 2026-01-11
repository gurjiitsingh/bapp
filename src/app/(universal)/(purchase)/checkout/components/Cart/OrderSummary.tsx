"use client";
import React, { useEffect, useState } from "react";
import { useCartContext } from "@/store/CartContext";
import DeliveryFee from "@/components/checkout/DeliveryFee"
import { FaChevronDown } from "react-icons/fa";
import CouponDiscForm from "./CouponDiscForm";
import { UseSiteContext } from "@/SiteContext/SiteContext";

import Pickup from "./Pickup";
import CouponDisc from "./CouponDisc";
import { cartProductType, orderDataType } from "@/lib/types/cartDataType";
import { createNewOrder } from "@/app/(universal)/action/orders/dbOperations";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLanguage } from "@/store/LanguageContext";
import { formatCurrencyNumber } from "@/utils/formatCurrency";
import SetDeliveryType from "./SetDeliveryType";

type OrderSummaryProps = {
  //orderType: "delivery" | "pickup" | "dine_in" | "schedule" | string |;
  isStoreOpen?: boolean;
  // scheduledAt?: string | null;
};


export default function OrderSummary({
  isStoreOpen
  }: OrderSummaryProps) {
  const { TEXT } = useLanguage();
  const {
    couponDisc,
    deliveryDis,
    paymentType,
    deliveryType,
    customerAddressIsComplete,
    setdeliveryFee,
    disablePickupCatDiscountIds,
    settings,
  } = UseSiteContext();

  const router = useRouter();

  const [addCoupon, setAddCoupon] = useState(false);
  const [itemTotal, setitemTotal] = useState(0);
  const [itemTotalComa, setitemTotalComa] = useState("");
  const [pickUpDiscountPercentL, setPickUpDiscountPercent] = useState(0);
  const [calculatedPickUpDiscountL, setCalculatedPickUpDiscount] = useState(0);
  const [endTotalComma, setEndTotalComma] = useState("");
  const [deliveryFee, setdeliveryFeeL] = useState(0);
  const [calcouponPercent, setCalCouponDisscount] = useState(0);
  const [flatcouponPercent, setFlatCouponDisscount] = useState(0);
  const [couponPercentPercentL, setcouponPercentPercentL] = useState(0);

  const [orderAmountIsLowForDelivery, seOrderAmountIsLowForDelivery] =
    useState(false);
  const [noOffers, setNoOffers] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [filteredCategoryDiscount, setFilteredCategoryDiscount] = useState(0);
  const [onlyItemsWithDisabledCouponCode, setOnlyItemsWithDisabledCouponCode] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    cartData,
    setEndTotalG,
    setTotalDiscountG,
    endTotalG,
    totalDiscountG,
    scheduledAt,
    setOrderType,
    setTableNo,
    orderType,
    tableNo,
  } = useCartContext();

  useEffect(() => {
    setOrderType("DELIVERY");
    setTableNo(null);
  }, []);

  const [pickupDiscountPersent, setPickupDiscountPersent] = useState(0);

  useEffect(() => {
    if (settings?.pickup_discount !== undefined) {
      setPickupDiscountPersent(Number(settings.pickup_discount));
    }
  }, [settings?.pickup_discount]);

  useEffect(() => {
    if (!cartData || cartData.length === 0) return;

    let total = 0;
    let filteredTotal = 0;

    cartData.forEach((item: cartProductType) => {
      const quantity = Number(item.quantity) || 0;
      const price = parseFloat(item.price as any) || 0;
      const itemTotal = quantity * price;
      total += itemTotal;

      if (disablePickupCatDiscountIds?.includes(item.categoryId)) {
        filteredTotal += itemTotal;
      }
    });

    const roundedTotal = parseFloat(total.toFixed(2));
    setitemTotal(roundedTotal);

    // 🧾 Calculate pickup discount (independent of settings)
    const pickupDiscountAmount = calculateDiscount(
      filteredTotal,
      pickupDiscountPersent
    );
    setFilteredCategoryDiscount(pickupDiscountAmount);

    function calculateDiscount(
      total: number,
      percent: number | string | undefined | null
    ): number {
      const safeTotal = typeof total === "number" ? total : 0;
      const safePercent = Number(percent);
      if (isNaN(safePercent) || safePercent <= 0) return 0;
      return parseFloat(((safeTotal * safePercent) / 100).toFixed(2));
    }
  }, [cartData, pickupDiscountPersent, disablePickupCatDiscountIds]);

  useEffect(() => {
    if (!settings?.currency || !settings?.locale) return;
    if (itemTotal <= 0) return;

    const roundedTotalCU = formatCurrencyNumber(
      itemTotal,
      settings.currency as string,
      settings.locale as string
    );
    setitemTotalComa(roundedTotalCU);
  }, [itemTotal, settings?.currency, settings?.locale]);

  useEffect(() => {
    if (itemTotal <= 0) return;

    if (deliveryType === "pickup") {
      const pickupDiscount =
        ((itemTotal - flatcouponPercent - calcouponPercent) *
          pickupDiscountPersent) /
        100;

      const pickupDiscountRemovedCate = (
        pickupDiscount - filteredCategoryDiscount
      ).toFixed(2);

      setCalculatedPickUpDiscount(+pickupDiscountRemovedCate);
      setdeliveryFeeL(0);
      if (parseInt(pickupDiscountRemovedCate) === 0) {
        setPickUpDiscountPercent(0);
      } else {
        setPickUpDiscountPercent(pickupDiscountPersent);
      }
    } else if (
      deliveryType === "delivery" &&
      deliveryDis?.deliveryFee !== undefined
    ) {
      setdeliveryFeeL(+deliveryDis.deliveryFee);
      setPickUpDiscountPercent(0);
      setCalculatedPickUpDiscount(0);
    }
  }, [
    deliveryType,
    itemTotal,
    deliveryDis,
    pickupDiscountPersent,
    filteredCategoryDiscount,
    flatcouponPercent,
    calcouponPercent,
  ]);

  useEffect(() => {
    if (itemTotal <= 0) return;
    // console.log("applyDelivery, applyPickup-------", couponDisc?.applyDelivery,couponDisc?.applyPickup)

    if (deliveryType === "pickup" && !couponDisc?.applyPickup) {
      setCalCouponDisscount(0);
      setFlatCouponDisscount(0);
      return;
    }

    if (deliveryType === "delivery" && !couponDisc?.applyDelivery) {
      setCalCouponDisscount(0);
      setFlatCouponDisscount(0);
      return;
    }

    if (couponDisc?.discount && couponDisc.minSpend! <= itemTotal) {
      const excludedCategoryIds = couponDisc.excludedCategoryIds || [];
      const isCouponAllowed = cartData.some(
        (item) => !excludedCategoryIds.includes(item.categoryId)
      );
      setOnlyItemsWithDisabledCouponCode(isCouponAllowed);

      if (isCouponAllowed) {
        if (couponDisc.discountType === "flat") {
          const price = +couponDisc.discount;
          setCalCouponDisscount(0);
          setFlatCouponDisscount(price);
          setcouponPercentPercentL(
            parseFloat(((price / itemTotal) * 100).toFixed(2))
          );
        } else {
          const percent = +couponDisc.discount;
          const totalDis = parseFloat(((itemTotal * percent) / 100).toFixed(2));
          setCalCouponDisscount(totalDis);
          setFlatCouponDisscount(0);
          setcouponPercentPercentL(percent);
        }
      }
    } else if (couponDisc?.discount) {
      // i remove next code it may cause , i already used in function , this can lead every time reder toast
      // toast.error(
      //   `Minmun purchase amount for discount is € ${couponDisc.minSpend} , Remove coupon or add more item to cart`
      // );
    } else {
      setCalCouponDisscount(0);
      setcouponPercentPercentL(0);
    }
  }, [couponDisc, itemTotal, cartData, deliveryType]);

  useEffect(() => {
    if (itemTotal <= 0) return;

    // 💰 Compute numeric total
    const netPay =
      itemTotal +
      deliveryFee -
      calculatedPickUpDiscountL -
      calcouponPercent -
      flatcouponPercent;

    const netDiscount = couponPercentPercentL + pickUpDiscountPercentL;

    // Update numeric states
    setEndTotalG(parseFloat(netPay.toFixed(2)));
    setTotalDiscountG(parseFloat(netDiscount.toFixed(2)));

    // Also update delivery cost in context
    setdeliveryFee(deliveryFee);
  }, [
    deliveryFee,
    calcouponPercent,
    itemTotal,
    flatcouponPercent,
    couponPercentPercentL,
    pickUpDiscountPercentL,
    calculatedPickUpDiscountL,
  ]);

  useEffect(() => {
    if (!settings?.currency || !settings?.locale) return;
    if (!endTotalG || isNaN(endTotalG)) return;

    const netPayCU = formatCurrencyNumber(
      endTotalG,
      settings.currency as string,
      settings.locale as string
    );

    setEndTotalComma(netPayCU);
  }, [endTotalG, settings?.currency, settings?.locale]);

  // if (orderType === "schedule" && !scheduledAt) {
  //   toast.error("Please select scheduled time");
  //   return;
  // }

  useEffect(() => {
    if (deliveryType === "delivery") {
      if (
        deliveryDis?.minSpend !== undefined &&
        deliveryDis.minSpend >= itemTotal
      ) {
        seOrderAmountIsLowForDelivery(true);
      } else {
        seOrderAmountIsLowForDelivery(false);
      }

      if (deliveryDis?.deliveryFee !== undefined) {
        setdeliveryFeeL(+deliveryDis.deliveryFee);
      }
    } else {
      setdeliveryFeeL(0);
    }
  }, [deliveryType, deliveryDis?.minSpend, itemTotal, deliveryDis?.deliveryFee]);

  useEffect(() => {
    if (!scheduledAt) return;

    const d = new Date(scheduledAt);
    if (isNaN(d.getTime()) || d.getTime() < Date.now()) {
      toast.error("Scheduled time must be in the future");
    }
  }, [scheduledAt]);

  async function proceedToOrder() {
    if (isLoading) return;
    if (scheduledAt) {
      const d = new Date(scheduledAt);
      if (isNaN(d.getTime()) || d.getTime() < Date.now()) {
        toast.error("Scheduled time must be in the future");
        return;
      }
    }

     if ( !isStoreOpen && !scheduledAt) {
    
     
        toast.error("Now store is close, slecet differen time when store open");
        return;
    
    } 

    setIsLoading(true);

    try {
      // =====================================================
      // 1️⃣ BASIC VALIDATIONS
      // =====================================================

      if (!paymentType) {
        toast.error(TEXT.error_select_payment_type);
        return;
      }

      if (!customerAddressIsComplete) {
        toast.error(TEXT.error_select_address);
        return;
      }

      // =====================================================
      // 2️⃣ DELIVERY VALIDATION
      // =====================================================

      if (deliveryType === "delivery") {
        if (!deliveryDis || deliveryDis.deliveryFee == null) {
          toast.error(TEXT.error_address_not_deliverable);
          return;
        }

        const price = Number(deliveryDis.deliveryFee);
        if (Number.isNaN(price)) {
          toast.error(TEXT.error_address_not_deliverable);
          return;
        }
      }

      // =====================================================
      // 3️⃣ COUPON / MINIMUM ORDER VALIDATION
      // =====================================================

      if (couponDisc?.minSpend && itemTotal < couponDisc.minSpend) {
        toast.error(
          `${TEXT.error_min_purchase_coupon} : ${couponDisc.minSpend} ${TEXT.error_min_purchase_suffix}`
        );
        return;
      }

      if (orderAmountIsLowForDelivery && deliveryType !== "pickup") {
        toast.error(
          `${TEXT.error_min_order_delivery} € ${deliveryDis?.minSpend}`
        );
        return;
      }

      // =====================================================
      // 4️⃣ READ CUSTOMER DATA
      // =====================================================

      // const addressId =
      //   JSON.parse(localStorage.getItem("customer_address_Id") || "null") || "";

      let addressId = "";
      try {
        addressId =
          JSON.parse(localStorage.getItem("customer_address_Id") ?? "null") ||
          "";
      } catch {
        addressId = "";
      }

      const userId = localStorage.getItem("order_user_Id") as string;

      const customerName =
        JSON.parse(localStorage.getItem("customer_name") || '""') || "";

      const email =
        JSON.parse(localStorage.getItem("customer_email") || '""') || "";

      // =====================================================
      // 5️⃣ FINAL SAFETY CHECKS
      // =====================================================

      if (typeof deliveryFee !== "number" || Number.isNaN(deliveryFee)) {
        toast.error(TEXT.error_unexpected_total);
        return;
      }

      if (typeof endTotalG !== "number" || Number.isNaN(endTotalG)) {
        toast.error(TEXT.error_unexpected_total);
        return;
      }

      if (!cartData || cartData.length === 0) {
        toast.error(TEXT.error_empty_cart);
        return;
      }

      // =====================================================
      // 6️⃣ BUILD ORDER (INTENT ONLY – SERVER DECIDES STATE)
      // =====================================================

      const purchaseData: orderDataType = {
        // BASIC
        userId,
        customerName,
        email,
        orderType: "ONLINE", // "DINE_IN" | "TAKEAWAY" | "DELIVERY" | "ONLINE";
        tableNo: tableNo === "DINE_IN" ? tableNo : null,
        source: "WEB" as const,
        // CART SNAPSHOT
        cartData,

        // TOTALS (client-side preview, server recalculates)
        itemTotal,

        totalDiscountG,

        // ADDRESS / DELIVERY
        addressId,
        deliveryFee,

        // PAYMENT
        paymentType,

        // DISCOUNTS
        couponFlat: flatcouponPercent,
        calcouponPercent,
        calculatedPickUpDiscountL,
        couponPercentPercentL,
        couponCode: couponDisc?.code?.trim() || "NA",
        pickUpDiscountPercentL,

        flatcouponPercent: 0,
        // FLAGS
        noOffers,

        // 🔑 VERY IMPORTANT

        scheduledAt,
      };

      // =====================================================
      // 7️⃣ CREATE ORDER (SERVER IS SOURCE OF TRUTH)
      // =====================================================

      // console.log("purchaseData-----------", purchaseData);

      const orderResult = await createNewOrder(purchaseData);

      if (!orderResult.success || !orderResult.orderId) {
        //
        toast.error("Unable to create order.");
        return;
      }

      const orderMasterId = orderResult.orderId;

      // =====================================================
      // 8️⃣ REDIRECT BASED ON PAYMENT TYPE
      // =====================================================

      if (paymentType === "stripe") {
        router.push(
          `/stripe?orderMasterId=${orderMasterId}&deliveryType=${deliveryType}`
        );
      } else if (paymentType === "paypal") {
        router.push(
          `/pay?orderMasterId=${orderMasterId}&deliveryType=${deliveryType}`
        );
      } else if (paymentType === "cod") {
        router.push(
          `/complete?paymentType=Barzahlung&orderMasterId=${orderMasterId}&deliveryType=${deliveryType}`
        );
      }
    } catch (error) {
      console.error("Order submission error:", error);
      toast.error("Something went wrong while placing the order.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full ">
      <div className="flex flex-col bg-slate-50 p-5 h-full w-full gap-7 rounded-2xl">
        <div className="flex flex-col gap-2 items-center">
          <h2 className="text-xl font-semibold border-b border-slate-200 py-3 w-full uppercase">
            {TEXT.cart_heading}
          </h2>

          <div className="font-semibold border-b border-slate-200 py-3 w-full flex flex-col justify-between gap-4">
            <div className="w-fit">
              <button
                onClick={() => setAddCoupon(!addCoupon)}
                className="flex gap-2 items-center text-sm text-slate-600 bg-green-200 rounded-2xl px-3 font-semibold py-1 w-full text-left "
              >
                <span>{TEXT.add_coupon_button}</span>
                <span>
                  <FaChevronDown />
                </span>
              </button>
            </div>

            {addCoupon && (
              <>
                <CouponDiscForm />
              </>
            )}
          </div>

          <div className="font-semibold border-b border-slate-200 py-3 w-full flex justify-between">
            <div className="text-sm font-semibold py-3 w-full text-left">
              {TEXT.subtotal_label}
            </div>
            <div className="flex gap-1">
              {itemTotalComa && <span> </span>} <span>{itemTotalComa}</span>
            </div>
          </div>

          <SetDeliveryType />

          <DeliveryFee />

          <Pickup
            pickupDiscountPersent={pickUpDiscountPercentL}
            calculatedPickUpDiscount={calculatedPickUpDiscountL}
          />

          {onlyItemsWithDisabledCouponCode &&
            flatcouponPercent + calcouponPercent !== 0 && (
              <CouponDisc total={itemTotal} />
            )}

          <div className="font-semibold border-b border-slate-200 py-3 w-full flex justify-between items-center">
            <div className="text-md font-semibold py-3 w-full text-left">
              {TEXT.total_label}
            </div>
            <div className="flex gap-1">
              {endTotalComma && <span></span>} <span>{endTotalComma}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center space-x-2 text-sm text-gray-700">
            <input
              id="noOffersCheckbox"
              type="checkbox"
              checked={noOffers}
              onChange={(e) => {
                const checked = e.target.checked;
                setNoOffers(checked);
                setShowAlert(checked);
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="noOffersCheckbox">{TEXT.no_offers_checkbox}</label>
          </div>

          {showAlert && (
            <div className="bg-yellow-100 text-yellow-800 p-3 rounded-md text-sm border border-yellow-300">
              <p>{TEXT.no_offers_alert_line1}</p>
              <p className="mt-1">{TEXT.no_offers_alert_line2}</p>
            </div>
          )}
        </div>

        <button
          onClick={proceedToOrder}
          disabled={isLoading}
          className="w-full px-4 py-2 font-bold rounded-xl text-[1.2rem] bg-amber-400 text-blue-900 hover:bg-amber-500 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
          )}
          {isLoading ? (
            TEXT.placing_order_text
          ) : (
            <>
              {TEXT.place_order_button}
              <span className="text-sky-500">{TEXT.order_button_suffix}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
