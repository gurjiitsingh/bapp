'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { settingSchemaType } from '@/lib/types/settingType';
import { addNewsetting } from '@/app/(universal)/action/setting/dbOperations';
import { createTempDir } from '@/app/(universal)/action/setting/createDir';
import InitialCurrencyLocaleSetup from '../components/InitialCurrencyLocaleSetup';

const DEFAULT_SETTINGS: settingSchemaType[] = [
  { name: 'home_page_offer', value: ' ' },
  { name: 'offer_instruction', value: ' ' },
];

export default function Page() {
  const router = useRouter();
  const [initialized, setInitialized] = useState(false);
  const [folderMsg, setFolderMsg] = useState('');
  const [installMsg, setInstallMsg] = useState('');

  async function handleInstallDefaults() {
    for (const setting of DEFAULT_SETTINGS) {
      const formData = new FormData();
      formData.append('name', setting.name);
      formData.append('value', setting.value!);
      await addNewsetting(formData);
    }
    setInitialized(true);
    setInstallMsg('✅ Default settings installed successfully.');
  }

  async function handleCreateFolder() {
    const result = await createTempDir();
    setFolderMsg(result.message);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#00897b]">Initial Setup</h1>
        <button
          onClick={() => router.push('/admin/setting/')}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        >
          ← Back
        </button>
      </div>

      {/* Currency + Locale Setup */}
      <InitialCurrencyLocaleSetup />

      {/* Install Default Settings */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-[#00897b] mb-4">Install Default Settings</h2>
        <button
          onClick={handleInstallDefaults}
          className="bg-amber-500 text-white px-5 py-2 rounded hover:bg-amber-600 transition"
        >
          Install Settings
        </button>
        {installMsg && (
          <p className="mt-3 text-green-600 font-medium">{installMsg}</p>
        )}
      </div>

      {/* Create Temp Folder */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-[#00897b] mb-4">Create Temp Folder</h2>
        <button
          onClick={handleCreateFolder}
          className="bg-amber-500 text-white px-5 py-2 rounded hover:bg-amber-600 transition"
        >
          Create Folder
        </button>
        {folderMsg && (
          <p className="mt-3 text-green-600 font-medium">{folderMsg}</p>
        )}
      </div>
    </div>
  );
}
