export type CustomerAddress = {
  id: string;
  userId: string;

  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  mobNo?: string;

  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  zipCode: string;
  country?: string;

  // Optional fields used by delivery addresses in Spain.
  portal?: string;
  staircase?: string;
  floor?: string;
  door?: string;
  deliveryNotes?: string;

  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCustomerAddressInput = {
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  mobNo?: string;

  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  zipCode: string;
  country?: string;

  portal?: string;
  staircase?: string;
  floor?: string;
  door?: string;
  deliveryNotes?: string;

  isDefault?: boolean;
};

export type UpdateCustomerAddressInput =
  Partial<CreateCustomerAddressInput>;