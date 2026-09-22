import { OrderExportProductT } from "./OrderExportProductT";
import { OrderExportMasterT } from "./orderExportType";

export type OrderBackupExportT = {
  exportVersion: number;

  exportType: "ORDER_BACKUP";

  generatedAt: string;

  dateRange: {
    from: string;
    to: string;
  };

  summary: {
    orderCount: number;
    itemCount: number;
    itemTotal: number;
    discountTotal: number;
    taxTotal: number;
    deliveryFee: number;
    grandTotal: number;
  };

  orders: OrderExportMasterT[];

  orderItems: OrderExportProductT[];
};