"use server";

import { registerCustomerAccount } from "@/modules/customer-account/registration/registration.service";

export async function registerCustomer(formData: FormData) {
  return registerCustomerAccount({
    fullName: String(formData.get("fullName") ?? ""),
    email: String(formData.get("email") ?? ""),
    mobile: String(formData.get("mobile") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
}