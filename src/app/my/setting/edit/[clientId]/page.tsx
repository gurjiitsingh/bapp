"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getClientById,
  updateClient,
} from "../../action/client/dbOperations";

export default function EditClientPage() {
  const { clientId } = useParams();
  const router = useRouter();

  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadClient();
  }, []);

  const loadClient = async () => {
    const data = await getClientById(clientId as string);
    setClient(data);
    setLoading(false);
  };

  const handleChange = (field: string, value: any) => {
    setClient((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await updateClient(clientId as string, {
        status: client.status,
        renewDate: client.renewDate,
        warningDays: client.warningDays,
        maxWaiters: client.maxWaiters,
        maxPOS: client.maxPOS,
      });

      alert("✅ Client updated");
      router.push("/my/setting");
    } catch (e) {
      console.error(e);
      alert("❌ Update failed");
    } finally {
      setSaving(false);
    }
  };

 if (loading || !client) {
  return <div className="p-5">Loading...</div>;
}

  return (
    <div className="p-5 max-w-xl">
      <h1 className="text-xl font-semibold mb-4">Edit Client</h1>

      <div className="bg-white p-5 rounded-xl border flex flex-col gap-4">

        {/* 🔒 CLIENT ID */}
        <div>
          <label className="label-style">Client ID</label>
          <input
            value={client.clientId}
            disabled
            className="input-style bg-gray-100"
          />
        </div>

        {/* 🔒 CLIENT KEY */}
      
        <div className="flex flex-col gap-2">
  <label className="label-style">Client Key</label>

  <input
    value={client.clientKey}
    disabled
    className="input-style bg-gray-100 text-xs"
  />

  <button
    onClick={async () => {
      const confirm = window.confirm("Regenerate client key?");
      if (!confirm) return;

      const newKey = crypto.randomUUID();

      await updateClient(client.clientId, {
        clientKey: newKey,
      });

      alert("✅ New key generated");

      // update UI
      setClient((prev: any) => ({
        ...prev,
        clientKey: newKey,
      }));
    }}
    className="bg-red-500 text-white px-3 py-2 rounded text-sm"
  >
    🔑 Regenerate Key
  </button>
</div>

        {/* STATUS */}
        <div>
          <label className="label-style">Status</label>
          <select
            value={client.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="input-style"
          >
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>

        {/* RENEW DATE */}
        <div>
          <label className="label-style">Renew Date</label>
          <input
            type="date"
            value={client.renewDate?.split("T")[0]}
            onChange={(e) => handleChange("renewDate", e.target.value)}
            className="input-style"
          />
        </div>

        {/* WARNING DAYS */}
        <div>
          <label className="label-style">Warning Days</label>
          <input
            type="number"
            value={client.warningDays}
            onChange={(e) =>
              handleChange("warningDays", Number(e.target.value))
            }
            className="input-style"
          />
        </div>

        {/* MAX WAITERS */}
        <div>
          <label className="label-style">Max Waiters</label>
          <input
            type="number"
            value={client.maxWaiters}
            onChange={(e) =>
              handleChange("maxWaiters", Number(e.target.value))
            }
            className="input-style"
          />
        </div>

        {/* MAX POS */}
        <div>
          <label className="label-style">Max POS</label>
          <input
            type="number"
            value={client.maxPOS}
            onChange={(e) =>
              handleChange("maxPOS", Number(e.target.value))
            }
            className="input-style"
          />
        </div>

        {/* SAVE BUTTON */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white py-2 rounded"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}