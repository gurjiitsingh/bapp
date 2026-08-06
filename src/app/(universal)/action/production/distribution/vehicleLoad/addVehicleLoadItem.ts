'use server';

import { adminDb } from '@/lib/firebaseAdmin';

type AddVehicleLoadItemInput = {
  loadId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  lineValue: number;
  sellingPrice?: number;
  wholesalePrice?: number;
};

export async function addVehicleLoadItem(
  tx: FirebaseFirestore.Transaction,
  input: AddVehicleLoadItemInput
) {
  const itemRef = adminDb
    .collection('vehicleLoads')
    .doc(input.loadId)
    .collection('items')
    .doc();

  tx.set(itemRef, {
    productId: input.productId,
    productName: input.productName,
    quantity: input.quantity,
    unitCost: input.unitCost,
    lineValue: input.lineValue,
    sellingPrice: Number(input.sellingPrice || 0),
    wholesalePrice: Number(input.wholesalePrice || 0),
  });
}