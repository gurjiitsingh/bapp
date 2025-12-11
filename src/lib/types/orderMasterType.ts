import { Timestamp } from "@firebase/firestore";

export type orderMasterDataT = {
  id: string;
  customerName: string;
  email:string;
  userId: string;
  addressId: string;
  endTotalG: number;
  itemTotal: number;
  paymentType: string;
  totalDiscountG: number;
  flatDiscount: number;
  status: string;
  srno: number;
  timeId: string;
  deliveryCost: number;
  calculatedPickUpDiscountL: number;
  createdAt:Timestamp | string;
  createdAtUTC?: string;
  time: string;
  calCouponDiscount: number;
  couponDiscountPercentL: number;
  couponCode: string | undefined;
  pickUpDiscountPercentL: number;
  totalTax: number | undefined;
  finalGrandTotal: number | undefined;
  
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
