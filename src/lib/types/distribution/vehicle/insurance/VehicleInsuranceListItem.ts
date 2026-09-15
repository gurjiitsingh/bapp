export type VehicleInsuranceListItem = {
  id: string;

  vehicleId: string;
  vehicleNumber: string;
  locationCode: string;
  vehicleName: string;

  insuranceCompany: string;
  policyNumber: string;
  insuranceType: string;

  startDate: number;
  endDate: number;
  renewDate: number;

  premiumAmount: number;

  remarks: string;
};