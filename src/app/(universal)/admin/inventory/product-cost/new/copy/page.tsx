"use client";

import { migrateProductRecipesToFast } from "@/app/(universal)/action/productRecipesF/migrateProductRecipes";
import { useState } from "react";
 

type MigrationResult = {
  success: boolean;
  message?: string;
  migratedProducts?: number;
  migratedRecipes?: number;
  skippedDuplicates?: number;
};

export default function MigrateProductRecipesClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState("");

  async function handleMigration() {
    const confirmed = window.confirm(
      "Copy all records from productRecipes to productRecipesF? Existing recipes in productRecipesF will be preserved. Continue?"
    );

    if (!confirmed) return;

    setLoading(true);
    setResult(null);
    setError("");

    try {
      const response = await migrateProductRecipesToFast();

      setResult(response as MigrationResult);

      if (!response.success) {
        setError(response.message || "Migration failed.");
      }
    } catch (err) {
      console.error("Product recipe migration error:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">
          Migrate Product Recipes
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Copy recipe records from the old productRecipes collection
          into the new productRecipesF collection.
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-sm">
          The migration will group recipes by product. Existing recipes
          in productRecipesF will be preserved, and duplicate
          inventory items will be skipped.
        </p>

        <p className="mt-2 text-sm font-medium text-amber-600">
          Run this migration only from a protected admin account.
        </p>
      </div>

      <button
        type="button"
        onClick={handleMigration}
        disabled={loading}
        className="rounded-md bg-primary px-5 py-2.5 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Migrating recipes..." : "Start Migration"}
      </button>

      {loading && (
        <p className="text-sm text-muted-foreground">
          Please wait. Do not close this page until migration finishes.
        </p>
      )}

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          <strong>Migration error:</strong> {error}
        </div>
      )}

      {result?.success && (
        <div className="space-y-2 rounded-md border border-green-300 bg-green-50 p-4 text-sm text-green-800">
          <h2 className="font-semibold">Migration completed</h2>

          <p>
            Products migrated: {result.migratedProducts ?? 0}
          </p>

          <p>
            Recipes copied: {result.migratedRecipes ?? 0}
          </p>

          <p>
            Duplicate recipes skipped: {result.skippedDuplicates ?? 0}
          </p>
        </div>
      )}
    </div>
  );
}