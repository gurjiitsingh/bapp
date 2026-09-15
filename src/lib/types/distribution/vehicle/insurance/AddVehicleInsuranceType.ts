export type AddVehicleInsuranceType = {
  vehicleId: string;
  vehicleName: string;
  locationCode: string;

  insuranceCompany: string;
  policyNumber: string;
  insuranceType:
    | "COMPREHENSIVE"
    | "THIRD_PARTY"
    | "OTHER";

  startDate: number;
  endDate: number;
  renewDate: number;

  premiumAmount: number;

  remarks?: string;
};