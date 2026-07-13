"use server"
/// app/(dashboard)/department-stock/[id]/page.tsx

 
import { getDepartmentStock } from "@/app/(universal)/action/production/departments/getDepartmentStock";
import DepartmentStockTable from "./DepartmentStockTable";
import { getDepartmentById } from "@/app/(universal)/action/production/departments/getDepartmentById";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function DepartmentStockPage({
  params,
}: Props) {
  const { id } = await params;

 
const department = await getDepartmentById(id);
  const stock = await getDepartmentStock(id);
 

  return (
    <DepartmentStockTable data={stock} 
     departmentName={department!.name}
    />
  );
}