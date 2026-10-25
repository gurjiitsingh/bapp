"use client";
import React, { useEffect, useState } from "react";
import { useCartContext } from "@/store/CartContext";
import { FaChevronDown } from "react-icons/fa";
import CouponDiscForm from "./CouponDiscForm";
import { UseSiteContext } from "@/SiteContext/SiteContext";
import DeliveryFee from "@/components/checkout/DeliveryFee";
import Pickup from "./Pickup";
import CouponDisc from "./CouponDisc";
import { cartProductType, orderDataType } from "@/lib/types/cartDataType";
 
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useLanguage } from "@/store/LanguageContext";
import { formatCurrencyNumber } from "@/utils/formatCurrency";
import SetDeliveryType from "./SetDeliveryType";
import { createNewOrder } from "@/app/(universal)/action/orders/createNewOrder";

const ENABLE_ORDER_SCHEDULE =
  process.env.NEXT_PUBLIC_ENABLE_ORDER_SCHEDULE === "true";
type OrderSummeryProcessProps = {
  //orderType: "delivery" | "pickup" | "dine_in" | "schedule" | string |;
  isStoreOpen?: boolean;
  // scheduledAt?: string | null;
};

const RESTAURANT_TIME_ZONE =
  process.env.NEXT_PUBLIC_DEFAULT_TIMEZONE || "Europe/Madrid";

function isScheduledTimeInFuture(value: string): boolean {
  // Parse the selected restaurant-local date and time.
  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/
  );

  if (!match) return false;

  const [, year, month, day, hours, minutes, seconds = "0"] = match;

  // Convert the selected Spain wall-clock time to a real UTC timestamp.
  const parts = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
    hours: Number(hours),
    minutes: Number(minutes),
    seconds: Number(seconds),
  };

  const targetAsUTC = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hours,
    parts.minutes,
    parts.seconds
  );

  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: RESTAURANT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  // Start with the UTC guess, then correct it using Spain's timezone offset.
  const getFormattedParts = (timestamp: number) =>
    Object.fromEntries(
      formatter
        .formatToParts(new Date(timestamp))
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, Number(part.value)])
    ) as Record<string, number>;

  let candidate = targetAsUTC;

  for (let i = 0; i < 3; i++) {
    const local = getFormattedParts(candidate);

    const representedAsUTC = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      local.second
    );

    candidate += targetAsUTC - representedAsUTC;
  }

  return candidate > Date.now();
}

export default function OrderSummeryProcess({ isStoreOpen }: OrderSummeryProcessProps) {
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
  }, [
    deliveryType,
    deliveryDis?.minSpend,
    itemTotal,
    deliveryDis?.deliveryFee,
  ]);

useEffect(() => {
  if (!scheduledAt) return;

  if (!isScheduledTimeInFuture(scheduledAt)) {
    toast.error("Scheduled time must be in the future");
  }
}, [scheduledAt]);

  async function proceedToOrder() {
    if (isLoading) return;

    if (ENABLE_ORDER_SCHEDULE) {
if (scheduledAt) {
  if (!isScheduledTimeInFuture(scheduledAt)) {
    toast.error("Scheduled time must be in the future");
    return;
  }
}

   if (!scheduledAt && !isStoreOpen) {
  toast.error(
    "Store is closed. Please select a scheduled date and time."
  );
  return;
}

const orderScheduledAt = scheduledAt || null;

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
      // 4️⃣ READ SELECTED CUSTOMER ADDRESS
      // =====================================================

      function readStoredString(key: string): string {
        const raw = localStorage.getItem(key);

        if (!raw) return "";

        try {
          const parsed: unknown = JSON.parse(raw);
          return typeof parsed === "string" ? parsed : raw;
        } catch {
          return raw;
        }
      }

      const addressId = readStoredString("customer_address_Id");
      const userId = readStoredString("order_user_Id");

      const customerAddress = getLS("customer_address", undefined);

      if (!customerAddress) {
        toast.error(TEXT.error_select_address);
        return;
      }

      const customerEmail = customerAddress.email ?? "";
      const customerfirstName = customerAddress.firstName ?? "";
      const customerlastName = customerAddress.lastName ?? "";
      const customerPhone = customerAddress.mobNo ?? "";

      const customerName =
        `${customerfirstName} ${customerlastName}`.trim();

      const addressLine1 = customerAddress.addressLine1 ?? "";
      const addressLine2 = customerAddress.addressLine2 ?? "";
      const city = customerAddress.city ?? "";
      const state = customerAddress.state ?? "";
      const zipCode = customerAddress.zipCode ?? "";

      if (deliveryType === "delivery" && !addressLine1.trim()) {
        toast.error(TEXT.error_select_address);
        return;
      }

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
        // ===============================
        // BASIC
        // ===============================
        userId,
        customerName,
        customerPhone, //  ADDED
        email: customerEmail,

        orderType: "ONLINE", // "DINE_IN" | "TAKEAWAY" | "DELIVERY" | "ONLINE"
        tableNo: orderType === "DINE_IN" ? tableNo : null,
        source: "WEB" as const,

        // ===============================
        // CART SNAPSHOT
        // ===============================
        cartData,

        // ===============================
        // TOTALS (client preview)
        // ===============================
        itemTotal,
        totalDiscountG,

        // ===============================
        // ADDRESS / DELIVERY (FLAT)
        // ===============================
        addressId,

        deliveryAddressLine1: addressLine1, //  ADDED
        deliveryAddressLine2: addressLine2, //  ADDED
        deliveryCity: city, //  ADDED
        deliveryState: state, //  ADDED
        deliveryZipcode: zipCode, //  ADDED

        deliveryFee,

        // ===============================
        // PAYMENT
        // ===============================
        paymentType,

        // ===============================
        // DISCOUNTS
        // ===============================
        couponFlat: flatcouponPercent,
        calcouponPercent,
        calculatedPickUpDiscountL,
        couponPercentPercentL,
        couponCode: couponDisc?.code?.trim() || "NA",
        pickUpDiscountPercentL,

        flatcouponPercent: 0,

        // ===============================
        // FLAGS
        // ===============================
        noOffers,

        // ===============================
        // SCHEDULING
        // ===============================
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
  
 
  <div className="w-full">
    <div className="flex w-full flex-col gap-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:gap-6 sm:p-5">

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
            {TEXT.cart_heading}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Review your order before checkout
          </p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.96-1.6L22 7H5" />
          </svg>
        </div>
      </div>

      {/* Coupon */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
        <button
          type="button"
          onClick={() => setAddCoupon(!addCoupon)}
          aria-expanded={addCoupon}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.59 13.41 11 3.83V3H4v7h.83l9.58 9.59a2 2 0 0 0 2.83 0l3.35-3.35a2 2 0 0 0 0-2.83Z" />
                <circle cx="7.5" cy="6.5" r=".5" />
              </svg>
            </span>

            <span>
              <span className="block text-sm font-semibold text-slate-800">
                {TEXT.add_coupon_button}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Apply an available discount
              </span>
            </span>
          </span>

          <FaChevronDown
            className={`shrink-0 text-xs text-slate-500 transition-transform duration-200 ${
              addCoupon ? "rotate-180" : ""
            }`}
          />
        </button>

        {addCoupon && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <CouponDiscForm />
          </div>
        )}
      </div>

      {/* Price summary */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white px-4">

        {/* Subtotal */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4">
          <span className="text-sm font-medium text-slate-600">
            {TEXT.subtotal_label}
          </span>
          <span className="text-sm font-semibold tabular-nums text-slate-900">
            {itemTotalComa}
          </span>
        </div>

        {/* Delivery / pickup options */}
        <div className="space-y-4 border-b border-slate-100 py-4">
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
        </div>

        {/* Total */}
        <div className="flex items-center justify-between gap-3 py-4">
          <div>
            <p className="text-base font-bold text-slate-900">
              {TEXT.total_label}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Final order amount
            </p>
          </div>

          <span className="text-xl font-bold tracking-tight text-orange-600 tabular-nums sm:text-2xl">
            {endTotalComma}
          </span>
        </div>
      </div>

      {/* Offers preference */}
      <div className="space-y-3">
        <label
          htmlFor="noOffersCheckbox"
          className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-orange-200 sm:p-4"
        >
          <input
            id="noOffersCheckbox"
            type="checkbox"
            checked={noOffers}
            onChange={(e) => {
              const checked = e.target.checked;
              setNoOffers(checked);
              setShowAlert(checked);
            }}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 accent-orange-500 focus:ring-2 focus:ring-orange-400"
          />

          <span className="text-sm leading-5 text-slate-700">
            {TEXT.no_offers_checkbox}
          </span>
        </label>

        {showAlert && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-800">
            <p>{TEXT.no_offers_alert_line1}</p>
            <p className="mt-1">{TEXT.no_offers_alert_line2}</p>
          </div>
        )}
      </div>

      {/* Place order */}
      <button
        type="button"
        onClick={proceedToOrder}
        disabled={isLoading}
        className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-base font-bold text-white shadow-sm shadow-orange-200/70 transition-all duration-200 hover:bg-orange-600 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-14 sm:text-lg"
      >
        {isLoading && (
          <svg
            className="h-5 w-5 animate-spin text-white"
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
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 0 1 8-8v8H4z"
            />
          </svg>
        )}

        <span>
          {isLoading ? (
            TEXT.placing_order_text
          ) : (
            <>
              {TEXT.place_order_button}{" "}
              <span className="text-orange-100">
                {TEXT.order_button_suffix}
              </span>
            </>
          )}
        </span>

        {!isLoading && (
          <svg
            className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        )}
      </button>

      <p className="text-center text-xs leading-5 text-slate-500">
        Please review your delivery details and payment method before placing your order.
      </p>
    </div>
  </div>
 

  );
}
function getLS(key: string, fallback = "") {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}
