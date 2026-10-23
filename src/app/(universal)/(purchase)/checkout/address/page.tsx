import { redirect } from "next/navigation";
import { auth } from "@/auth";
import CheckoutAddressForm from "./CheckoutAddressForm";
 

type PageProps = {
  searchParams: Promise<{
    edit?: string;
    returnTo?: string;
  }>;
};

export default async function CheckoutAddressPage({
  searchParams,
}: PageProps) {
  const session = await auth();
  const params = await searchParams;

  // Only logged-in customer accounts can manage saved addresses.
  if (session?.user?.role !== "user" || !session.user.id) {
    redirect("/checkout");
  }

  // Restrict the return destination to the checkout route.
  const returnTo =
    params.returnTo === "/checkout" ? "/checkout" : "/checkout";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <CheckoutAddressForm
        editId={params.edit ?? null}
        returnTo={returnTo}
        userId={session.user.id}
      />
    </main>
  );
}