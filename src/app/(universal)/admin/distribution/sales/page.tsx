import Link from 'next/link';

export default function Page() {
  const cards = [
    {
      title: 'Sales by Customer',
      description:
        'View customer-wise sales and product movement.',
      href: '/admin/distribution/sales/reports/customer',
    },
    {
      title: 'Sales by Truck',
      description:
        'View truck-wise sales and route performance.',
      href: '/admin/distribution/sales/reports/trucks',
    },
    {
      title: 'All Stock Transactions',
      description:
        'View complete stock movement history across all locations.',
      href: '/admin/distribution/sales/reports/stock-transactions',
    },
  ];

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-3xl font-bold'>
          Sales & Stock Reports
        </h1>
        <p className='mt-2 text-gray-600'>
          Choose a report to view detailed sales and stock movement information.
        </p>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className='group rounded-2xl border bg-white p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md'
          >
            <div className='flex h-full flex-col justify-between'>
              <div>
                <h2 className='text-lg font-semibold text-gray-900 group-hover:text-blue-700'>
                  {card.title}
                </h2>

                <p className='mt-2 text-sm text-gray-600'>
                  {card.description}
                </p>
              </div>

              <div className='mt-6 inline-flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700'>
                Open report
                <span className='ml-1 transition group-hover:translate-x-1'>
                  →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}