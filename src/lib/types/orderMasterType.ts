

import { Timestamp, FieldValue } from "firebase/firestore";
export type orderMasterDataT = {
  // =====================================================
  // EXISTING FIELDS (DO NOT REMOVE / RENAME)
  // =====================================================
  id: string; 

  customerName: string;
  email: string;
  userId: string;
  addressId: string;

  srno: number;
  timeId: string;
  time: string;

  paymentType: string;

  itemTotal: number;                  // total of items (before discount & tax)
  deliveryCost: number;

  totalDiscountG: number;             // legacy
  flatDiscount: number;
  calculatedPickUpDiscountL: number;
  calCouponDiscount: number;

  couponCode?: string;
  couponDiscountPercentL: number;
  pickUpDiscountPercentL: number;

  totalTax?: number;                  // legacy / raw tax
  endTotalG: number;                  // legacy
  finalGrandTotal?: number;           // legacy

  status: string;                     // legacy status
  createdAt: Timestamp | string | FieldValue;
  createdAtUTC?: string;

  // =====================================================
  // ✅ NEW – CLEAN & CORRECT TOTAL FIELDS (OPTIONAL)
  // =====================================================

  /** Total discount applied on order (sum of all discounts) */
  discountTotal?: number;

  /** Tax BEFORE discount (sum of per-product tax) */
  taxBeforeDiscount?: number;

  /** Tax AFTER discount (adjusted tax – this is the correct tax) */
  taxAfterDiscount?: number;

  /** Subtotal after discount, before tax */
  subTotal?: number;

  /** Delivery fee (clean naming) */
  deliveryFee?: number;

  /** Final payable amount (clean, correct) */
  grandTotal?: number;

  // =====================================================
  // ORDER SOURCE & STATUS (FOR AUTOMATION)
  // =====================================================

  /** Where the order came from */
  source?: "WEB" | "POS" | "APP";

  /** Clean order lifecycle status */
  orderStatus?:
    | "NEW"
    | "ACCEPTED"
    | "PREPARING"
    | "READY"
    | "COMPLETED"
    | "CANCELLED";

  /** Payment lifecycle */
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "REFUNDED";

  // =====================================================
  // AUTOMATION FLAGS (POS LOGIC)
  // =====================================================

  /** Whether order has been auto-printed */
  printed?: boolean;

  /** Whether staff acknowledged the order (sound stopped) */
  acknowledged?: boolean;

  // =====================================================
  // OPTIONAL / FUTURE
  // =====================================================

  notes?: string;                     // kitchen or customer notes


  // =====================================================
  // ✅ CUSTOM – NEW FIELDS FOR TABLE & SCHEDULE
  // =====================================================

  /** Table number (for dine-in orders) */
  tableNo?: string | number;

  /** Whether the order is scheduled for later */
  orderScheduled?: boolean;

  productsCount?: number;
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
