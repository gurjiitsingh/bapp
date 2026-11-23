import { fetchProductRecipes } from "@/app/(universal)/action/productRecipes/dbOperations";
import ListView from "./ListView";


export default async function Page() {
  const recipes =
    await fetchProductRecipes();

  return (
    <ListView
      recipes={recipes}
    />
  );
}