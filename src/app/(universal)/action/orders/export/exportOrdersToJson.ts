"use server";

import { adminDb } from "@/lib/firebaseAdmin";

import { OrderBackupExportT } from "@/lib/types/orders/OrderBackupExportT";
import { OrderExportProductT } from "@/lib/types/orders/OrderExportProductT";
import { OrderExportMasterT } from "@/lib/types/orders/orderExportType";
 

export type OrderExportSource =
  | "ALL"
  | "POS"
  | "WEB"
  | "APP";

type ExportOrdersResult =
  | {
      success: true;
      fileName: string;
      data: string;
      summary: OrderBackupExportT["summary"];
    }
  | {
      success: false;
      error: string;
    };

/* ============================================================
   HELPERS
============================================================ */

function timestampToISOString(
  value: unknown
): string | undefined {
  if (!value) {
    return undefined;
  }

  // Firestore Timestamp
  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (
      value as {
        toDate?: unknown;
      }
    ).toDate === "function"
  ) {
    return (
      value as {
        toDate: () => Date;
      }
    )
      .toDate()
      .toISOString();
  }

  // JavaScript Date
  if (value instanceof Date) {
    return value.toISOString();
  }

  // Already a string
  if (typeof value === "string") {
    return value;
  }

  return undefined;
}

function normalizeDateOnly(
  value: string
): string {
  const trimmed = value.trim();

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(
      trimmed
    )
  ) {
    throw new Error(
      `Invalid date: ${value}. Expected YYYY-MM-DD.`
    );
  }

  const date = new Date(
    `${trimmed}T00:00:00.000Z`
  );

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `Invalid date: ${value}.`
    );
  }

  return trimmed;
}

function chunkArray<T>(
  items: T[],
  size: number
): T[][] {
  const chunks: T[][] = [];

  for (
    let i = 0;
    i < items.length;
    i += size
  ) {
    chunks.push(
      items.slice(i, i + size)
    );
  }

  return chunks;
}

/* ============================================================
   EXPORT ORDERS
============================================================ */

export async function exportOrdersToJson({
  from,
  to,
  source = "ALL",
}: {
  from: string;
  to: string;
  source?: OrderExportSource;
}): Promise<ExportOrdersResult> {
  try {
    /* ========================================================
       VALIDATE
    ======================================================== */

    if (!from || !to) {
      return {
        success: false,
        error:
          "Both from date and to date are required.",
      };
    }

    const fromDateOnly =
      normalizeDateOnly(from);

    const toDateOnly =
      normalizeDateOnly(to);

    if (
      fromDateOnly >
      toDateOnly
    ) {
      return {
        success: false,
        error:
          "From date cannot be greater than to date.",
      };
    }

    if (
      ![
        "ALL",
        "POS",
        "WEB",
        "APP",
      ].includes(source)
    ) {
      return {
        success: false,
        error:
          "Invalid order source.",
      };
    }

    /* ========================================================
       DATE RANGE

       createdAt is the ONLY date field used.

       createdAtUTC is intentionally NOT used.
    ======================================================== */

    const startDate = new Date(
      `${fromDateOnly}T00:00:00.000Z`
    );

    const endDate = new Date(
      `${toDateOnly}T00:00:00.000Z`
    );

    endDate.setUTCDate(
      endDate.getUTCDate() + 1
    );

    /* ========================================================
       ORDER MASTER QUERY
    ======================================================== */

    let orderQuery =
      adminDb
        .collection("orderMaster")
        .where(
          "createdAt",
          ">=",
          startDate
        )
        .where(
          "createdAt",
          "<",
          endDate
        );

    /*
      IMPORTANT:

      "ALL" means we do NOT add a source
      filter.

      POS / WEB / APP add the source filter.
    */

    if (source !== "ALL") {
      orderQuery =
        orderQuery.where(
          "source",
          "==",
          source
        );
    }

    const orderSnapshot =
      await orderQuery
        .orderBy(
          "createdAt",
          "asc"
        )
        .get();

    /* ========================================================
       NO ORDERS
    ======================================================== */

    if (orderSnapshot.empty) {
      const emptyExport: OrderBackupExportT =
        {
          exportVersion: 1,

          exportType:
            "ORDER_BACKUP",

          generatedAt:
            new Date().toISOString(),

          dateRange: {
            from: fromDateOnly,
            to: toDateOnly,
          },

          summary: {
            orderCount: 0,
            itemCount: 0,
            itemTotal: 0,
            discountTotal: 0,
            taxTotal: 0,
            deliveryFee: 0,
            grandTotal: 0,
          },

          orders: [],

          orderItems: [],
        };

      const fileName =
        `orders-backup-${fromDateOnly}-to-${toDateOnly}.json`;

      return {
        success: true,
        fileName,
        data: JSON.stringify(
          emptyExport,
          null,
          2
        ),
        summary:
          emptyExport.summary,
      };
    }

    /* ========================================================
       BUILD ORDER MASTER DATA
    ======================================================== */

    const orders: OrderExportMasterT[] =
      orderSnapshot.docs.map(
        (doc) => {
          const raw =
            doc.data();

          const order: OrderExportMasterT =
            {
              /* ----------------------------------------------
                 OWNERSHIP
              ---------------------------------------------- */

              ownerId:
                String(
                  raw.ownerId ?? ""
                ),

              outletId:
                String(
                  raw.outletId ?? ""
                ),

              /* ----------------------------------------------
                 IDENTIFIERS
              ---------------------------------------------- */

              id: doc.id,

              srno:
                String(
                  raw.srno ?? ""
                ),

              /* ----------------------------------------------
                 CUSTOMER
              ---------------------------------------------- */

              customerId:
                raw.customerId != null
                  ? String(
                      raw.customerId
                    )
                  : undefined,

              customerName:
                raw.customerName != null
                  ? String(
                      raw.customerName
                    )
                  : undefined,

              customerPhone:
                raw.customerPhone != null
                  ? String(
                      raw.customerPhone
                    )
                  : undefined,

              customerCountryCode:
                raw.customerCountryCode !=
                null
                  ? String(
                      raw.customerCountryCode
                    )
                  : undefined,

              email:
                raw.email != null
                  ? String(
                      raw.email
                    )
                  : undefined,

              addressId:
                raw.addressId != null
                  ? String(
                      raw.addressId
                    )
                  : undefined,

              /* ----------------------------------------------
                 DELIVERY ADDRESS SNAPSHOT
              ---------------------------------------------- */

              dAddressLine1:
                raw.dAddressLine1 != null
                  ? String(
                      raw.dAddressLine1
                    )
                  : undefined,

              dAddressLine2:
                raw.dAddressLine2 != null
                  ? String(
                      raw.dAddressLine2
                    )
                  : undefined,

              dCity:
                raw.dCity != null
                  ? String(
                      raw.dCity
                    )
                  : undefined,

              dState:
                raw.dState != null
                  ? String(
                      raw.dState
                    )
                  : undefined,

              dZipcode:
                raw.dZipcode != null
                  ? String(
                      raw.dZipcode
                    )
                  : undefined,

              dLandmark:
                raw.dLandmark != null
                  ? String(
                      raw.dLandmark
                    )
                  : undefined,

              /* ----------------------------------------------
                 ORDER
              ---------------------------------------------- */

              orderType:
                raw.orderType,

              tableNo:
                raw.tableNo != null
                  ? String(
                      raw.tableNo
                    )
                  : null,

              /* ----------------------------------------------
                 TIMESTAMPS
              ---------------------------------------------- */

              createdAt:
                timestampToISOString(
                  raw.createdAt
                ) ?? "",

              updatedAt:
                timestampToISOString(
                  raw.updatedAt
                ),

              closedAt:
                raw.closedAt === null
                  ? null
                  : timestampToISOString(
                      raw.closedAt
                    ),

              isScheduled:
                Boolean(
                  raw.isScheduled ??
                    false
                ),

              scheduledAt:
                raw.scheduledAt === null
                  ? null
                  : timestampToISOString(
                      raw.scheduledAt
                    ),

              /* ----------------------------------------------
                 AMOUNTS
              ---------------------------------------------- */

              itemTotal:
                Number(
                  raw.itemTotal ?? 0
                ),

              discountTotal:
                raw.discountTotal !=
                null
                  ? Number(
                      raw.discountTotal
                    )
                  : undefined,

              subTotal:
                raw.subTotal !=
                null
                  ? Number(
                      raw.subTotal
                    )
                  : undefined,

              taxBeforeDiscount:
                raw.taxBeforeDiscount !=
                null
                  ? Number(
                      raw.taxBeforeDiscount
                    )
                  : undefined,

              taxTotal:
                raw.taxTotal !=
                null
                  ? Number(
                      raw.taxTotal
                    )
                  : undefined,

              deliveryFee:
                raw.deliveryFee !=
                null
                  ? Number(
                      raw.deliveryFee
                    )
                  : undefined,

              grandTotal:
                raw.grandTotal !=
                null
                  ? Number(
                      raw.grandTotal
                    )
                  : undefined,

              /* ----------------------------------------------
                 PAYMENT

                 Your existing order fetch supports both:
                 paymentType and paymentMode.
              ---------------------------------------------- */

              paymentMode:
                raw.paymentType ??
                raw.paymentMode ??
                "",

              paymentProvider:
                raw.paymentProvider !=
                null
                  ? String(
                      raw.paymentProvider
                    )
                  : undefined,

              paymentMethod:
                raw.paymentMethod !=
                null
                  ? String(
                      raw.paymentMethod
                    )
                  : undefined,

              paymentStatus:
                raw.paymentStatus ??
                "NEW",

              paidAmount:
                raw.paidAmount !=
                null
                  ? Number(
                      raw.paidAmount
                    )
                  : undefined,

              dueAmount:
                raw.dueAmount !=
                null
                  ? Number(
                      raw.dueAmount
                    )
                  : undefined,

              /* ----------------------------------------------
                 ORDER STATE
              ---------------------------------------------- */

              orderStatus:
                raw.orderStatus ??
                raw.publishStatus ??
                "NEW",

              /* ----------------------------------------------
                 SOURCE / META
              ---------------------------------------------- */

              source:
                raw.source,

              staffId:
                raw.staffId !==
                undefined
                  ? raw.staffId
                    ? String(
                        raw.staffId
                      )
                    : null
                  : undefined,

              productsCount:
                raw.productsCount !=
                null
                  ? Number(
                      raw.productsCount
                    )
                  : undefined,

              notes:
                raw.notes != null
                  ? String(
                      raw.notes
                    )
                  : undefined,

              /* ----------------------------------------------
                 SYNC
              ---------------------------------------------- */

              syncStatus:
                raw.syncStatus,

              lastSyncedAt:
                timestampToISOString(
                  raw.lastSyncedAt
                ),

              /* ----------------------------------------------
                 AUTOMATION
              ---------------------------------------------- */

              printed:
                raw.printed !==
                undefined
                  ? Boolean(
                      raw.printed
                    )
                  : undefined,

              acknowledged:
                raw.acknowledged !==
                undefined
                  ? Boolean(
                      raw.acknowledged
                    )
                  : undefined,

              /* ----------------------------------------------
                 LEGACY
              ---------------------------------------------- */

              couponCode:
                raw.couponCode !=
                null
                  ? String(
                      raw.couponCode
                    )
                  : undefined,

              couponFlat:
                raw.couponFlat !=
                null
                  ? Number(
                      raw.couponFlat
                    )
                  : undefined,

              pickUpDiscount:
                raw.pickUpDiscount !=
                null
                  ? Number(
                      raw.pickUpDiscount
                    )
                  : undefined,

              couponPercent:
                raw.couponPercent !=
                null
                  ? Number(
                      raw.couponPercent
                    )
                  : undefined,
            };

          return order;
        }
      );

    /* ========================================================
       FETCH ORDER PRODUCTS

       Instead of one query per order, fetch in batches.

       Firestore "in" queries are limited, so use chunks.
    ======================================================== */

    const orderIds =
      orders.map(
        (order) => order.id
      );

    const orderIdChunks =
      chunkArray(
        orderIds,
        30
      );

    const orderItems: OrderExportProductT[] =
      [];

    for (
      const orderIdChunk of orderIdChunks
    ) {
      if (
        orderIdChunk.length === 0
      ) {
        continue;
      }

      const itemSnapshot =
        await adminDb
          .collection(
            "orderProducts"
          )
          .where(
            "orderMasterId",
            "in",
            orderIdChunk
          )
          .get();

      for (
        const itemDoc of itemSnapshot.docs
      ) {
        const raw =
          itemDoc.data();

        const item: OrderExportProductT =
          {
            /* ----------------------------------------------
               IDENTIFIERS
            ---------------------------------------------- */

            id:
              itemDoc.id,

            productId:
              String(
                raw.productId ??
                  raw.id ??
                  ""
              ),

            orderMasterId:
              String(
                raw.orderMasterId ??
                  ""
              ),

            /* ----------------------------------------------
               PRODUCT
            ---------------------------------------------- */

            name:
              String(
                raw.name ?? ""
              ),

            /*
              IMPORTANT:
              Your actual existing fetch function
              uses "price", not "basePrice".
            */

            basePrice:
              raw.price != null
                ? Number(
                    raw.price
                  )
                : 0,

            quantity:
              Number(
                raw.quantity ?? 0
              ),

            /* ----------------------------------------------
               TOTALS
            ---------------------------------------------- */

            itemSubtotal:
              Number(
                raw.itemSubtotal ??
                  0
              ),

            taxRate:
              Number(
                raw.taxRate ?? 0
              ),

            taxType:
              raw.taxType ===
              "inclusive"
                ? "inclusive"
                : "exclusive",

            taxAmount:
              Number(
                raw.taxAmount ?? 0
              ),

            taxTotal:
              Number(
                raw.taxTotal ?? 0
              ),

            finalPrice:
              Number(
                raw.finalPrice ?? 0
              ),

            finalTotal:
              Number(
                raw.finalTotal ?? 0
              ),

            /* ----------------------------------------------
               PRODUCT META
            ---------------------------------------------- */

            image:
              String(
                raw.image ?? ""
              ),

            categoryId:
              String(
                raw.categoryId ?? ""
              ),

            productCat:
              String(
                raw.productCat ?? ""
              ),

            purchaseSession:
              String(
                raw.purchaseSession ??
                  ""
              ),

            status:
              String(
                raw.status ?? ""
              ),

            userId:
              String(
                raw.userId ?? ""
              ),

            productDesc:
              raw.productDesc != null
                ? String(
                    raw.productDesc
                  )
                : undefined,

            modifiers:
              Array.isArray(
                raw.modifiers
              )
                ? raw.modifiers
                : [],

            note:
              raw.note != null
                ? String(
                    raw.note
                  )
                : undefined,

            /* ----------------------------------------------
               TIMESTAMPS

               Keep these because your existing
               OrderProductT contains them.
            ---------------------------------------------- */

            // createdAt:
            //   timestampToISOString(
            //     raw.createdAt
            //   ) ?? null,

            // orderDate:
            //   timestampToISOString(
            //     raw.orderDate
            //   ) ??
            //   (
            //     typeof raw.orderDate ===
            //     "string"
            //       ? raw.orderDate
            //       : null
            //   ),
          };

        orderItems.push(
          item
        );
      }
    }

    /* ========================================================
       SUMMARY
    ======================================================== */

    const summary =
      {
        orderCount:
          orders.length,

        itemCount:
          orderItems.length,

        itemTotal:
          orders.reduce(
            (
              total,
              order
            ) =>
              total +
              Number(
                order.itemTotal ??
                  0
              ),
            0
          ),

        discountTotal:
          orders.reduce(
            (
              total,
              order
            ) =>
              total +
              Number(
                order.discountTotal ??
                  0
              ),
            0
          ),

        taxTotal:
          orders.reduce(
            (
              total,
              order
            ) =>
              total +
              Number(
                order.taxTotal ??
                  0
              ),
            0
          ),

        deliveryFee:
          orders.reduce(
            (
              total,
              order
            ) =>
              total +
              Number(
                order.deliveryFee ??
                  0
              ),
            0
          ),

        grandTotal:
          orders.reduce(
            (
              total,
              order
            ) =>
              total +
              Number(
                order.grandTotal ??
                  0
              ),
            0
          ),
      };

    /* ========================================================
       FINAL BACKUP
    ======================================================== */

    const backup: OrderBackupExportT =
      {
        exportVersion: 1,

        exportType:
          "ORDER_BACKUP",

        generatedAt:
          new Date().toISOString(),

        dateRange: {
          from: fromDateOnly,
          to: toDateOnly,
        },

        summary,

        orders,

        orderItems,
      };

    /* ========================================================
       JSON
    ======================================================== */

    const data =
      JSON.stringify(
        backup,
        null,
        2
      );

    /* ========================================================
       FILE NAME
    ======================================================== */

    const sourceSuffix =
      source === "ALL"
        ? "all"
        : source.toLowerCase();

    const fileName =
      `orders-backup-${sourceSuffix}-${fromDateOnly}-to-${toDateOnly}.json`;

    /* ========================================================
       RETURN
    ======================================================== */

    return {
      success: true,
      fileName,
      data,
      summary,
    };
  } catch (error) {
    console.error(
      "exportOrdersToJson ERROR:",
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to export orders.",
    };
  }
}