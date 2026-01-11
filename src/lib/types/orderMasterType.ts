import { Timestamp, FieldValue } from "firebase/firestore";
import admin from "firebase-admin";

export type orderMasterDataT = {
  // =====================================================
  //  CORE OWNERSHIP & LOCATION (CRITICAL)
  // =====================================================

  ownerId: string; // 🔑 Restaurant owner (Auth UID)
  outletId: string; // 🔑 Restaurant location / branch

  // =====================================================
  //  CORE ORDER IDENTIFIERS
  // =====================================================

  id: string;
 srno: number; // Per-outlet running number

  // =====================================================
  //  CUSTOMER (REFERENCE + SNAPSHOT)
  // =====================================================

  customerId?: string; //  REAL customer (NULL for walk-in POS)
  customerName?: string;
  customerPhone?: string;
  customerCountryCode?: string;
  email?: string;

  addressId?: string; // Reference (optional)

  // 🔒 Snapshot for delivery / history:-- removed
  // ---------- Delivery Address (FLAT) ----------
  dAddressLine1?: string;
  dAddressLine2?: string;
  dCity?: string;
  dState?: string;
  dZipcode?: string;
  dLandmark?: string;

  // =====================================================
  //  ORDER TYPE
  // =====================================================

  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY" | "ONLINE";
  tableNo: string | null; // Only for DINE_IN

  // =====================================================
  //  TIMESTAMPS
  // =====================================================

  createdAt: Timestamp | FieldValue;
  updatedAt?: Timestamp | FieldValue;

  isScheduled?: boolean;
  scheduledAt?: admin.firestore.Timestamp | admin.firestore.FieldValue | null;

  // =====================================================
  //  AMOUNTS (FINAL & AUDIT-SAFE)
  // =====================================================

  itemTotal: number; // Before discount & tax
  discountTotal?: number; // FINAL discount
  subTotal?: number; // After discount, before tax
  taxBeforeDiscount?: number;
  taxTotal?: number;
  deliveryFee?: number;
  grandTotal?: number; // FINAL payable

  // =====================================================
  //  PAYMENT
  // =====================================================

  paymentType: string; // CASH | CARD | UPI | ONLINE
  paymentProvider?: string; // STRIPE | PAYPAL | RAZORPAY
  paymentMethod?: string; // VISA | GPAY | PHONEPE
  paymentStatus?: "PAID" | "NEW" | "FAILED" | "REFUNDED";

  // =====================================================
  //  ORDER STATE
  // =====================================================

  orderStatus?:
    | "NEW"
    | "SCHEDULED"
    | "ACCEPTED"
    | "PREPARING"
    | "READY"
    | "COMPLETED"
    | "CANCELLED";

  // =====================================================
  //  SOURCE & META
  // =====================================================

  source?: "WEB" | "POS" | "APP";
  staffId?: string | null; // POS cashier / waiter
  productsCount?: number;
  notes?: string;

  // =====================================================
  //  SYNC / OFFLINE (POS SAFE)
  // =====================================================

  syncStatus?: "NEW" | "SYNCED" | "FAILED";
  lastSyncedAt?: Timestamp | FieldValue;

  // =====================================================
  //  AUTOMATION
  // =====================================================

  printed?: boolean;
  acknowledged?: boolean;

  // ---------- Archival / Retention ----------
  // isArchived?: boolean;      //  default false / undefined
  // archivedAt?: Timestamp;    //  set only when archived

  // =====================================================
  // ⚠️ LEGACY FIELDS (KEEP, DO NOT USE FOR NEW LOGIC)
  // =====================================================

  couponCode?: string;
  //couponPercentPercentL?: number;
  //pickUpDiscountPercentL?: number;

  //totalDiscountG?: number;
  couponFlat?: number;
  pickUpDiscount?: number;
  couponPercent?: number;
};

// export type orderMasterDataT = {
//   // =====================================================
//   //  STANDARD SYSTEM FIELDS (NEW & OFFICIAL)
//   // 👉 USE THESE EVERYWHERE GOING FORWARD
//   // =====================================================

//   // ---------- Core Identifiers ----------
//   id: string;
//   userId: string;
//  srno: number;

//   // ---------- Customer ----------
//   customerName: string;
//   customerPhone: string; //  NEW (IMPORTANT)
//   customerCountryCode?: string; // Optional
//   email: string;
//   addressId: string;

//   // ---------- Order Type ----------
//   orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY" | "ONLINE";
//   tableNo: string | null; // Only for DINE_IN

//   // ---------- Timing ----------
//   createdAt: Timestamp | FieldValue;
//   updatedAt?: Timestamp | FieldValue;

//   isScheduled?: boolean;
//   scheduledAt?: admin.firestore.Timestamp | admin.firestore.FieldValue | null;

//   // ---------- Amounts (FINAL & CLEAN) ----------
//   itemTotal: number; // Before discount & tax
//   discountTotal?: number; // FINAL discount amount
//   subTotal?: number; // After discount, before tax
//   taxBeforeDiscount?: number;
//   taxTotal?: number;
//   grandTotal?: number; // FINAL payable amount

//   // ---------- Delivery ----------
//   deliveryFee?: number;

//   // ---------- Payment ----------
//   paymentType: string;
//   paymentStatus?: "NEW" | "PAID" | "FAILED" | "REFUNDED";

//   // ---------- Order State ----------
//   orderStatus?:
//     | "NEW"
//     | "SCHEDULED"
//     | "ACCEPTED"
//     | "PREPARING"
//     | "READY"
//     | "COMPLETED"
//     | "CANCELLED";

//   // ---------- Source & Meta ----------
//   source?: "WEB" | "POS" | "APP";
//   productsCount?: number;
//   notes?: string;

//   // ---------- Sync / Offline ----------
//   syncStatus?: "NEW" | "SYNCED" | "FAILED";
//   lastSyncedAt?: Timestamp | FieldValue;

//   // ---------- Automation ----------
//   printed?: boolean;
//   acknowledged?: boolean;

//   // =====================================================
//   // ⚠️ LEGACY SYSTEM FIELDS (OLD / NON-STANDARD)
//   // 🚫 DO NOT USE FOR NEW LOGIC
//   // 👉 KEPT ONLY FOR BACKWARD COMPATIBILITY
//   // =====================================================

//   /** Old generic status field (DO NOT USE) */
//   //status: string;

//   /** Old delivery naming */
//   //deliveryFee: number;

//   /** Coupon system (percentage-based – legacy) */
//   couponCode?: string;
//   couponPercentPercentL: number;
//   pickUpDiscountPercentL: number;

//   /** Old discount breakdowns */
//   totalDiscountG: number;
//   couponFlat: number;
//   calculatedPickUpDiscountL: number;
//   calcouponPercent: number;

//   /** Old tax storage */
//   //totalTax?: number;
// };

// export type orderMasterDataT = {
//   // =====================================================
//   // CORE IDENTIFIERS
//   // =====================================================
//   id: string;
//   userId: string;
//   customerName: string;
//   email: string;
//   addressId: string;
//  srno: number;
//   tableNo: string | null; // Only for DINE_IN
//   orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY" | "ONLINE";
//   // =====================================================
//   // ORDER TIMING
//   // =====================================================
//   createdAt: Timestamp | FieldValue;

//   /** Whether order is scheduled for later */
//   isScheduled?: boolean;

//   /** Scheduled execution time (if scheduled order) */
//   scheduledAt: admin.firestore.Timestamp | admin.firestore.FieldValue | null;

//   couponCode?: string;
//   couponPercentPercentL: number;
//   pickUpDiscountPercentL: number;

//   /** Delivery fee (clean naming) */
//   deliveryFee?: number;

//   // finalGrandTotal?:number;
//   // =====================================================
//   // ORDER AMOUNTS
//   // =====================================================
//   itemTotal: number;
//   deliveryFee: number;

//   totalDiscountG: number;
//   couponFlat: number;
//   calculatedPickUpDiscountL: number;
//   calcouponPercent: number;

//   totalTax?: number;
//   //endTotalG: number;

//   // Clean calculated fields
//   discountTotal?: number;
//   taxBeforeDiscount?: number;
//   taxTotal?: number;
//   subTotal?: number;
//   grandTotal?: number;

//   // =====================================================
//   // ORDER STATE
//   // =====================================================
//   orderStatus?:
//     | "NEW"
//     | "SCHEDULED"
//     | "ACCEPTED"
//     | "PREPARING"
//     | "READY"
//     | "COMPLETED"
//     | "CANCELLED";

//   paymentStatus?: "NEW" | "PAID" | "FAILED" | "REFUNDED";
//   status: string;
//   paymentType: string;
//   // =====================================================
//   // SOURCE & META
//   // =====================================================
//   source?: "WEB" | "POS" | "APP";
//   productsCount?: number;
//   notes?: string;

//   // =====================================================
//   // AUTOMATION FLAGS
//   // =====================================================
//   printed?: boolean;
//   acknowledged?: boolean;
// };

export type TOrderMaster = {
  id: string;
  addressId: string;
  customerName: string;
  time: string;
  userId: string;
  status: string;
 srno: number;
};
