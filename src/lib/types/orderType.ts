

export type OrderProductT = {
  id: string;
  orderMasterId: string;

  name: string;
  price: number;        // base price per item
  quantity: number;

  // tax values (final, stored forever)
  taxRate: number;
  taxType: 'inclusive' | 'exclusive';
  taxAmount: number;     // tax per item
  taxTotal: number;      // tax * quantity
  finalPrice: number;    // price + tax
  finalTotal: number;    // finalPrice * quantity

  image: string;
  categoryId: string;
  productCat: string;

  purchaseSession: string;
  status: string;
  userId: string;
  productDesc?: string;
};