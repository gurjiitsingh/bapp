"use client";

import { saveWebApi } from "@/app/my/actions/clientActions";
import { useState } from "react";
 

export default function WebApiForm({
  clientId,
}: {
  clientId: string;
}) {
  const [config, setConfig] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setMessage("");

    if (!config.trim()) {
      setMessage("Please paste Firebase Web configuration.");
      return;
    }

    setSaving(true);

    try {
      const result = await saveWebApi({
        clientId,
        config,
      });

      if (!result.success) {
        setMessage(result.error || "Failed to save.");
        return;
      }

      setMessage("Web Firebase configuration saved successfully.");
      setConfig("");
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl rounded-lg border bg-white p-6">
      <h1 className="text-xl font-semibold">
        Add Web Firebase Configuration
      </h1>

      <div className="mt-2 text-sm text-gray-500">
        Client ID:
        <span className="ml-2 font-semibold text-gray-800">
          {clientId}
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6"
      >
        <label className="mb-2 block text-sm font-medium">
          Firebase Web Config
        </label>

        <textarea
          value={config}
          onChange={(e) => setConfig(e.target.value)}
          rows={14}
          spellCheck={false}
          className="w-full rounded-lg border p-4 font-mono text-sm outline-none focus:ring-2"
          placeholder={`apiKey: "AIza...",
authDomain: "food-demo-d69f0.firebaseapp.com",
projectId: "food-demo-d69f0",
storageBucket: "food-demo-d69f0.firebasestorage.app",
messagingSenderId: "694719081868",
appId: "1:694719081868:web:c9ad72f4238f48c5fbbaa9",
measurementId: "G-RYLQPYK7T4"`}
        />

        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Web API"}
        </button>

        {message && (
          <div className="mt-4 rounded-md bg-gray-100 p-3 text-sm">
            {message}
          </div>
        )}
      </form>
    </div>
  );
}