 

 
'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import { AddVehicleInsuranceType } from '@/lib/types/distribution/vehicle/insurance/AddVehicleInsuranceType';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function addVehicleInsurance(
  data: AddVehicleInsuranceType
) {

  console.log("Data---------------------",data)
  try {
    if (!data.vehicleId) {
      return {
        success: false,
        message: 'Vehicle is required.',
      };
    }

    if (!data.insuranceCompany?.trim()) {
      return {
        success: false,
        message: 'Insurance company is required.',
      };
    }

    if (!data.policyNumber?.trim()) {
      return {
        success: false,
        message: 'Policy number is required.',
      };
    }

    if (!data.startDate || data.startDate <= 0) {
      return {
        success: false,
        message: 'Policy start date is required.',
      };
    }

    if (!data.endDate || data.endDate <= 0) {
      return {
        success: false,
        message: 'Policy end date is required.',
      };
    }

    if (!data.renewDate || data.renewDate <= 0) {
      return {
        success: false,
        message: 'Renew date is required.',
      };
    }

    if (data.endDate < data.startDate) {
      return {
        success: false,
        message: 'Policy end date cannot be before start date.',
      };
    }

    if (data.premiumAmount < 0) {
      return {
        success: false,
        message: 'Premium amount cannot be negative.',
      };
    }

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

    const insuranceRef = adminDb
      .collection('vehicle_insurances')
      .doc();

    await insuranceRef.set({
      id: insuranceRef.id,

      vehicleId: data.vehicleId,
      vehicleName: data.vehicleName?.trim() || '',
      locationCode: data.locationCode?.trim() || '',

      insuranceCompany: data.insuranceCompany.trim(),
      policyNumber: data.policyNumber.trim(),
      insuranceType: data.insuranceType,

      startDate: data.startDate,
      endDate: data.endDate,
      renewDate: data.renewDate,

      premiumAmount: data.premiumAmount,

      remarks: data.remarks?.trim() || '',

      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    revalidateTag('vehicles', 'max');
    revalidateTag(
      `vehicle-insurance-${data.vehicleId}`,
      'max'
    );

    revalidatePath(
      '/admin/distribution/vehicle/insurance'
    );

    return {
      success: true,
      message: 'Vehicle insurance added successfully.',
      insuranceId: insuranceRef.id,
    };
  } catch (error: any) {
    console.error(
      '❌ addVehicleInsurance:',
      error
    );

    return {
      success: false,
      message:
        error.message ||
        'Failed to add vehicle insurance.',
    };
  }
}
 