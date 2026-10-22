import { hashPassword } from "@/lib/auth";
import {
  createCustomer,
  findCustomerByEmail,
  findCustomerByMobile,
} from "./registration.repository";

export type CustomerRegistrationResult = {
  success: boolean;
  message: string;
  userId?: string;
};

export async function registerCustomerAccount(
  input: {
    fullName: string;
    email: string;
    mobile: string;
    password: string;
  }
): Promise<CustomerRegistrationResult> {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const mobile = input.mobile.trim();
  const password = input.password;

  if (!fullName || !email || !mobile || !password) {
    return {
      success: false,
      message: "Please fill in all required fields.",
    };
  }

  if (fullName.length > 120) {
    return { success: false, message: "Name is too long." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return { success: false, message: "Please enter a valid email address." };
  }

  if (mobile.length > 30 || mobile.length < 5) {
    return { success: false, message: "Please enter a valid mobile number." };
  }

  if (password.length < 8 || password.length > 128) {
    return {
      success: false,
      message: "Password must be between 8 and 128 characters.",
    };
  }

  try {
    const existingEmail = await findCustomerByEmail(email);

    if (!existingEmail.empty) {
      return {
        success: false,
        message: "An account with this email address already exists.",
      };
    }

    const existingMobile = await findCustomerByMobile(mobile);

    if (!existingMobile.empty) {
      return {
        success: false,
        message: "This mobile number is already in use.",
      };
    }

    const hashedPassword = await hashPassword(password);

    const userId = await createCustomer({
      fullName,
      email,
      mobile,
      hashedPassword,
    });

    return {
      success: true,
      message: "Your account has been created successfully.",
      userId,
    };
  } catch (error) {
    console.error("[CustomerRegistration] Failed:", error);

    return {
      success: false,
      message: "Unable to create your account. Please try again.",
    };
  }
}