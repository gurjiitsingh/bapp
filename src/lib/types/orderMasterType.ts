import { Timestamp, FieldValue } from "firebase/firestore";
import admin from "firebase-admin";

export type orderMasterDataT = {
  // =====================================================
  // CORE IDENTIFIERS
  // =====================================================
  id: string;
  userId: string;
  customerName: string;
  email: string;
  addressId: string;
  srno: number;
  tableNo: string | null; // Only for DINE_IN
  orderType: "DINE_IN" | "TAKEAWAY" | "DELIVERY" | "ONLINE";
  // =====================================================
  // ORDER TIMING
  // =====================================================
  createdAt: Timestamp | FieldValue;

  /** Whether order is scheduled for later */
  isScheduled?: boolean;

  /** Scheduled execution time (if scheduled order) */
  scheduledAt: admin.firestore.Timestamp | admin.firestore.FieldValue | null;

  couponCode?: string;
  couponDiscountPercentL: number;
  pickUpDiscountPercentL: number;

  /** Delivery fee (clean naming) */
  deliveryFee?: number;

  // finalGrandTotal?:number;
  // =====================================================
  // ORDER AMOUNTS
  // =====================================================
  itemTotal: number;
  deliveryCost: number;

  totalDiscountG: number;
  flatDiscount: number;
  calculatedPickUpDiscountL: number;
  calCouponDiscount: number;

  totalTax?: number;
  //endTotalG: number;

  // Clean calculated fields
  discountTotal?: number;
  taxBeforeDiscount?: number;
  taxAfterDiscount?: number;
  subTotal?: number;
  grandTotal?: number;

  // =====================================================
  // ORDER STATE
  // =====================================================
  orderStatus?:
    | "NEW"
    | "SCHEDULED"
    | "ACCEPTED"
    | "PREPARING"
    | "READY"
    | "COMPLETED"
    | "CANCELLED";

  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  status: string;
  paymentType: string;
  // =====================================================
  // SOURCE & META
  // =====================================================
  source?: "WEB" | "POS" | "APP";
  productsCount?: number;
  notes?: string;

  // =====================================================
  // AUTOMATION FLAGS
  // =====================================================
  printed?: boolean;
  acknowledged?: boolean;
};

export type TOrderMaster = {
  id: string;
  addressId: string;
  customerName: string;
  time: string;
  userId: string;
  status: string;
  srno: number;
};
