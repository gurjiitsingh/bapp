// app/admin/categories/add/page.tsx

import { getMasterCategories } from "@/app/(universal)/action/master-category/getMasterCategories";
import Form from "./Form";

export default async function Page() {
  const masterCategories = await getMasterCategories();

  return <Form masterCategories={masterCategories} />;
}