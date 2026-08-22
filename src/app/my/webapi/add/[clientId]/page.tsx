import WebApiForm from "./WebApiForm";

 

export default async function AddWebApiPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  return (
    <div className="p-6">
      <WebApiForm clientId={clientId} />
    </div>
  );
}