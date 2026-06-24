import Link from "next/link";

const links = [
  {
    title: "Add Custom Item",
    description: "Create custom inventory items manually",
    href: "/admin/inventory/init/add-custom",
  },
  {
    title: "Add Pre Units",
    description: "Add predefined units (already configured)",
    href: "/admin/inventory/init/add-pre-units",
  },
  {
    title: "All Units",
    description: "View and manage all inventory units",
    href: "/admin/inventory/init/all-units",
  },
  {
    title: "Copy Stock",
    description: "Copy stock from another source",
    href: "/admin/inventory/init/copy-stock",
  },
];

export default function InitDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">
          Inventory Initialization
        </h1>
        <p className="text-sm text-zinc-500">
          Setup and manage initial inventory configurations
        </p>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {links.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className="
                h-full p-5 rounded-xl border border-zinc-200
                bg-white shadow-sm
                hover:shadow-md hover:border-blue-300
                transition cursor-pointer
              "
            >
              <h2 className="text-lg font-medium mb-2">
                {item.title}
              </h2>
              <p className="text-sm text-zinc-500">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}