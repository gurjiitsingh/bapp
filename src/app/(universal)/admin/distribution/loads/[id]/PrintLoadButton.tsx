'use client';

import { Printer } from 'lucide-react';

export default function PrintLoadButton({
  loadId,
}: {
  loadId: string;
}) {

  function handlePrint() {
    window.open(
      `/distribution/loads/${loadId}/print`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
    >
      <Printer size={16} />
      Print
    </button>
  );
}