"use server";

import { adminDb } from "@/lib/firebaseAdmin";
 
import { orderMasterDataT } from "@/lib/types/orderMasterType";
import { orderDataType } from "@/lib/types/cartDataType";
 
import admin from "firebase-admin";
const TAX_IMPLEMENT = process.env.TAX_IMPLEMENT === "true";


type FetchOrdersOptions = {
  afterId?: string;
  pageSize?: number;
};


const SHOULD_MAINTAIN_STOCK =
  process.env.NEXT_PUBLIC_MAINTAIN_STOCK === "true" ||
  process.env.NEXT_PUBLIC_MAINTAIN_STOCK === "1";

import { calculateTaxForCart } from "@/lib/tax/calculateTaxForCart-withRounding";
import { calculateOrderTotals } from "@/lib/orderAmount/calculateOrderTotals";
import { toTimestamp } from "@/utils/toTimestamp";
import { toAdminTimestamp } from "@/utils/toAdminTimestamp";
import { processSaleInventory } from "../inventory/processSaleInventory";
import { checkStockAvailabilityV2 } from "../inventory/checkStockAvailabilityV2";
import { addOrderToMaster } from "./addOrderToMaster";
import { addProductDraft } from "./addProductDraft";
import { marketingData } from "./marketingData";
import {   getFinancialYearCode, getNextWebOrderSerial } from "./getNextWebOrderSerial";

export async function createNewOrder(purchaseData: orderDataType) {

 // console.log("addreas full oredr masrer---------------",purchaseData)
  const {
    // -----------------------------
    // BASIC
    // -----------------------------
    userId,
    customerName,
    customerPhone,        //  NEW
    email,

    orderType,
    tableNo,
    addressId,

    // -----------------------------
    // DELIVERY ADDRESS (FLAT)
    // -----------------------------
    deliveryAddressLine1, //  NEW
    deliveryAddressLine2, //  NEW
    deliveryCity,         //  NEW
    deliveryState,        //  NEW
    deliveryZipcode,      //  NEW

    // -----------------------------
    // PAYMENT
    // -----------------------------
    paymentType,

    // -----------------------------
    // PRICING INPUTS
    // -----------------------------
    itemTotal,            // before tax & discount
    deliveryFee,

    // -----------------------------
    // DISCOUNTS (LEGACY + CLEAN)
    // -----------------------------
    couponFlat,
    calcouponPercent,
    calculatedPickUpDiscountL,
    couponCode,
    couponPercentPercentL,
    pickUpDiscountPercentL,
    totalDiscountG,

    // -----------------------------
    // FLAGS / META
    // -----------------------------
    noOffers,
    cartData,             // cartProductType[]
    source,

    // -----------------------------
    // SCHEDULING
    // -----------------------------
    scheduledAt,
    isScheduled,          //  NEW
  } = purchaseData;

  // 🔒 Normalize userId (defensive programming)
  // const safeUserId =
  //   typeof userId === "string"
  //     ? userId.replace(/^"+|"+$/g, "")
  //     : userId;

  // =====================================================
  // 1️⃣ STOCK CHECK (BEFORE ANY CALCULATION)
  // =====================================================
  if (SHOULD_MAINTAIN_STOCK) {
    const stockCheck = await checkStockAvailabilityV2(cartData);
    if (!stockCheck.success) {
      return { success: false, message: stockCheck.message };
    }
  }

  // =====================================================
  // 2️⃣ TAX CALCULATION (SERVER = SOURCE OF TRUTH)
  // =====================================================
  // cartData is already cartProductType[]
  const { products: cartWithTax, totalTax } = await calculateTaxForCart(
    cartData
  );

  // =====================================================
  // 3️⃣ TOTALS CALCULATION (SERVER = SOURCE OF TRUTH)
  // =====================================================
  const totals = calculateOrderTotals({
    itemTotal,
    couponFlat,
    couponPercent: calcouponPercent,
    pickupDiscount: calculatedPickUpDiscountL,
    taxBeforeDiscount: totalTax,
    deliveryFee: deliveryFee,
  });

// =====================================================
// 4️⃣ TIMESTAMPS
// =====================================================

const nowUTC = new Date().toISOString();

const nowGerman = new Date().toLocaleString("en-DE", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: "Europe/Berlin",
});

const timeNow = new Date().toLocaleString("en-IN", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: "Asia/Kolkata",
});


// =====================================================
// 5️⃣ VALIDATE SCHEDULED TIME
// =====================================================

const scheduledTimestamp = toAdminTimestamp(scheduledAt);

if (
  scheduledTimestamp &&
  scheduledTimestamp.toMillis() < Date.now()
) {
  return {
    success: false,
    message: "Scheduled time is in the past",
  };
}

const MIN_BUFFER_MS = 30 * 60 * 1000; // 30 minutes

if (
  scheduledTimestamp &&
  scheduledTimestamp.toMillis() < Date.now() + MIN_BUFFER_MS
) {
  return {
    success: false,
    message: "Please select a time at least 30 minutes from now",
  };
}


// =====================================================
// 6️⃣ GENERATE WEB SERIAL NUMBER
// =====================================================

const financialYear = await getFinancialYearCode();

const orderSerialNo = await getNextWebOrderSerial(
  financialYear
);

const new_srno = `WEB-${financialYear}-${orderSerialNo}`;


// =====================================================
// 7️⃣ ORDER / PAYMENT STATUS
// =====================================================

const paymentStatus =
  paymentType === "COD"
    ? "PAID"
    : "NEW";


// =====================================================
// 8️⃣ ORDER MASTER DATA
// =====================================================

 


const orderMasterData: orderMasterDataT = {
  // =====================================================
  // BASIC
  // =====================================================
  id: "temp_id",
 srno: new_srno,

  customerId: userId,
  customerName,
  email,

  customerPhone: customerPhone || "",
  customerCountryCode: "+91", //  default

  addressId,

  // ---------- Delivery Address Snapshot (FLAT) ----------
  dAddressLine1: deliveryAddressLine1 || "",
  dAddressLine2: deliveryAddressLine2 || "",
  dCity: deliveryCity || "Jalandhar",
  dState: deliveryState || "Punjab",
  dZipcode: deliveryZipcode || "",
  dLandmark: "", //  optional default

  tableNo,
  orderType,
  paymentMode:"CASH",

  ownerId: "temp_OW_ID",     // 🔑 Restaurant owner
  outletId: "temp_Oulet_ID", // 🔑 Outlet / Branch

  // =====================================================
  // LEGACY TOTALS (DO NOT TOUCH)
  // =====================================================
  itemTotal,
  deliveryFee: deliveryFee,
  //totalDiscountG,
  
  pickUpDiscount:calculatedPickUpDiscountL,
  couponPercent:calcouponPercent?calcouponPercent:couponFlat,
  couponCode,
  //couponPercentPercentL,
  //pickUpDiscountPercentL,

  // =====================================================
  // TAX
  // =====================================================
  taxBeforeDiscount: totals.taxBeforeDiscount,
  taxTotal: totals.taxTotal,

  // =====================================================
  // TOTALS (FINAL)
  // =====================================================
  productsCount: cartData.length,
  discountTotal: totals.discountTotal,
  subTotal: totals.subTotal,
  grandTotal: totals.grandTotal,

  // =====================================================
  // PAYMENT (DEFAULTS ADDED)
  // =====================================================
  paymentStatus: "PAID",
  paymentProvider: "CASH", //  safe default (STRIPE / PAYPAL later)
  paymentMethod: "CASH",   //  VISA / GPAY later

  // =====================================================
  // ORDER STATE
  // =====================================================
  orderStatus: scheduledTimestamp ? "SCHEDULED" : "NEW",

  // =====================================================
  // SOURCE & META
  // =====================================================
  source,
  staffId: null, //  POS only
  notes: "",     //  optional

  // =====================================================
  // SYNC / OFFLINE (POS SAFE)
  // =====================================================
  syncStatus: "SYNCED", //  default
  lastSyncedAt: admin.firestore.FieldValue.serverTimestamp(),

  // =====================================================
  // AUTOMATION
  // =====================================================
  printed: false,
  acknowledged: false,

  // =====================================================
  // TIMESTAMPS
  // =====================================================
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),

  // =====================================================
  // SCHEDULING
  // =====================================================
  scheduledAt: scheduledTimestamp,
  isScheduled: Boolean(scheduledTimestamp),

  // =====================================================
  // ARCHIVAL (SAFE DEFAULTS)
  // =====================================================
  // isArchived: false,
  // archivedAt: null,
};


  //console.log("data to be saved server --------------", orderMasterData);

  // =====================================================
  // 8️⃣ SAVE ORDER MASTER
  // =====================================================
  const orderMasterId = await addOrderToMaster(orderMasterData);

  // =====================================================
  // 9️⃣ SAVE ORDER PRODUCTS (WITH TAX SNAPSHOT)
  // =====================================================
  for (const product of cartWithTax) {
    await addProductDraft(product, userId!, orderMasterId!);
  }

  // ===================================================
// 9.5️⃣ PROCESS INVENTORY
// =====================================================
await processSaleInventory(
  "kjliiuwe",//orderMasterId,
  cartWithTax.map((item) => ({
    productId: item.id,
    quantity: item.quantity || 1,
    name: item.name,

    // NEW
    productMode: item.productMode,
  }))
);

  // =====================================================
  // 🔟 MARKETING DATA
  // =====================================================
  await marketingData({
    name: customerName,
    userId,
    addressId,
    email,
    noOfferEmails: noOffers,
  });

  // =====================================================
  // 1️⃣1️⃣ EMAIL UNSUBSCRIBE (OPTIONAL)
  // =====================================================
  if (noOffers) {
    const normalizedEmail = email.toLowerCase();
    const ref = adminDb.collection("campaignEmailListFinal");
    const existing = await ref.where("email", "==", normalizedEmail).get();

    if (!existing.empty) {
      await existing.docs[0].ref.update({
        unsubscribed: true,
        source: "app",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await ref.add({
        email: normalizedEmail,
        unsubscribed: true,
        source: "app",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  // =====================================================
  //  DONE
  // =====================================================
  return {
    success: true,
    message: "Order created",
    orderId: orderMasterId,
  };
}