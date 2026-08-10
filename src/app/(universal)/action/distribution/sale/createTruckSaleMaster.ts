"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { PaymentMethodType } from "@/lib/types/distribution/PaymentMethodType";

type Props = {
  saleId: string;
  saleNo: string;

  tripId: string;
tripNo: string;
  vehicleId: string;
  vehicleName: string;
  locationCode: string;
  responsiblePerson: string;

  wholeSaleCutomerId: string;
  wholeSaleCutomerName: string;

  totalAmount: number;

  paymentStatus: "PAID" | "PARTIAL" | "CREDIT";
  paymentMethod?: PaymentMethodType;

  paidAmount: number;
  dueAmount: number;

  remarks?: string;
  createdBy?: string;

  totalItems: number;
  totalQuantity: number;
};

export async function createTruckSaleMaster(
  tx: admin.firestore.Transaction,
  data: Props
) {
  const ref = adminDb
    .collection("truckSales")
    .doc(data.saleId);

  tx.set(ref, {
    // =========================================
    // IDENTIFICATION
    // =========================================

    saleId: data.saleId,
    saleNo: data.saleNo,

    tripId: data.tripId,
tripNo:data.tripNo,
    // =========================================
    // VEHICLE
    // =========================================

    vehicleId: data.vehicleId,
    vehicleName: data.vehicleName,

    locationCode: data.locationCode,
    responsiblePerson: data.responsiblePerson,

    // =========================================
    // CUSTOMER
    // =========================================

    wholeSaleCutomerId:
      data.wholeSaleCutomerId,

    wholeSaleCutomerName:
      data.wholeSaleCutomerName,

    // =========================================
    // TOTALS
    // =========================================

    totalAmount: data.totalAmount,

    totalItems: data.totalItems,

    totalQuantity: data.totalQuantity,

    // =========================================
    // PAYMENT
    // =========================================

    paymentStatus:
      data.paymentStatus,

    paymentMethod:
      data.paymentMethod || null,

    paidAmount:
      data.paidAmount,

    dueAmount:
      data.dueAmount,

    // =========================================
    // META
    // =========================================

    remarks:
      data.remarks || "",

    createdBy:
      data.createdBy || "",

    status: "COMPLETED",

    createdAt:
      admin.firestore.FieldValue.serverTimestamp(),
  });

  return ref;
}