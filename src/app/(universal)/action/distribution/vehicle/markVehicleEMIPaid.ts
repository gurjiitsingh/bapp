'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function markVehicleEMIPaid(
  installmentId: string,
  paymentDate: number,
  paymentReference?: string,
  remarks?: string
) {
  try {
    if (!installmentId) {
      return {
        success: false,
        message: 'Installment is required.',
      };
    }

    if (!paymentDate || paymentDate <= 0) {
      return {
        success: false,
        message: 'Payment date is required.',
      };
    }

    const installmentRef = adminDb
      .collection('vehicle_finance_installments')
      .doc(installmentId);

    const installmentSnap = await installmentRef.get();

    if (!installmentSnap.exists) {
      return {
        success: false,
        message: 'Installment not found.',
      };
    }

    const installment = installmentSnap.data();

    if (installment?.status === 'PAID') {
      return {
        success: false,
        message: 'This installment is already paid.',
      };
    }

    await installmentRef.update({
      status: 'PAID',
      paidDate: paymentDate,
      paymentReference: paymentReference?.trim() || '',
      remarks: remarks?.trim() || '',
      updatedAt: Date.now(),
    });

    revalidateTag(
      `vehicle-finance-${installment?.vehicleId}`,
      'max'
    );

    if (installment?.financeId) {
      revalidatePath(
        `/admin/distribution/vehicle/finance/emi/${installment.financeId}`
      );
    }

    return {
      success: true,
      message: 'EMI marked as paid successfully.',
    };
  } catch (error: any) {
    console.error('❌ markVehicleEMIPaid:', error);

    return {
      success: false,
      message: error.message || 'Failed to mark EMI as paid.',
    };
  }
}