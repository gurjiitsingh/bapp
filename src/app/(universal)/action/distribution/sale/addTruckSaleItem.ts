'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import admin from 'firebase-admin';

type Props = {
  saleId: string;

  productId: string;
  productName: string;

  quantity: number;
  unitPrice: number;
  lineValue: number;
};

export async function addTruckSaleItem(
  tx: admin.firestore.Transaction,
  data: Props
) {
  const ref = adminDb
    .collection('truckSales')
    .doc(data.saleId)
    .collection('items')
    .doc();

  tx.set(ref, {
    ...data,
    createdAt: new Date(),
  });
}