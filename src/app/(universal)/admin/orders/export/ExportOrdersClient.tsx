"use client";

import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  Download,
  FileJson,
  Loader2,
} from "lucide-react";

import { exportOrdersToJson } from "@/app/(universal)/action/orders/export/exportOrdersToJson";

type OrderExportSource = "ALL" | "POS" | "WEB" | "APP";

type ExportMode = "MONTH" | "DATE" | "CUSTOM";

const sourceOptions: {
  label: string;
  value: OrderExportSource;
}[] = [
  {
    label: "All Orders",
    value: "ALL",
  },
  {
    label: "POS Orders",
    value: "POS",
  },
  {
    label: "WEB Orders",
    value: "WEB",
  },
  {
    label: "APP Orders",
    value: "APP",
  },
];

function getCurrentMonth() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getToday() {
  const now = new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getMonthStart(month: string) {
  return `${month}-01`;
}

function getMonthEnd(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);

  const lastDay = new Date(
    year,
    monthNumber,
    0
  ).getDate();

  return `${year}-${String(monthNumber).padStart(
    2,
    "0"
  )}-${String(lastDay).padStart(2, "0")}`;
}

function downloadJsonFile(
  data: string,
  fileName: string
) {
  const blob = new Blob([data], {
    type: "application/json;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export default function ExportOrdersClient() {
  const [exportMode, setExportMode] =
    useState<ExportMode>("MONTH");

  const [month, setMonth] = useState(
    getCurrentMonth()
  );

  const [date, setDate] = useState(
    getToday()
  );

  const [fromDate, setFromDate] = useState(
    getToday()
  );

  const [toDate, setToDate] = useState(
    getToday()
  );

  const [source, setSource] =
    useState<OrderExportSource>("ALL");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const selectedRange = useMemo(() => {
    if (exportMode === "MONTH") {
      return {
        from: getMonthStart(month),
        to: getMonthEnd(month),
      };
    }

    if (exportMode === "DATE") {
      return {
        from: date,
        to: date,
      };
    }

    return {
      from: fromDate,
      to: toDate,
    };
  }, [
    exportMode,
    month,
    date,
    fromDate,
    toDate,
  ]);

  async function handleExport() {
    setMessage(null);
    setError(null);

    if (!selectedRange.from) {
      setError("Please select a start date.");
      return;
    }

    if (!selectedRange.to) {
      setError("Please select an end date.");
      return;
    }

    if (
      selectedRange.from >
      selectedRange.to
    ) {
      setError(
        "The start date cannot be after the end date."
      );
      return;
    }

    try {
      setLoading(true);

      const result =
        await exportOrdersToJson({
          from: selectedRange.from,
          to: selectedRange.to,
          source,
        });

      if (!result.success) {
        setError(
          result.error ||
            "Failed to export orders."
        );

        return;
      }

      downloadJsonFile(
        result.data,
        result.fileName
      );

      setMessage(
        `Export completed successfully. ${result.summary.orderCount} order${
          result.summary.orderCount === 1
            ? ""
            : "s"
        } exported.`
      );
    } catch (error) {
      console.error(
        "ORDER EXPORT ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to export orders."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-4 md:p-6">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50">
            <FileJson className="h-5 w-5 text-rose-600" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Download Orders
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Download a JSON backup of your
              restaurant orders.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN CARD
      ====================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* ===================================================
            CARD HEADER
        ==================================================== */}
        <div className="border-b border-slate-100 px-5 py-4 md:px-6">
          <h2 className="text-base font-semibold text-slate-900">
            Order Backup
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select the period and order source you
            want to include in the backup.
          </p>
        </div>

        {/* ===================================================
            FORM
        ==================================================== */}
        <div className="space-y-6 p-5 md:p-6">
          {/* =================================================
              EXPORT TYPE
          ================================================== */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Export Period
            </label>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() =>
                  setExportMode("MONTH")
                }
                className={`
                  rounded-xl border px-4 py-3
                  text-sm font-semibold transition
                  ${
                    exportMode === "MONTH"
                      ? "border-rose-500 bg-rose-50 text-rose-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }
                `}
              >
                Monthly
              </button>

              <button
                type="button"
                onClick={() =>
                  setExportMode("DATE")
                }
                className={`
                  rounded-xl border px-4 py-3
                  text-sm font-semibold transition
                  ${
                    exportMode === "DATE"
                      ? "border-rose-500 bg-rose-50 text-rose-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }
                `}
              >
                Single Date
              </button>

              <button
                type="button"
                onClick={() =>
                  setExportMode("CUSTOM")
                }
                className={`
                  rounded-xl border px-4 py-3
                  text-sm font-semibold transition
                  ${
                    exportMode === "CUSTOM"
                      ? "border-rose-500 bg-rose-50 text-rose-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }
                `}
              >
                Custom Range
              </button>
            </div>
          </div>

          {/* =================================================
              DATE SELECTION
          ================================================== */}
          <div>
            {exportMode === "MONTH" && (
              <div>
                <label
                  htmlFor="export-month"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Select Month
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="export-month"
                    type="month"
                    value={month}
                    onChange={(event) =>
                      setMonth(
                        event.target.value
                      )
                    }
                    className="
                      h-11 w-full rounded-xl
                      border border-slate-200
                      bg-white pl-10 pr-4
                      text-sm text-slate-700
                      outline-none transition
                      focus:border-rose-400
                      focus:ring-2
                      focus:ring-rose-100
                    "
                  />
                </div>
              </div>
            )}

            {exportMode === "DATE" && (
              <div>
                <label
                  htmlFor="export-date"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Select Date
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="export-date"
                    type="date"
                    value={date}
                    onChange={(event) =>
                      setDate(
                        event.target.value
                      )
                    }
                    className="
                      h-11 w-full rounded-xl
                      border border-slate-200
                      bg-white pl-10 pr-4
                      text-sm text-slate-700
                      outline-none transition
                      focus:border-rose-400
                      focus:ring-2
                      focus:ring-rose-100
                    "
                  />
                </div>
              </div>
            )}

            {exportMode === "CUSTOM" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="export-from"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    From Date
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="export-from"
                      type="date"
                      value={fromDate}
                      max={toDate}
                      onChange={(event) =>
                        setFromDate(
                          event.target.value
                        )
                      }
                      className="
                        h-11 w-full rounded-xl
                        border border-slate-200
                        bg-white pl-10 pr-4
                        text-sm text-slate-700
                        outline-none transition
                        focus:border-rose-400
                        focus:ring-2
                        focus:ring-rose-100
                      "
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="export-to"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    To Date
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="export-to"
                      type="date"
                      value={toDate}
                      min={fromDate}
                      onChange={(event) =>
                        setToDate(
                          event.target.value
                        )
                      }
                      className="
                        h-11 w-full rounded-xl
                        border border-slate-200
                        bg-white pl-10 pr-4
                        text-sm text-slate-700
                        outline-none transition
                        focus:border-rose-400
                        focus:ring-2
                        focus:ring-rose-100
                      "
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              SOURCE
          ================================================== */}
          <div>
            <label
              htmlFor="export-source"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Order Source
            </label>

            <div className="relative">
              <select
                id="export-source"
                value={source}
                onChange={(event) =>
                  setSource(
                    event.target
                      .value as OrderExportSource
                  )
                }
                className="
                  h-11 w-full appearance-none
                  rounded-xl border border-slate-200
                  bg-white px-4 pr-10
                  text-sm font-medium text-slate-700
                  outline-none transition
                  focus:border-rose-400
                  focus:ring-2
                  focus:ring-rose-100
                "
              >
                {sourceOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          {/* =================================================
              EXPORT PREVIEW
          ================================================== */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileJson className="h-4 w-4 text-slate-500" />

              <span className="text-sm font-semibold text-slate-700">
                Export Summary
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-400">
                  From
                </p>

                <p className="mt-1 font-medium text-slate-700">
                  {selectedRange.from ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  To
                </p>

                <p className="mt-1 font-medium text-slate-700">
                  {selectedRange.to ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Source
                </p>

                <p className="mt-1 font-medium text-slate-700">
                  {
                    sourceOptions.find(
                      (item) =>
                        item.value ===
                        source
                    )?.label
                  }
                </p>
              </div>
            </div>
          </div>

          {/* =================================================
              MESSAGE
          ================================================== */}
          {message && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* =================================================
              ACTION
          ================================================== */}
          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={handleExport}
              disabled={loading}
              className="
                inline-flex h-11
                items-center justify-center
                gap-2 rounded-xl
                bg-rose-600 px-5
                text-sm font-semibold
                text-white shadow-sm
                transition
                hover:bg-rose-700
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing Backup...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download JSON
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}