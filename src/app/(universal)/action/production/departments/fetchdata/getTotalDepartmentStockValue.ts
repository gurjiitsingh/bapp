'use server';

import { adminDb } from '@/lib/firebaseAdmin';

export async function getTotalDepartmentStockValue() {
  try {
    const stockSnap = await adminDb
      .collection('departmentStock')
      .get();

    if (stockSnap.empty) {
      return {
        success: true,
        totalStockValue: 0,
        message: 'No department stock found', 
      };
    }

    const totalStockValue = stockSnap.docs.reduce((total, doc) => {
      const stock = doc.data();

      return total + Number(stock.stockValue || 0);
    }, 0);

    return {
      success: true,
      totalStockValue,
      message: `Calculated total stock value from ${stockSnap.size} stock records`,
    };

  } catch (error: any) {
    return {
      success: false,
      totalStockValue: 0,
      message:
        error.message || 'Failed to calculate total department stock value',
    };
  }
}