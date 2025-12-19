import { ProductType } from "./productType";





export type cartProductType = {
  id: string ;
  price: number;
  quantity: number;
  stockQty: number | null;
  categoryId: string;
  productCat: string;
  name: string;
  image: string;
  taxRate: number | undefined;
  taxType: "inclusive" | "exclusive" | undefined;

// variantId?: string;
// variantName?: string;
// notes?: string;
};

export type newOrderConditionType = {
  success: boolean;
  message: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  stockQty: number | null;

  // category + tax info copied from product
  categoryId: string;
  productCat: string;
  taxRate?: number;
  taxType?: 'inclusive' | 'exclusive';
  image: string;
};

export type CartItemWithTax = CartItem & {
  itemSubtotal:number;
  taxAmount: number;   // per one item
  taxTotal: number;    // tax * quantity
  finalPrice: number;  // price + tax
  finalTotal: number;  // finalPrice * quantity
};

export type cartDataT = {
  productDesc: string;
  productCat: string;
  id: string;
  image: string;
  isFeatured: boolean;
  name: string;
  price: string;
  purchaseSession: string | null;
  quantity: number;
  status: string;
};




// export type ProductType ={
//   name: string;
//    price: string;
//     productCat: string;
//      productDesc: string;
//       image:string;
//        isFeatured?: boolean | undefined;
//       }

export type purchaseDataT = {
  userId: string | undefined;
  cartData: ProductType[];
  total: number;
  totalDiscountG: number;
  address: {
    firstName: string;
    lastName: string;
    //   password:string;
    userId: string | undefined;
    email: string;
    mobNo: string;
    addressLine1: string | undefined;
    addressLine2: string | undefined;
    city: string;
    state: string;
    zipCode: string;
  };
};

export type orderDataType = {
  // -----------------------------
  // BASIC INFO
  // -----------------------------
  userId: string ;
  customerName: string;
  email: string;

  // -----------------------------
  // CART SNAPSHOT (REQUIRED)
  // -----------------------------
  cartData: cartProductType[];

  // -----------------------------
  // REQUIRED LEGACY TOTALS
  // -----------------------------
  endTotalG?: number;          // legacy grand total
  totalDiscountG: number;
  flatDiscount: number;

  // -----------------------------
  // ORDER INFO
  // -----------------------------
  addressId: string;
  paymentType: string;

  itemTotal: number;
  deliveryCost: number;

  // -----------------------------
  // ✅ NEW CLEAN TOTALS (OPTIONAL)
  // -----------------------------
  discountTotal?: number;     // sum of all discounts
  taxTotal?: number;          // tax after discount
  subTotal?: number;          // itemTotal - discountTotal
  grandTotal?: number;        // final payable amount

  // -----------------------------
  // DISCOUNTS (LEGACY + CLEAN)
  // -----------------------------
  calCouponDiscount: number;
  flatCouponDiscount: number;
  couponDiscountPercentL: number;
  couponCode: string | undefined;

  pickUpDiscountPercentL: number;
  calculatedPickUpDiscountL: number;

  // -----------------------------
  // FLAGS
  // -----------------------------
  noOffers: boolean;

  // -----------------------------
  // ✅ SYSTEM / SOURCE (OPTIONAL)
  // -----------------------------
  source?: "POS" | "WEB";
  orderStatus?: "NEW" | "ACCEPTED" | "COMPLETED" | "CANCELLED";
  paymentStatus?: "PAID" | "UNPAID" | "FAILED";
  printed?: boolean;

  //remove in future
  finalGrandTotal?:number;
};



// export type OrderProductType = {
//   id: string;
//   orderMasterId: string;

//   name: string;
//   price: number;
//   quantity: number;

//   taxRate: number;
//   taxType: "inclusive" | "exclusive";
//   taxAmount: number;
//   taxTotal: number;

//   finalPrice: number;
//   finalTotal: number;

//   categoryId: string;
//   productCat: string;
//   image: string;

//   status: string;
// };
