import { z } from "zod";
import { Timestamp, FieldValue } from "firebase/firestore";

export const outletSchema = z.object({
  outletId: z.string().optional(),
  ownerId: z.string().optional(),

  // TAX
  taxType: z.string().min(2, "Tax type").optional().nullable(),
  gstVatNumber: z
    .string()
    .min(4, "Invalid GST / VAT number")
    .optional()
    .nullable(),

  // DISPLAY
  outletName: z.string().min(1, "Outlet name is required"),

  // ADDRESS
  addressLine1: z.string().min(1, "Address line 1 required"),
  addressLine2: z.string().optional(),
  addressLine3: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipcode: z.string().optional(),
  country: z.string().optional(),

  // ✅ NEW (IMPORTANT)
  countryCode: z.string().min(2, "Country is required"),

  // CONTACT
  phone: z.string().optional(),
  phone2: z.string().optional(),
  email: z.string().optional(),
  web: z.string().optional(),

  // POS / PRINTER
  printerWidth: z.enum(["58", "80"]),
  footerNote: z.string().optional(),

  // STATUS
  isActive: z.boolean(),
});

export type ToutletSchema = z.infer<typeof outletSchema>;

export type OutletType = {
  outletId?: string;
  outletName: string;

  // Address
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;

  // ✅ NEW
  countryCode: string;

  // Tax
  taxType?: string;
  gstVatNumber?: string;

  // Contact
  phone?: string;
  phone2?: string;
  email?: string;
  web?: string;

  // Printer / POS
  printerWidth?: 58 | 80;
  printerName?: string;
  footerNote?: string;

  // Status
  isActive: boolean;

  // Metadata
  createdAt?: any;
  updatedAt?: any;

  // 🔥 BACKWARD SUPPORT (READ ONLY)
  defaultCurrency?: string;
};