import { purchaseDataT } from "@/lib/types/cartDataType";
"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase/firestore";
import { addUserDirect, addUserDirectPrimaryMOB } from "../user/dbOperation";
import {
  addCustomerAddressDirect,
   
} from "../address/dbOperations";
import { addUserDirectNew } from "../user/addUserDirectNew";

const TAX_IMPLEMENT = process.env.TAX_IMPLEMENT === "true";

export async function createNewOrderCustomerAddress(
  purchaseData: purchaseDataT
) {
  const { address } = purchaseData;

  const {
    email,
    mobNo,
    lastName,
    firstName,
  } = address;

  const cleanEmail = email?.trim() ?? "";
  const cleanMobNo = mobNo?.trim() ?? "";

  const password = "123456";

  /*
   * ---------------------------------------------------------
   * Username
   * ---------------------------------------------------------
   *
   * Prefer the customer's name.
   * Remove spaces so the username remains simple.
   */
  const username =
    `${firstName ?? ""}${lastName ?? ""}`
      .trim()
      .replace(/\s+/g, "");

  /*
   * ---------------------------------------------------------
   * Validate customer contact
   * ---------------------------------------------------------
   *
   * At least one of email or mobile must exist.
   */
  if (!cleanEmail && !cleanMobNo) {
    throw new Error(
      "Customer email or mobile number is required."
    );
  }

  /*
   * ---------------------------------------------------------
   * Step 1: Create user account
   * ---------------------------------------------------------
   *
   * addUserDirect currently expects an email.
   *
   * If there is no email, create a system email from
   * the customer's mobile number.
   *
   * Example:
   *
   * 9876543210
   *        ↓
   * 9876543210@mail.com
   *
   * This keeps the existing user-account system working
   * without forcing the customer to provide an email.
   */
  const accountEmail =
    cleanEmail ||
    `${cleanMobNo}@mail.com`;

  const formData = new FormData();

  formData.append(
    "username",
    username || cleanMobNo || accountEmail
  );

  formData.append(
    "email",
    accountEmail
  );

  formData.append(
    "password",
    password
  );

  formData.append(
    "confirmPassword",
    password
  );

  const UserAddedId =
    (await addUserDirectNew(formData)) as string;

    if (!UserAddedId) {
  throw new Error(
    "Unable to create or find customer user."
  );
}

  /*
   * ---------------------------------------------------------
   * Step 2: Add customer address
   * ---------------------------------------------------------
   *
   * Save the REAL customer email/mobile values.
   *
   * Important:
   *
   * If customer used phone only:
   *
   * email = ""
   * mobNo = "9876543210"
   *
   * If customer used email only:
   *
   * email = "customer@gmail.com"
   * mobNo = ""
   *
   * If both are available:
   *
   * email = "customer@gmail.com"
   * mobNo = "9876543210"
   */
  const formDataAdd = new FormData();

  formDataAdd.append(
    "firstName",
    firstName ?? ""
  );

  formDataAdd.append(
    "lastName",
    lastName ?? ""
  );

  formDataAdd.append(
    "userId",
    UserAddedId
  );

  formDataAdd.append(
    "email",
    cleanEmail
  );

  formDataAdd.append(
    "mobNo",
    cleanMobNo
  );

  formDataAdd.append(
    "password",
    password
  );

  formDataAdd.append(
    "addressLine1",
    address.addressLine1 || ""
  );

  formDataAdd.append(
    "addressLine2",
    address.addressLine2 || ""
  );

  formDataAdd.append(
    "city",
    address.city || ""
  );

  formDataAdd.append(
    "state",
    address.state || ""
  );

  formDataAdd.append(
    "zipCode",
    address.zipCode || ""
  );

  const addressAddedId =
    await addCustomerAddressDirect(formDataAdd);

  const customerName =
    `${firstName ?? ""} ${lastName ?? ""}`.trim();

  return {
    addressAddedId,
    UserAddedId,
    customerName,
  };
}
 
