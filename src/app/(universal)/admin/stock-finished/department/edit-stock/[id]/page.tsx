import { getDepartmentStockItemByDocId } from "@/app/(universal)/action/production/departments/getDepartmentStockItemByDocId";
import { notFound } from "next/navigation";
import EditDepartmentStockForm from "./EditDepartmentStockForm";



type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({
  params,
}: Props) {
  const { id } = await params;

  const stock = await getDepartmentStockItemByDocId(id);

  if (!stock) {
    notFound();
  }

  return (
    <div className="p-6">
      <EditDepartmentStockForm
        stock={stock}
      />
    </div>
  );
}