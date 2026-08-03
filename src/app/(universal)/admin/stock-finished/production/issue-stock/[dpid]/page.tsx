import { getDepartmentById } from '@/app/(universal)/action/department/getDepartmentById';
import { fetchInventoryItems } from '@/app/(universal)/action/inventory/fetchInventoryItems';
import StockIssueForm from './StockIssueForm';

type Props = {
  params: Promise<{
    dpid: string;
  }>;
};

export default async function Page({
  params,
}: Props) {

  const { dpid } = await params;

  console.log('dpid------------------------', dpid);

  const departmentRaw =
    await getDepartmentById(dpid);
    console.log("departm-----------------------",departmentRaw)

  const inventoryItemsRaw =
    await fetchInventoryItems();

  const departments = departmentRaw
    ? [{
        id: departmentRaw.id,
        name: departmentRaw.name,
        employeeCount:
          departmentRaw.employeeCount,
      }]
    : [];

  const inventoryItems =
    (inventoryItemsRaw || []).map((i: any) => ({
      id: i.id,
      name: i.name || '',
      sku: i.sku || '',
      barcode: i.barcode || '',
      consumptionUnit:
        i.consumptionUnit || 'gm',
      purchaseMappings:
        i.purchaseMappings || [],
      purchaseUnit:
        i.purchaseUnit || 'gm',
      purchaseUnitCost:
        i.purchaseUnitCost || 0,
      conversionFactor:
        i.conversionFactor || 1,
      currentStock:
        Number(i.currentStock) || 0,
      minStock:
        Number(i.minStock) || 0,
      averageCost:
        Number(i.averageCost) || 0,
      stockValue:
        Number(i.stockValue) || 0,
      sellingPrice:
        Number(i.sellingPrice) || 0,
      categoryId:
        i.categoryId || '',
      supplierId:
        i.supplierId || '',
      supplierIds:
        i.supplierIds || [],
      isActive:
        i.isActive ?? true,
      createdAt:
        i.createdAt || null,
      updatedAt:
        i.updatedAt || null,
    }));

  return (
    <StockIssueForm
      departments={departments}
      inventoryItems={inventoryItems}
      defaultDepartmentId={dpid}
    />
  );
}