

import { Timestamp, FieldValue } from "firebase/firestore";


export type orderMasterDataT = {
  // =====================================================
  // CORE IDENTIFIERS
  // =====================================================
  id: string;
  userId: string;
  customerName: string;
  email: string;
  addressId: string;

  // =====================================================
  // ORDER TIMING
  // =====================================================
  createdAt: Timestamp | FieldValue;

  /** Whether order is scheduled for later */
  isScheduled?: boolean;

  /** Scheduled execution time (if scheduled order) */
  scheduledAt?: Timestamp;

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
  endTotalG: number;

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
