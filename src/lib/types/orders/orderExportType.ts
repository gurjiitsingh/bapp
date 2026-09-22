export type OrderExportMasterT = {
  ownerId: string;
  outletId: string;

  id: string;
  srno: string;

  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerCountryCode?: string;
  email?: string;
  addressId?: string;

  dAddressLine1?: string;
  dAddressLine2?: string;
  dCity?: string;
  dState?: string;
  dZipcode?: string;
  dLandmark?: string;

  orderType:
    | "DINE_IN"
    | "TAKEAWAY"
    | "DELIVERY"
    | "ONLINE";

  tableNo: string | null;

  createdAt: string;
  updatedAt?: string;
  closedAt?: string | null;

  isScheduled?: boolean;
  scheduledAt?: string | null;

  itemTotal: number;
  discountTotal?: number;
  subTotal?: number;
  taxBeforeDiscount?: number;
  taxTotal?: number;
  deliveryFee?: number;
  grandTotal?: number;

  paymentMode:
    | "CASH"
    | "CARD"
    | "UPI"
    | "ONLINE"
    | "CREDIT"
    | "MIXED";

  paymentProvider?: string;
  paymentMethod?: string;

  paymentStatus?:
    | "NEW"
    | "PAID"
    | "PARTIAL"
    | "CREDIT"
    | "FAILED"
    | "REFUNDED";

  paidAmount?: number;
  dueAmount?: number;

  orderStatus?:
    | "NEW"
    | "SCHEDULED"
    | "ACCEPTED"
    | "PREPARING"
    | "READY"
    | "COMPLETED"
    | "CANCELLED";

  source?: "WEB" | "POS" | "APP";
  // source?: "ALL" | "POS" | "WEB" | "APP";

  staffId?: string | null;

  productsCount?: number;

  notes?: string;

  syncStatus?: "NEW" | "SYNCED" | "FAILED";

  lastSyncedAt?: string;

  printed?: boolean;
  acknowledged?: boolean;

  couponCode?: string;
  couponFlat?: number;
  pickUpDiscount?: number;
  couponPercent?: number;
};