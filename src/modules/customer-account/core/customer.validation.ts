import type {
  CreateCustomerAddressInput,
  UpdateCustomerAddressInput,
} from "./customer.types";

type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function optionalString(
  value: unknown,
  field: string,
  maxLength = 250
): ValidationResult<string | undefined> {
  if (value === undefined || value === null || value === "") {
    return { success: true, data: undefined };
  }

  if (typeof value !== "string") {
    return { success: false, error: `${field} must be text.` };
  }

  const cleaned = value.trim();

  if (cleaned.length > maxLength) {
    return {
      success: false,
      error: `${field} must be ${maxLength} characters or fewer.`,
    };
  }

  return { success: true, data: cleaned };
}

function requiredString(
  value: unknown,
  field: string,
  maxLength = 250
): ValidationResult<string> {
  const result = optionalString(value, field, maxLength);

  if (!result.success) {
    return result;
  }

  if (!result.data) {
    return { success: false, error: `${field} is required.` };
  }

  return { success: true, data: result.data };
}

const textFields = [
  "firstName",
  "lastName",
  "name",
  "email",
  "mobNo",
  "addressLine1",
  "addressLine2",
  "city",
  "state",
  "zipCode",
  "country",
  "portal",
  "staircase",
  "floor",
  "door",
  "deliveryNotes",
] as const;

function validateAddressFields(
  input: unknown,
  requireRequiredFields: boolean
): ValidationResult<
  CreateCustomerAddressInput | UpdateCustomerAddressInput
> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { success: false, error: "Invalid address data." };
  }

  const source = input as Record<string, unknown>;
  const result: Record<string, unknown> = {};

  for (const field of textFields) {
    const isRequired =
      requireRequiredFields &&
      ["addressLine1", "city", "zipCode"].includes(field);

    if (!requireRequiredFields && !(field in source)) {
      continue;
    }

    const checked = isRequired
      ? requiredString(source[field], field)
      : optionalString(
          source[field],
          field,
          field === "deliveryNotes" ? 1000 : 250
        );

    if (!checked.success) {
      return checked;
    }

    if (checked.data !== undefined) {
      result[field] = checked.data;
    }
  }

  if ("isDefault" in source) {
    if (typeof source.isDefault !== "boolean") {
      return {
        success: false,
        error: "isDefault must be true or false.",
      };
    }

    result.isDefault = source.isDefault;
  }

  return {
    success: true,
    data: result as
      | CreateCustomerAddressInput
      | UpdateCustomerAddressInput,
  };
}

export function validateCreateCustomerAddress(
  input: unknown
): ValidationResult<CreateCustomerAddressInput> {
  const result = validateAddressFields(input, true);

  if (!result.success) {
    return result;
  }

  return {
    success: true,
    data: result.data as CreateCustomerAddressInput,
  };
}

export function validateUpdateCustomerAddress(
  input: unknown
): ValidationResult<UpdateCustomerAddressInput> {
  const result = validateAddressFields(input, false);

  if (!result.success) {
    return result;
  }

  if (Object.keys(result.data).length === 0) {
    return {
      success: false,
      error: "Provide at least one field to update.",
    };
  }

  return {
    success: true,
    data: result.data as UpdateCustomerAddressInput,
  };
}