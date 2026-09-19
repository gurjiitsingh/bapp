"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase/firestore";
import { addUserDirect, addUserDirectPrimaryMOB } from "../user/dbOperation";
import {
  addCustomerAddressDirect,
  addCustomerAddressDirectPrimaryMOB,
} from "../address/dbOperations";
import { TOrderMaster, orderMasterDataT } from "@/lib/types/orderMasterType";
import {
  CartItem,
  CartItemWithTax,
  orderDataType,
  purchaseDataT,
} from "@/lib/types/cartDataType";
import { ProductType } from "@/lib/types/productType";
import admin from "firebase-admin";
import { checkStockAvailability } from "@/lib/firestore/checkStockAvailability";
import { convertProductsToCartItems } from "@/lib/cart/convertProductsToCartItems";
import { OrderProductT } from "@/lib/types/orderType";
const TAX_IMPLEMENT = process.env.TAX_IMPLEMENT === "true";

type orderMasterDataSafeT = Omit<orderMasterDataT, "createdAt"> & {
  createdAt: string; // ISO string
};

type FetchOrdersOptions = {
  afterId?: string;
  pageSize?: number;
};


const SHOULD_MAINTAIN_STOCK =
  process.env.NEXT_PUBLIC_MAINTAIN_STOCK === "true" ||
  process.env.NEXT_PUBLIC_MAINTAIN_STOCK === "1";

import { calculateTaxForCart } from "@/lib/tax/calculateTaxForCart-withRounding";
import { calculateOrderTotals } from "@/lib/orderAmount/calculateOrderTotals";
import { toTimestamp } from "@/utils/toTimestamp";
import { toAdminTimestamp } from "@/utils/toAdminTimestamp";
import { processSaleInventory } from "../inventory/processSaleInventory";
import { checkStockAvailabilityV2 } from "../inventory/checkStockAvailabilityV2";



export async function createNewOrderCustomerAddress(
  purchaseData: purchaseDataT
) {
  const { address } = purchaseData;
  const { email, lastName, firstName } = address;

  const password = "123456"; // default password
  const username = `${firstName}${lastName}`;

  // Step 1: Create user account
  const formData = new FormData();
  formData.append("username", username);
  formData.append("email", email);
  formData.append("password", password);
  formData.append("confirmPassword", password);

  const UserAddedId = (await addUserDirect(formData)) as string;

  // Step 2: Add customer address
  const formDataAdd = new FormData();
  formDataAdd.append("firstName", firstName);
  formDataAdd.append("lastName", lastName);
  formDataAdd.append("userId", UserAddedId);
  formDataAdd.append("email", email);
  formDataAdd.append("mobNo", address.mobNo);
  formDataAdd.append("password", password);
  formDataAdd.append("addressLine1", address.addressLine1 || "");
  formDataAdd.append("addressLine2", address.addressLine2 || "");
  formDataAdd.append("city", address.city);
  formDataAdd.append("state", address.state);
  formDataAdd.append("zipCode", address.zipCode);

  const addressAddedId = await addCustomerAddressDirect(formDataAdd);

  const customerName = `${firstName} ${lastName}`;

  return { addressAddedId, UserAddedId, customerName };
}

export async function createNewOrderCustomerAddressSMALL(
  purchaseData: purchaseDataT
) {
  const { address } = purchaseData;
  const { email = "", lastName, firstName, mobNo } = address;

  const password = "123456";
  const username = `${firstName}${lastName}`;

  const finalEmail = email && email.trim() !== "" ? email : `${mobNo}@mail.com`;

  // --- Create user ---
  const formUser = new FormData();
  formUser.append("username", username);
  formUser.append("email", finalEmail);
  formUser.append("password", password);
  formUser.append("confirmPassword", password);
  formUser.append("mobNo", mobNo);
  formUser.append("firstName", firstName);
  formUser.append("lastName", lastName);

  const UserAddedId = (await addUserDirectPrimaryMOB(formUser)) as string;

  // --- Add address ---
  const formAddress = new FormData();
  formAddress.append("firstName", firstName);
  formAddress.append("lastName", lastName);
  formAddress.append("userId", UserAddedId);
  formAddress.append("email", finalEmail);
  formAddress.append("mobNo", address.mobNo);
  formAddress.append("password", password);
  formAddress.append("addressLine1", address.addressLine1 ?? "");
  formAddress.append("addressLine2", address.addressLine2 ?? "");
  formAddress.append("city", address.city ?? "");
  formAddress.append("state", address.state ?? "Punjab");
  formAddress.append("zipCode", address.zipCode ?? "123");

  const addressAddedId = await addCustomerAddressDirectPrimaryMOB(formAddress);

  const customerName = `${firstName} ${lastName}`;

  return { addressAddedId, UserAddedId, customerName };
}





export async function updateOrderMaster(id: string, status: string) {
  try {
    const docRef = adminDb.collection("orderMaster").doc(id);
    await docRef.update({ status });
    console.log("Document updated successfully!");
  } catch (error) {
    console.error("❌ Failed to update orderMaster:", error);
    return { errors: "Cannot update" };
  }
}





export async function fetchOrdersPaginated({
  afterId,
  pageSize = 10,
}: FetchOrdersOptions) {
  const collectionRef = adminDb.collection("orderMaster");

  let queryRef;

  if (afterId) {
    const docRef = await collectionRef.doc(afterId).get();
    queryRef = collectionRef
      .orderBy("createdAt", "desc")
      .startAfter(docRef)
      .limit(pageSize);
  } else {
    queryRef = collectionRef.orderBy("createdAt", "desc").limit(pageSize);
  }

  const snapshot = await queryRef.get();

  const orders = snapshot.docs.map((doc) => {
    const data = doc.data();
    const date = data.createdAt?.toDate?.();
    // const formattedDate = date?.toLocaleString("en-GB", {
    //   year: "numeric",
    //   month: "long",
    //   day: "2-digit",
    //   hour: "2-digit",
    //   minute: "2-digit",
    // });

    //  const deliveryTime = data.scheduledAt?.toDate?.();

    //     const dateObj =
    //     typeof data.createdAt === "object" && data.createdAt?.toDate
    //     ? data.createdAt.toDate()
    //     : data.createdAt
    //     ? new Date(data.createdAt)
    //     : null;
    // const createdAtISO = dateObj?.toISOString() || data.createdAtUTC || "";

    return {
      id: doc.id,

      // 🧾 Customer Info
      customerName: data.customerName || "",
      email: data.email || "",
      customerId: data.userId || "",
      addressId: data.addressId || "",
      ownerId: "temp_OW_ID", // 🔑 Restaurant owner (Auth UID)
      outletId: "temp_Oulet_ID",

      // 🕒 Order Info
     srno: data.srno || 0,
      tableNo: data.tableNo,
      orderType: data.orderType,
      createdAt:
        data.createdAt?.toDate?.().toISOString?.() || data.createdAt || "",
      createdAtUTC: data.createdAtUTC || "",
      isScheduled: data.isScheduled,
      scheduledAt:
        data.scheduledAt?.toDate?.().toISOString?.() || data.scheduledAt || "",

      // 💳 Payment Info
      paymentMode: data.paymentType || "",
      paymentStatus: data.paymentStatus || "NEW",

      // 📦 Status
      status:data.publishStatus || "",
      orderStatus:data.publishStatus || "NEW",

      // 💰 Item & Discount Totals
      itemTotal: data.itemTotal || 0, // legacy (before discount & tax)
      totalDiscountG: data.totalDiscountG || 0, // legacy
      couponFlat: data.couponFlat || 0,
      calculatedPickUpDiscountL: data.calculatedPickUpDiscountL || 0,
      calcouponPercent: data.calcouponPercent || 0,
      couponPercentPercentL: data.couponPercentPercentL || 0,
      pickUpDiscountPercentL: data.pickUpDiscountPercentL || 0,
      couponCode: data.couponCode || "",

      // 🚚 Delivery / Fees
      deliveryFee: data.deliveryFee || data.deliveryFee || 0,

      // 🧮 Tax & Totals (new clean structure)
      discountTotal: data.discountTotal || data.totalDiscountG || 0,
      taxBeforeDiscount: data.taxBeforeDiscount || 0,
      taxTotal: data.taxTotal || data.taxTotal || 0,
      subTotal: data.subTotal || data.itemTotal || 0,
      grandTotal:
        data.grandTotal || data.finalGrandTotal || data.endTotalG || 0,

      // 🔖 Meta / Automation
      source: data.source || "POS",
      printed: data.printed || false,
      acknowledged: data.acknowledged || false,

      // 📝 Notes
      notes: data.notes || "",
    } as orderMasterDataT;
  });

  const lastDoc = snapshot.docs[snapshot.docs.length - 1];
  return { orders, lastId: lastDoc?.id || null };
}

export async function fetchOrdersMaster(): Promise<orderMasterDataSafeT[]> {
  const data: orderMasterDataSafeT[] = [];

  const collectionRef = adminDb.collection("orderMaster");
  const querySnapshot = await collectionRef
    .orderBy("srno", "desc")
    .limit(20)
    .get();

  querySnapshot.forEach((doc) => {
    const raw = doc.data() as orderMasterDataT;

    const createdAtStr =
      raw.createdAt instanceof admin.firestore.Timestamp
        ? raw.createdAt.toDate().toISOString()
        : new Date().toISOString(); // fallback if somehow it's not a Timestamp

    const pData: orderMasterDataSafeT = {
      ...raw,
      id: doc.id,
      createdAt: createdAtStr,
    };

    data.push(pData);
  });

  return data;
}
// export async function fetchOrdersMaster(): Promise<orderMasterDataSafeT[]> {
//   const data: orderMasterDataSafeT[] = [];

//   const collectionRef = adminDb.collection("orderMaster");
//   const querySnapshot = await collectionRef
//     .orderBy("srno", "desc")
//     .limit(20)
//     .get();

//   querySnapshot.forEach((doc) => {
//     const raw = doc.data() as orderMasterDataT;

//     const createdAtStr =
//       raw.createdAt?.toDate?.() instanceof Date
//         ? raw.createdAt.toDate().toISOString()
//         : new Date().toISOString(); // fallback

//     const pData: orderMasterDataSafeT = {
//       ...raw,
//       id: doc.id,
//       createdAt: createdAtStr,
//     };

//     data.push(pData);
//   });

//   return data;
// }

export async function deleteOrderMasterRec(id: string) {
  const docRef = adminDb.collection("orderMaster").doc(id);

  await docRef.delete();

  return {
    message: { success: "Order Deleted" },
  };
}

export async function fetchOrdersMasterByUserId(
  userId: string
): Promise<Array<TOrderMaster>> {
  const data: TOrderMaster[] = [];

  const snapshot = await adminDb
    .collection("orderMaster")
    .where("userId", "==", userId)
    .get();

  snapshot.forEach((doc) => {
    data.push({
      id: doc.id,
      ...doc.data(),
    } as TOrderMaster);
  });

  return data;
}

export async function fetchOrderMasterById(id: string) {
  const docSnap = await adminDb.collection("orderMaster").doc(id).get();

  if (!docSnap.exists) {
    console.log("No such document!");
    return null;
  }

  const raw = docSnap.data() as orderMasterDataT;

  const convert = (ts: any) =>
    ts?.toDate?.().toISOString?.() || null;

  return {
    ...raw,

    id: docSnap.id,

    // ✅ override ALL timestamps
    createdAt: convert(raw.createdAt),
    updatedAt: convert(raw.updatedAt),
    lastSyncedAt: convert(raw.lastSyncedAt),
    scheduledAt: convert(raw.scheduledAt),
  } as orderMasterDataSafeT;
}

/***************** Order detail  **************************/

export async function fetchOrderProductsByOrderMasterId(OrderMasterId: string) {
  const data: OrderProductT[] = [];

  const snapshot = await adminDb
    .collection("orderProducts")
    .where("orderMasterId", "==", OrderMasterId)
    .get();

  snapshot.forEach((doc) => {
    const raw = doc.data();

  const safeData: OrderProductT = {
  ...raw,

  id: doc.id,
  productId: raw.productId || raw.id || "",

  orderMasterId: raw.orderMasterId || "",
  name: raw.name || "",
  basePrice: raw.basePrice || 0,
  quantity: raw.quantity || 0,
  itemSubtotal: raw.itemSubtotal || 0,

  taxRate: raw.taxRate || 0,
  taxType: raw.taxType || "exclusive",
  taxAmount: raw.taxAmount || 0,
  taxTotal: raw.taxTotal || 0,
  finalPrice: raw.finalPrice || 0,
  finalTotal: raw.finalTotal || 0,

  image: raw.image || "",
  categoryId: raw.categoryId || "",
  productCat: raw.productCat || "",

  purchaseSession: raw.purchaseSession || "",
  status: raw.status || "",
  userId: raw.userId || "",

  productDesc: raw.productDesc || "",

  note: raw.note || "",
  modifiers: raw.modifiers || [],
};

    data.push(safeData);
  });

  return data;
}


/*********************** stock decrease ******************************* */

/**
 * Decrease stock quantities after payment confirmation.
 * 
 * 
 * How it works

Also reads from orderProducts.

Fetches each product individually.

Checks for insufficient stock before decrementing.

Also updates product status → "out_of_stock" when currentStock = 0.

Returns detailed error messages per product.

🟢 Use this when:

You want extra validation and safety.

You’re updating stock during checkout or pre-payment, and you must ensure items are still available.

You want human-readable messages for the admin or logs.

⚠️ Limitations

Slightly slower (per-item reads).

Not 100% atomic if the process crashes mid-loop (though batch helps at commit stage).

Requires the product to exist with an id that matches Firestore doc.id.
 * 
 * 
 */
export async function decreaseProductStock(orderMasterId: string) {
  try {
    // 🔹 Get ordered products from Firestore
    const orderProductsSnap = await adminDb
      .collection("orderProducts")
      .where("orderMasterId", "==", orderMasterId)
      .get();

    if (orderProductsSnap.empty) {
      console.log("No orderProducts found for order:", orderMasterId);
      return { success: false, message: "No products found for this order." };
    }

    const batch = adminDb.batch();
    const insufficientStock: string[] = [];

    // 🔹 Loop through ordered items
    for (const doc of orderProductsSnap.docs) {
      const item = doc.data();
      const productRef = adminDb.collection("products").doc(item.id);
      const productSnap = await productRef.get();

      if (!productSnap.exists) {
        insufficientStock.push(`${item.id} (not found)`);
        continue;
      }

      const product = productSnap.data() as ProductType;
      const currentStock = product.currentStock ?? 0;
      const quantityOrdered = item.quantity ?? 0;

      //  Check stock
      if (currentStock < quantityOrdered) {
        insufficientStock.push(`${product.name} (only ${currentStock} left)`);
        continue;
      }

      const newStock = currentStock - quantityOrdered;

      //  Add to batch
      batch.update(productRef, {
        currentStock: newStock,
        status: newStock === 0 ? "out_of_stock" : product.stockStatus,
      });
    }

    if (insufficientStock.length > 0) {
      return {
        success: false,
        message: "Insufficient stock for some products.",
        details: insufficientStock,
      };
    }

    await batch.commit();
    console.log(" Stock updated successfully for order:", orderMasterId);
    return { success: true, message: "Stock updated successfully." };
  } catch (error) {
    console.error("❌ Error decreasing product stock:", error);
    return { success: false, message: "Error updating stock." };
  }
}

/**
 * Decrease product stock quantities after successful payment.
 * Uses the product Firestore ID (item.id) from `orderProducts`.
 

How it works

Reads orderProducts documents from Firestore.

Looks for productId or fallback id.

Uses Firestore’s batch writes for atomic updates.

Doesn’t check stock availability (just decrements).

Prioritizes simplicity and performance.

🟢 Use this when:

You trust your order creation logic to prevent overselling.

You want the fastest, most atomic stock update.

You want reliability even if the order has dozens of items.

Example: after confirmed payment or order status = “paid”.

⚠️ Limitations

Doesn’t check if stock is sufficient (may allow negative values if something went wrong earlier).

Less verbose reporting.
*/
export async function decreaseProductStockFromOrder(orderMasterId: string) {
  try {
    console.log("🔹 Updating stock for order:", orderMasterId);

    // 1️⃣ Get all orderProducts for this order
    const orderProductsSnapshot = await adminDb
      .collection("orderProducts")
      .where("orderMasterId", "==", orderMasterId)
      .get();

    if (orderProductsSnapshot.empty) {
      console.warn("⚠️ No orderProducts found for order:", orderMasterId);
      return { success: false, message: "No products found for this order." };
    }

    // 2️⃣ Start Firestore batch
    const batch = adminDb.batch();

    // 3️⃣ Loop through all ordered items
    for (const doc of orderProductsSnapshot.docs) {
      const orderItem = doc.data();
      const productId = orderItem.id; //  Firestore document ID of the product
      const orderQty = orderItem.quantity ?? 0;

      if (!productId || orderQty <= 0) continue;

      const productRef = adminDb.collection("products").doc(productId);
      const productSnap = await productRef.get();

      if (!productSnap.exists) {
        console.warn(`⚠️ Product ${productId} not found in Firestore`);
        continue;
      }

      const productData = productSnap.data();
      const currentStock = productData?.currentStock ?? 0;
      const newStock = Math.max(currentStock - orderQty, 0);

      batch.update(productRef, {
        currentStock: newStock,
        status:
          newStock === 0 ? "out_of_stock" : productData?.orderStatus ?? "published",
      });

      console.log(
        ` ${productData?.name ?? productId}: ${currentStock} → ${newStock}`
      );
    }

    // 4️⃣ Commit batch
    await batch.commit();

    console.log("🎉 Stock updated successfully for order:", orderMasterId);
    return { success: true, message: "Stock updated successfully." };
  } catch (error) {
    console.error("❌ Error updating stock:", error);
    return { success: false, message: "Error updating stock." };
  }
}
