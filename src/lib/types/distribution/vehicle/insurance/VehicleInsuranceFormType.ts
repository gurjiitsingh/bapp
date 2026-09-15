export type VehicleOption = {
  id: string;
  locationCode: string;
  vehicleNumber?: string;
  name: string;
};

export type VehicleInsuranceFormType = {
  vehicleId: string;

  insuranceCompany: string;
  policyNumber: string;
  insuranceType:
    | "COMPREHENSIVE"
    | "THIRD_PARTY"
    | "OTHER";

  startDate: string;
  endDate: string;
  renewDate: string;

  premiumAmount: number;

  remarks: string;
};