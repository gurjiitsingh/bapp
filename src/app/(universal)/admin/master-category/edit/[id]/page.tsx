// app/admin/master-category/edit/[id]/page.tsx

import { getMasterCategoryById } from "@/app/(universal)/action/master-category/getMasterCategoryByI";
import { notFound } from "next/navigation";
import EditForm from "../../components/EditForm";





export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const category =
    await getMasterCategoryById(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="p-5">
      <EditForm
        category={category}
      />
    </div>
  );
}