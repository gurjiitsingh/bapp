"use client";

import React, { useEffect, useState } from "react";
import {
  fetchSettings,
  upsertLocaleCurrencySetting,
} from "@/app/(universal)/action/setting/dbOperations";

const supportedLocales = [
  { label: "Germany (EUR)", value: { currency: "EUR", locale: "de-DE" } },
  { label: "United States (USD)", value: { currency: "USD", locale: "en-US" } },
  { label: "India (INR)", value: { currency: "INR", locale: "en-IN" } },
  { label: "United Kingdom (GBP)", value: { currency: "GBP", locale: "en-GB" } },
  { label: "Japan (JPY)", value: { currency: "JPY", locale: "ja-JP" } },
  { label: "Canada (CAD)", value: { currency: "CAD", locale: "en-CA" } },
  { label: "Australia (AUD)", value: { currency: "AUD", locale: "en-AU" } },
];

export default function InitialCurrencyLocaleSetup() {
  const [selected, setSelected] = useState<{ currency: string; locale: string }>({
    currency: "EUR",
    locale: "de-DE",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [existingSettings, setExistingSettings] = useState({
    currency: "",
    locale: "",
  });

  useEffect(() => {
    fetchSettings().then((data) => {
      const currencySetting = data.find((s) => s.name === "currency");
      const localeSetting = data.find((s) => s.name === "locale");
      if (currencySetting || localeSetting) {
        setExistingSettings({
          currency: currencySetting?.value || "",
          locale: localeSetting?.value || "",
        });
      }
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const res1 = await upsertLocaleCurrencySetting("currency", selected.currency);
    const res2 = await upsertLocaleCurrencySetting("locale", selected.locale);
    setLoading(false);

    if (res1.errors || res2.errors) {
      setMessage("Error saving settings.");
    } else {
      setMessage("Settings saved successfully.");
      setExistingSettings(selected);
    }
  };

  return (
    <div className="p-4 max-w-md  bg-white rounded-xl shadow-md space-y-4">
      <h2 className="text-lg font-semibold text-center">Select Country & Currency</h2>
      <select
        className="w-full p-2 border rounded"
        value={JSON.stringify(selected)}
        onChange={(e) => setSelected(JSON.parse(e.target.value))}
      >
        {supportedLocales.map((opt) => (
          <option key={opt.label} value={JSON.stringify(opt.value)}>
            {opt.label}
          </option>
        ))}
      </select>

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
      >
        {loading ? "Saving..." : "Save"}
      </button>

      {message && <p className="text-center text-sm text-green-700">{message}</p>}

      {(existingSettings.currency || existingSettings.locale) && (
        <div className="text-sm text-gray-500 text-center">
          Current settings: {existingSettings.locale} / {existingSettings.currency}
        </div>
      )}
    </div>
  );
}
