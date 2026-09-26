'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import { StockMovementType } from '@/lib/types/distribution/StockMovementType';

type GetStockMovementsProps = {
  from?: Date;
  to?: Date;

  locationCode?: string;
  customerId?: string;

  movementType?: string;

  limit?: number;
};

export async function getSaleMovements({
  from,
  to,
  locationCode,
  customerId,
  movementType = 'SALE',
  limit = 500,
}: GetStockMovementsProps = {}) {
  try {
    let query: FirebaseFirestore.Query =
      adminDb.collection('stockMovements');

    // Always filter by movement type first
    if (movementType) {
      query = query.where(
        'movementType',
        '==',
        movementType
      );
    }

    // Vehicle / route / location filter
    if (locationCode) {
      query = query.where(
        'locationCode',
        '==',
        locationCode
      );
    }

    // Customer filter
    if (customerId) {
      query = query.where(
        'customerId',
        '==',
        customerId
      );
    }

    // Date range filter
    if (from) {
      query = query.where(
        'createdAt',
        '>=',
        from
      );
    }

    if (to) {
      query = query.where(
        'createdAt',
        '<=',
        to
      );
    }

    query = query
      .orderBy('createdAt', 'desc')
      .limit(limit);

    const snapshot = await query.get();

  return snapshot.docs.map((doc) => {
  const data = doc.data();

  return {
    id: doc.id,

    movementType:
      data.movementType || "TRANSFER",

    customerId:
      data.customerId || "",

    customerName:
      data.customerName || "",

    productId:
      data.productId || "",

    productName:
      data.productName || "",

    batchId:
      data.batchId || "",

    productMode:
      data.productMode || "finished_stock",

    locationCode:
      data.locationCode || "",

    responsiblePerson:
      data.responsiblePerson || "",

    quantity:
      Number(data.quantity || 0),

    name:
      data.name || "",

    fromLocationType:
      data.fromLocationType || "",

    fromLocationRef:
      data.fromLocationRef || "",

    fromLocationName:
      data.fromLocationName || "",

    toLocationType:
      data.toLocationType || "",

    toLocationRef:
      data.toLocationRef || "",

    toLocationName:
      data.toLocationName || "",

    remarks:
      data.remarks || "",

    movementDate:
      data.movementDate || "",

    createdBy:
      data.createdBy || "",

    // Firestore Timestamp → plain number
    createdAt:
      data.createdAt?.toMillis
        ? data.createdAt.toMillis()
        : null,

  } satisfies StockMovementType;
});
  } catch (error) {
    console.error(
      'Error fetching stock movements:',
      error
    );

    return [];
  }
}