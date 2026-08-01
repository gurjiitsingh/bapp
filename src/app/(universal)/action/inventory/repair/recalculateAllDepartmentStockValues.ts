'use server';

import { adminDb } from '@/lib/firebaseAdmin';

export async function recalculateAllDepartmentStockValues() {
try {
const snapshot = await adminDb
.collection('departmentStock')
.get();


if (snapshot.empty) {
  return {
    success: true,
    updated: 0,
    message: 'No department stock records found.',
  };
}

let updated = 0;
const batch = adminDb.batch();

snapshot.docs.forEach((doc) => {
  const dpstock = doc.data();

  const currentStock = Number(dpstock.currentStock || 0);
  const averageCost = Number(dpstock.averageCost || 0);
  const conversionFactor = Number(
    dpstock.conversionFactor || 1
  );

  // Convert consumption qty -> purchase qty
  const qtyInPurchaseUnit =
    currentStock / conversionFactor;

  const stockValue =
    qtyInPurchaseUnit * averageCost;

  batch.update(doc.ref, {
    stockValue,
    updatedAt: new Date(),
  });

  updated++;
});

await batch.commit();

return {
  success: true,
  updated,
  message: `Updated ${updated} department stock values.`,
};


} catch (error: any) {
return {
success: false,
updated: 0,
message:
error.message ||
'Failed to recalculate department stock values.',
};
}
}
