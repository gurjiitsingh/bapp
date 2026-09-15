'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import { revalidatePath, revalidateTag } from 'next/cache';

export type AddVehicleFinanceType = {
  vehicleId: string;

  financeCompany: string;
  loanAccountNumber?: string;

  loanAmount: number;
  interestRate: number;
  emiAmount: number;
  numberOfInstallments: number;

  startDate: number;
  endDate: number;

  remarks?: string;
};

export async function addVehicleFinance(
  data: AddVehicleFinanceType
) {
  try {
    if (!data.vehicleId) {
      return {
        success: false,
        message: 'Vehicle is required.',
      };
    }

    if (!data.financeCompany?.trim()) {
      return {
        success: false,
        message: 'Finance company is required.',
      };
    }

    if (data.loanAmount <= 0) {
      return {
        success: false,
        message: 'Loan amount must be greater than zero.',
      };
    }

    if (data.interestRate < 0) {
      return {
        success: false,
        message: 'Interest rate cannot be negative.',
      };
    }

    if (data.emiAmount <= 0) {
      return {
        success: false,
        message: 'EMI amount must be greater than zero.',
      };
    }

    if (data.numberOfInstallments <= 0) {
      return {
        success: false,
        message: 'Number of installments must be greater than zero.',
      };
    }

    // Check vehicle exists
    const vehicleSnap = await adminDb
      .collection('stockLocations')
      .doc(data.vehicleId)
      .get();

    if (!vehicleSnap.exists) {
      return {
        success: false,
        message: 'Vehicle not found.',
      };
    }

    const financeRef = adminDb
      .collection('vehicle_finances')
      .doc();

    await financeRef.set({
      id: financeRef.id,

      vehicleId: data.vehicleId,

      financeCompany:
        data.financeCompany.trim(),

      loanAccountNumber:
        data.loanAccountNumber?.trim() || '',

      loanAmount: data.loanAmount,

      interestRate: data.interestRate,

      emiAmount: data.emiAmount,

      numberOfInstallments:
        data.numberOfInstallments,

      startDate: data.startDate,

      endDate: data.endDate,

      status: 'ACTIVE',

      remarks:
        data.remarks?.trim() || '',

      createdAt: Date.now(),

      updatedAt: Date.now(),
    });

    revalidateTag('vehicles', 'max');

    revalidateTag(
      `vehicle-finance-${data.vehicleId}`,
      'max'
    );

    revalidatePath(
      '/admin/distribution/vehicles'
    );

    return {
      success: true,
      message:
        'Vehicle finance added successfully.',
      financeId: financeRef.id,
    };
  } catch (error: any) {
    console.error(
      '❌ addVehicleFinance:',
      error
    );

    return {
      success: false,
      message:
        error.message ||
        'Failed to add vehicle finance.',
    };
  }
}