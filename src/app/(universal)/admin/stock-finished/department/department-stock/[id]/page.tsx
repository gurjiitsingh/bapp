"use server"
/// app/(dashboard)/department-stock/[id]/page.tsx

 
import { getDepartmentStock } from "@/app/(universal)/action/production/departments/getDepartmentStock";
import DepartmentStockTable from "./DepartmentStockTable";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DepartmentStockPage({
  params,
}: Props) {
  const { id } = await params;

  console.log(id);

  const stock = await getDepartmentStock(id);
 

  return (
    <DepartmentStockTable data={stock} />
  );
}