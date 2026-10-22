export type {
  CustomerAddress,
  CreateCustomerAddressInput,
  UpdateCustomerAddressInput,
} from "./core/customer.types";

export {
  getRegisteredCustomerAddresses,
  getRegisteredCustomerAddress,
  addRegisteredCustomerAddress,
  updateRegisteredCustomerAddress,
  deleteRegisteredCustomerAddress,
  setRegisteredCustomerDefaultAddress,
} from "./addresses/address.service";