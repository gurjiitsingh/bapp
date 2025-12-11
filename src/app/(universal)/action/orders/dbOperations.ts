"use server";

import { adminDb } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase/firestore";
import { addUserDirect } from "../user/dbOperation";
import { addCustomerAddressDirect } from "../address/dbOperations";
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
import { calculateTaxForCart } from "@/lib/tax/calculateTaxForCart";
import { OrderProductT } from "@/lib/types/orderType";
const TAX_IMPLEMENT = process.env.TAX_IMPLEMENT === "true";

type orderMasterDataSafeT = Omit<orderMasterDataT, "createdAt"> & {
  createdAt: string; // ISO string
};

type FetchOrdersOptions = {
  afterId?: string;
  pageSize?: number;
};

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











const SHOULD_MAINTAIN_STOCK =
  process.env.NEXT_PUBLIC_MAINTAIN_STOCK === "true" ||
  process.env.NEXT_PUBLIC_MAINTAIN_STOCK === "1";

export async function createNewOrder(purchaseData: orderDataType) {
  const {
    endTotalG,
    totalDiscountG,
    addressId,
    userId,
    customerName,
    email,
    paymentType,
    itemTotal,
    deliveryCost,
    calculatedPickUpDiscountL,
    flatDiscount,
    calCouponDiscount,
    couponCode,
    couponDiscountPercentL,
    pickUpDiscountPercentL,
    noOffers,
    cartData,
  } = purchaseData;



let cartWithTax: CartItemWithTax[] = [];
let totalTax = 0;

const cartItems: CartItem[] = convertProductsToCartItems(cartData);

// if (TAX_IMPLEMENT) {
//   const taxResult = await calculateTaxForCart(cartItems);

//   totalTax = taxResult.totalTax;
//   cartWithTax = taxResult.products;
//   console.log("totaltax------------------",totalTax)
//   console.log("cartWithTax------------------",cartWithTax)
//  } else {
//   console.log("TAX DISABLED :: Skipping tax calculation");
// }

let totalExclusiveTax = 0;

if (TAX_IMPLEMENT) {
  const taxResult = await calculateTaxForCart(cartItems);
  cartWithTax = taxResult.products;

  // Compute tax only for exclusive items
  totalExclusiveTax = cartWithTax
    .filter((item) => item.taxType === "exclusive")
    .reduce((sum, item) => sum + item.taxTotal, 0);

  totalTax = taxResult.totalTax; // keep this for reporting
 }
const finalGrandTotal = endTotalG + totalExclusiveTax;
  // Step 1: Check stock before order
   
  if (SHOULD_MAINTAIN_STOCK) {
  const stockCheck = await checkStockAvailability(cartData);

  if (!stockCheck.success) {
    return { success: false, message: stockCheck.message };
  }
}

  const nowUTC = new Date().toISOString(); // UTC ISO string (e.g. "2025-07-24T06:07:32.123Z")

  const nowGerman = new Date().toLocaleString("en-DE", {
    dateStyle: "medium",
    timeStyle: "medium",
    timeZone: "Europe/Berlin",
  });

  // Get latest srno
  const collectionRef = adminDb.collection("orderMaster");
  const snapshot = await collectionRef.orderBy("srno", "desc").limit(1).get();

  let new_srno = 1;
  if (!snapshot.empty) {
    const latest = snapshot.docs[0].data() as orderMasterDataT;
    new_srno = (latest?.srno || 0) + 1;
  }

  const status = paymentType === "cod" ? "Completed" : "Payment Pending";

  const orderMasterData = {
    customerName,
    email,
    userId,
    addressId,
    itemTotal,
    endTotalG,
    deliveryCost,
    calculatedPickUpDiscountL,
    flatDiscount,
    calCouponDiscount,
    couponCode,
    couponDiscountPercentL,
    pickUpDiscountPercentL,
    paymentType,
    status,
    totalDiscountG,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    createdAtUTC: nowUTC, // ISO string, cross-compatible
    time: nowGerman,
    srno: new_srno,
    totalTax, //::::::::::::::: addtion cartWithTax also add tax record 11/26/2025
    finalGrandTotal
  } as orderMasterDataT;

 
  // Add to orderMaster collection
  const orderMasterId = await addOrderToMaster(orderMasterData);

  // Add each product to orderProducts ::::::::::::::: addtion cartWithTax also add tax record 11/26/2025
 // for (const product of cartData) {
 for (const product of cartWithTax) {
    await addProductDraft(product, userId!, orderMasterId!);
  }

  // Save marketing data
  await marketingData({
    name: customerName,
    userId,
    addressId,
    email,
    noOfferEmails: noOffers,
  });

  // Optional: mark email as unsubscribed in campaign list
  if (noOffers) {
    const normalizedEmail = email.toLowerCase();
    const ref = adminDb.collection("campaignEmailListFinal");
    const existing = await ref.where("email", "==", normalizedEmail).get();

    if (!existing.empty) {
      await existing.docs[0].ref.update({
        unsubscribed: true,
        source: "app",
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await ref.add({
        email: normalizedEmail,
        unsubscribed: true,
        source: "app",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  }

  // return orderMasterId;
  return { success: true, message: "Order created", orderId: orderMasterId };
}

/**
 * Save or update customer info in Firestore
 * @param name - Customer's full name
 * @param userId - Unique customer ID
 * @param email - Customer email address
 * @param marketingConsent - Boolean (true if allowed to send marketing)
 */

export async function marketingData({
  name,
  userId,
  addressId,
  email,
  noOfferEmails,
}: {
  name: string;
  userId: string | undefined;
  addressId: string;
  email: string;
  noOfferEmails: boolean;
}) {
 

  // Get current German time
  // const now = new Date();
  // const germanDateStr = now.toLocaleString("en-DE", {
  //   timeZone: "Europe/Berlin",
  // });
  // const germanDate = new Date(germanDateStr);

  const docRef = adminDb.collection("customerRecentOrder").doc(userId!);

  await docRef.set(
    {
      name,
      email,
      userId,
      addressId,
      noOfferEmails,
      lastOrderDate: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
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

export async function addProductDraft(
  element: CartItemWithTax,
  userAddedId: string,
  orderMasterId: string
) {
  const product = {
    id: element.id,
    name: element.name,
    price: element.price,
    quantity: element.quantity,
    orderMasterId,
    userId: userAddedId,
     taxAmount: element.taxAmount,   // per one item
  taxTotal: element.taxTotal,    // tax * quantity
  finalPrice: element.finalPrice,  // price + tax
  finalTotal: element.finalTotal,  // finalPrice * quantity
  };

 
  

  try {
    const docRef = await adminDb.collection("orderProducts").add(product);
    console.log("Purchased product document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function addOrderToMaster(element: orderMasterDataT) {
  try {
    const docRef = await adminDb.collection("orderMaster").add(element);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    return null;
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
    const formattedDate = date?.toLocaleString("en-GB", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    //     const dateObj =
    //     typeof data.createdAt === "object" && data.createdAt?.toDate
    //     ? data.createdAt.toDate()
    //     : data.createdAt
    //     ? new Date(data.createdAt)
    //     : null;
    // const createdAtISO = dateObj?.toISOString() || data.createdAtUTC || "";

    return {
      id: doc.id,
      customerName: data.customerName || "",
      email: data.email || "",
      paymentType: data.paymentType || "",
      status: data.status || "",
      couponCode: data.couponCode || "",
      userId: data.userId || "",
      addressId: data.addressId || "",
      endTotalG: data.endTotalG || 0,
      itemTotal: data.itemTotal || 0,
      totalDiscountG: data.totalDiscountG || 0,
      flatDiscount: data.flatDiscount || 0,
      srno: data.srno || 0,
      timeId: data.timeId || "",
      deliveryCost: data.deliveryCost || 0,
      calculatedPickUpDiscountL: data.calculatedPickUpDiscountL || 0,
      calCouponDiscount: data.calCouponDiscount || 0,
      couponDiscountPercentL: data.couponDiscountPercentL || 0,
      pickUpDiscountPercentL: data.pickUpDiscountPercentL || 0,
      createdAt: data.createdAt?.toDate?.().toISOString() || "",
      totalTax: data.totalTax || 0,
      createdAtUTC: data.createdAtUTC || "", // ✅ Add support
      time: data.time || "",
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

  // const createdAtStr =
  //   raw.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString();

  const createdAtStr =
    raw.createdAt instanceof Timestamp
      ? raw.createdAt.toDate().toISOString()
      : new Date().toISOString();

  return {
    ...raw,
    createdAt: createdAtStr,
    id: docSnap.id,
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
    data.push(doc.data() as OrderProductT);
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

Also updates product status → "out_of_stock" when stockQty = 0.

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
      const currentStock = product.stockQty ?? 0;
      const quantityOrdered = item.quantity ?? 0;

      // ✅ Check stock
      if (currentStock < quantityOrdered) {
        insufficientStock.push(`${product.name} (only ${currentStock} left)`);
        continue;
      }

      const newStock = currentStock - quantityOrdered;

      // ✅ Add to batch
      batch.update(productRef, {
        stockQty: newStock,
        status: newStock === 0 ? "out_of_stock" : product.status,
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
    console.log("✅ Stock updated successfully for order:", orderMasterId);
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
      const productId = orderItem.id; // ✅ Firestore document ID of the product
      const orderQty = orderItem.quantity ?? 0;

      if (!productId || orderQty <= 0) continue;

      const productRef = adminDb.collection("products").doc(productId);
      const productSnap = await productRef.get();

      if (!productSnap.exists) {
        console.warn(`⚠️ Product ${productId} not found in Firestore`);
        continue;
      }

      const productData = productSnap.data();
      const currentStock = productData?.stockQty ?? 0;
      const newStock = Math.max(currentStock - orderQty, 0);

      batch.update(productRef, {
        stockQty: newStock,
        status:
          newStock === 0 ? "out_of_stock" : productData?.status ?? "published",
      });

      console.log(
        `✅ ${productData?.name ?? productId}: ${currentStock} → ${newStock}`
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

// const ORDERS_PER_PAGE = 10;

// export async function fetchOrdersMaster1(cursorId: string | null = null) {
//   const collectionRef = collection(adminDb, "orderMaster");

//   let q;
//   if (cursorId) {
//     const cursorDoc = await getDoc(doc(collectionRef, cursorId));
//     if (cursorDoc.exists()) {
//       q = query(
//         collectionRef,
//         orderBy("createdAt", "desc"),
//         startAfter(cursorDoc),
//         limit(ORDERS_PER_PAGE)
//       );
//     } else {
//       throw new Error("Cursor document not found");
//     }
//   } else {
//     q = query(collectionRef, orderBy("createdAt", "desc"), limit(ORDERS_PER_PAGE));
//   }

//   const snapshot = await getDocs(q);

//   const orders: orderMasterDataT[] = snapshot.docs.map((doc) => {
//     const data = doc.data();
//     const date = data.createdAt?.toDate?.();
//     const formattedDate = date?.toLocaleString("en-GB", {
//       year: "numeric",
//       month: "long",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//     });

//     return {
//       id: doc.id,
//       customerName: data.customerName || "",
//       email: data.email || "",
//       paymentType: data.paymentType || "",
//       status: data.status || "",
//       time: formattedDate || "",
//       couponCode: data.couponCode || "",
//       userId: data.userId || "",
//       addressId: data.addressId || "",
//       endTotalG: data.endTotalG || 0,
//       itemTotal: data.itemTotal || 0,
//       totalDiscountG: data.totalDiscountG || 0,
//       flatDiscount: data.flatDiscount || 0,
//       srno: data.srno || 0,
//       timeId: data.timeId || "",
//       deliveryCost: data.deliveryCost || 0,
//       calculatedPickUpDiscountL: data.calculatedPickUpDiscountL || 0,
//       calCouponDiscount: data.calCouponDiscount || 0,
//       couponDiscountPercentL: data.couponDiscountPercentL || 0,
//       pickUpDiscountPercentL: data.pickUpDiscountPercentL || 0,
//       createdAt: data.createdAt,
//     } as orderMasterDataT;
//   });

//   return {
//     orders,
//     firstDocId: snapshot.docs[0]?.id || null,
//     lastDocId: snapshot.docs[snapshot.docs.length - 1]?.id || null,
//   };
// }

// export async function addOrder(element) {
//   try {
//     const docRef = await addDoc(collection(adminDb, "orderProducts"), element);
//     console.log("Document written with ID: ", docRef.id);
//     // Clear the form
//   } catch (e) {
//     console.error("Error adding document: ", e);
//   }
// }

// export async function fetchOrders(){

//  // const result = await db.select().from(product);
//   const result = await getDocs(collection(adminDb, "product"))
// //  console.log(result.docs)

// let data;
// data = [];
//   result.forEach((doc) => {
//     data.push({id:doc.id, ...doc.data()});
//   });
//  // console.log(data)
//   return data;
// }

// export async function fetchOrdersPaginated1({ afterId, pageSize = 10 }: FetchOrdersOptions) {
//   const collectionRef = collection(adminDb, 'orderMaster');
//   let q;

//   if (afterId) {
//     const docRef = await getDoc(doc(adminDb, 'orderMaster', afterId));
//     q = query(collectionRef, orderBy('createdAt', 'desc'), startAfter(docRef), limit(pageSize));
//   } else {
//     q = query(collectionRef, orderBy('createdAt', 'desc'), limit(pageSize));
//   }

//   const snapshot = await getDocs(q);

//   const orders = snapshot.docs.map((doc) => {

//     const data = doc.data();
//     const date = data.createdAt?.toDate?.();
//     const formattedDate = date?.toLocaleString('en-GB', {
//       year: 'numeric',
//       month: 'long',
//       day: '2-digit',
//       hour: '2-digit',
//       minute: '2-digit',
//     });

//     return {
//       id: doc.id,
//       customerName: data.customerName || '',
//       email: data.email || '',
//       paymentType: data.paymentType || '',
//       status: data.status || '',
//       time: data.time || '',
//       couponCode: data.couponCode || '',
//       userId: data.userId || '',
//       addressId: data.addressId || '',
//       endTotalG: data.endTotalG || 0,
//       itemTotal: data.itemTotal || 0,
//       totalDiscountG: data.totalDiscountG || 0,
//       flatDiscount: data.flatDiscount || 0,
//       srno: data.srno || 0,
//       timeId: data.timeId || '',
//       deliveryCost: data.deliveryCost || 0,
//       calculatedPickUpDiscountL: data.calculatedPickUpDiscountL || 0,
//       calCouponDiscount: data.calCouponDiscount || 0,
//       couponDiscountPercentL: data.couponDiscountPercentL || 0,
//       pickUpDiscountPercentL: data.pickUpDiscountPercentL || 0,
//       createdAt: data.createdAt?.toDate?.().toISOString() || '',
//     } as orderMasterDataT;
//   });

//   const lastDoc = snapshot.docs[snapshot.docs.length - 1];
//   return { orders, lastId: lastDoc?.id || null };
// }

// export async function fetchOrdersMaster(): Promise<orderMasterDataT[]> {
//   const data = [] as orderMasterDataT[];
//   //  const q = query(collection(adminadminDb, "orderMaster"));
//   //  const querySnapshot = await getDocs(q);

//   const collectionRef = collection(adminadminDb, "orderMaster");

//   const targetQuery = query(collectionRef, orderBy("srno", "desc"), limit(20));
//   const querySnapshot = await getDocs(targetQuery);

//   querySnapshot.forEach((doc) => {
//     const pData = { id: doc.id, ...doc.data() } as orderMasterDataT;
//     data.push(pData);
//   });
//   return data;
// }
