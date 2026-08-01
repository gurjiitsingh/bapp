'use server';

import { adminDb } from '@/lib/firebaseAdmin';

export async function getInventoryStockByInventoryItem(
id: string
) {
try {
if (!id) {
return {
success: false,
data: null,
message: 'inventoryItemId is required',
};
}

console.log("inside inventory data--------------------------",id)

const snap = await adminDb
  .collection('inventoryItems')
  .doc(id)
  .get();

if (!snap.exists) {
  return {
    success: false,
    data: null,
    message: 'Inventory item not found',
  };
}

const item = snap.data()!;
console.log("item----------------",item)

return {
  success: true,
  data: {
    id: snap.id,
    name: item.name || '',

    currentStock: Number(item.currentStock || 0),
    averageCost: Number(item.averageCost || 0),
    stockValue: Number(item.stockValue || 0),

    purchaseUnit: item.purchaseUnit || '',
    consumptionUnit: item.consumptionUnit || '',
    conversionFactor: Number(item.conversionFactor || 1),

    purchaseUnitCost: Number(item.purchaseUnitCost || 0),

    updatedAt: item.updatedAt
      ? item.updatedAt.toDate().toISOString()
      : null,
  },
  message: 'Inventory item fetched',
};


} catch (error: any) {
return {
success: false,
data: null,
message:
error.message ||
'Failed to fetch inventory item',
};
}
}
