'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import { revalidateTag } from 'next/cache';

export type GenerateVehicleEMIsType = {
  vehicleId: string;
  financeId: string;

  startDate: number;

  emiAmount: number;

  numberOfInstallments: number;
};

export async function generateVehicleEMIs(
  data: GenerateVehicleEMIsType
) {
  try {
    if (!data.vehicleId) {
      return {
        success: false,
        message: 'Vehicle is required.',
      };
    }

    if (!data.financeId) {
      return {
        success: false,
        message: 'Finance record is required.',
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
        message:
          'Number of installments must be greater than zero.',
      };
    }

    // Check finance exists
    const financeSnap = await adminDb
      .collection('vehicle_finances')
      .doc(data.financeId)
      .get();

    if (!financeSnap.exists) {
      return {
        success: false,
        message: 'Finance record not found.',
      };
    }

    const finance = financeSnap.data();

    const loanAmount = Number(
      finance?.loanAmount || 0
    );

    const interestRate = Number(
      finance?.interestRate || 0
    );

    if (loanAmount <= 0) {
      return {
        success: false,
        message: 'Invalid loan amount in finance record.',
      };
    }

    if (interestRate < 0) {
      return {
        success: false,
        message: 'Invalid interest rate in finance record.',
      };
    }

    // Prevent duplicate EMI generation
    const existing = await adminDb
      .collection('vehicle_finance_installments')
      .where(
        'financeId',
        '==',
        data.financeId
      )
      .limit(1)
      .get();

    if (!existing.empty) {
      return {
        success: false,
        message:
          'EMI installments already exist for this finance record.',
      };
    }

    const batch = adminDb.batch();

    const firstDate = new Date(
      data.startDate
    );

    // Annual interest rate -> monthly interest rate
    const monthlyInterestRate =
      interestRate / 12 / 100;

    let remainingPrincipal = loanAmount;

    for (
      let i = 0;
      i < data.numberOfInstallments;
      i++
    ) {
      const dueDate = new Date(
        firstDate
      );

      dueDate.setMonth(
        dueDate.getMonth() + i
      );

      // Interest for this month
      const interestAmount =
        remainingPrincipal *
        monthlyInterestRate;

      // Principal portion of EMI
      let principalAmount =
        data.emiAmount -
        interestAmount;

      // Prevent negative principal
      if (principalAmount < 0) {
        principalAmount = 0;
      }

      // Last installment adjustment
      if (
        i ===
        data.numberOfInstallments - 1
      ) {
        principalAmount =
          remainingPrincipal;
      }

      const installmentAmount =
        principalAmount +
        interestAmount;

      remainingPrincipal -=
        principalAmount;

      if (remainingPrincipal < 0) {
        remainingPrincipal = 0;
      }

      const installmentRef = adminDb
        .collection(
          'vehicle_finance_installments'
        )
        .doc();

      batch.set(installmentRef, {
        id: installmentRef.id,

        vehicleId: data.vehicleId,

        financeId: data.financeId,

        installmentNumber: i + 1,

        dueDate: dueDate.getTime(),

        amount: Number(
          installmentAmount.toFixed(2)
        ),

        principalAmount: Number(
          principalAmount.toFixed(2)
        ),

        interestAmount: Number(
          interestAmount.toFixed(2)
        ),

        status: 'PENDING',

        paidDate: null,

        paymentReference: '',

        remarks: '',

        createdAt: Date.now(),

        updatedAt: Date.now(),
      });
    }

    await batch.commit();

    revalidateTag(
      `vehicle-finance-${data.vehicleId}`,
      'max'
    );

    return {
      success: true,
      message:
        'EMI installments generated successfully.',
    };
  } catch (error: any) {
    console.error(
      '❌ generateVehicleEMIs:',
      error
    );

    return {
      success: false,
      message:
        error.message ||
        'Failed to generate EMI installments.',
    };
  }
}