import { z } from "zod";
import { Timestamp, FieldValue } from "firebase/firestore";



export const outletSchema = z.object({
  outletId: z.string().optional(), // present when updating
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
  addressLine3: z.string().optional(),          // ⭐ NEW
  city: z.string().optional(),
  state: z.string().optional(),
  zipcode: z.string().optional(),
  country: z.string().optional(),

  // CONTACT
  phone: z.string().optional(),
  phone2: z.string().optional(),
  email: z.string().optional(),         // (already valid if exists)
  web: z.string().optional(),             // ⭐ NEW

  // POS / PRINTER
  printerWidth: z.enum(["58", "80"]),
  footerNote: z.string().optional(),

  // STATUS
  isActive: z.boolean(),
});



export type ToutletSchema = z.infer<typeof outletSchema>;

export type OutletType = {
  outletId?: string; // Firestore doc id
  outletName: string;

  // Address
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;     // ⭐ NEW
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;

  // Tax
  taxType?: string;
  gstVatNumber?: string;

  // Contact
  phone: string;             // Primary phone
  phone2?: string;           // Secondary phone
  email?: string;
  web?: string;              // ⭐ NEW

  // Printer / POS
  printerWidth?: 58 | 80;
  printerName?: string;
  footerNote?: string;

  // Status
  isActive: boolean;

  // Metadata
  createdAt?: any;
  updatedAt?: any;
};

