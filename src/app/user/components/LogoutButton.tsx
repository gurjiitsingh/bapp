"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { LogOut, LoaderCircle } from "lucide-react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);

    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Logout failed:", error);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="
        group inline-flex items-center justify-center gap-2
        rounded-xl border border-red-200 bg-white
        px-4 py-2.5 text-sm font-semibold text-red-600
        shadow-sm transition-all duration-200
        hover:border-red-300 hover:bg-red-50 hover:shadow
        active:scale-[0.98]
        disabled:cursor-not-allowed disabled:opacity-60
        focus-visible:outline-none focus-visible:ring-2
        focus-visible:ring-red-400 focus-visible:ring-offset-2
      "
    >
      {loading ? (
        <LoaderCircle size={17} className="animate-spin" />
      ) : (
        <LogOut
          size={17}
          strokeWidth={2}
          className="transition-transform duration-200 group-hover:-translate-x-0.5"
        />
      )}

      <span>{loading ? "Signing out..." : "Logout"}</span>
    </button>
  );
}