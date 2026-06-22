"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { UNIVERSAL_UNIT_CONVERSIONS } from "@/lib/inventory/defaultUnitConversions";

export async function getUnitConversions() {
  try {
    const snapshot = await adminDb
      .collection("inventoryUnitConversions")
      .orderBy("purchaseUnit")
      .get();

    const firestoreUnits = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        ...data,

        createdAt: data.createdAt
          ? data.createdAt.toDate().toISOString()
          : null,

        updatedAt: data.updatedAt
          ? data.updatedAt.toDate().toISOString()
          : null,
      };
    });

    const universalUnits =
      UNIVERSAL_UNIT_CONVERSIONS.map(
        (item, index) => ({
          id: `universal-${index}`,
          ...item,
          type: "UNIVERSAL",
          isEditable: false,

          // keep structure same as firestore
          createdAt: null,
          updatedAt: null,
        })
      );

    return [
      ...universalUnits,
      ...firestoreUnits,
    ];
  } catch (error) {
    console.error(error);

    return UNIVERSAL_UNIT_CONVERSIONS.map(
      (item, index) => ({
        id: `universal-${index}`,
        ...item,
        type: "UNIVERSAL",
        isEditable: false,
        createdAt: null,
        updatedAt: null,
      })
    );
  }
}