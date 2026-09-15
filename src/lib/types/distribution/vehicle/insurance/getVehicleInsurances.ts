'use server';

import { adminDb } from '@/lib/firebaseAdmin';
import { VehicleInsuranceListItem } from './VehicleInsuranceListItem';

export async function getVehicleInsurances() {
  try {
    const insuranceSnap = await adminDb
      .collection('vehicle_insurances')
      .orderBy('endDate', 'asc')
      .get();

    const insurances: VehicleInsuranceListItem[] =
      insuranceSnap.docs.map((doc) => {
        const data = doc.data();

     

        return {
          id: doc.id,

          vehicleId: data.vehicleId || '',
          vehicleNumber: data.locationCode || '',
          locationCode: data.locationCode || '',
          vehicleName: data.vehicleName || '',

          insuranceCompany:
            data.insuranceCompany || '',
          policyNumber:
            data.policyNumber || '',
          insuranceType:
            data.insuranceType || 'OTHER',

          startDate:
            Number(data.startDate || 0),
          endDate:
            Number(data.endDate || 0),
          renewDate:
            Number(data.renewDate || 0),

          premiumAmount:
            Number(data.premiumAmount || 0),

          remarks:
            data.remarks || '',
        };
      });

    return {
      success: true,
      data: insurances,
    };
  } catch (error: any) {
    console.error(
      '❌ getVehicleInsurances:',
      error
    );

    return {
      success: false,
      message:
        error.message ||
        'Failed to load vehicle insurance.',
      data: [],
    };
  }
}