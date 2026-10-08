"use client";

// ============================================================
// LocationBreakdown
// ============================================================
//
// Shows the locations generating the most user activity.
//
// Data is retrieved from the PulseAnalytics backend and is
// calculated from real sessions in the database.
//
// The workspace is taken from the authenticated user so that
// each user only sees data belonging to their workspace.
//
// ============================================================

import { useEffect, useState } from "react";

import { Globe2 } from "lucide-react";

import { useAuth } from "@/context/AuthContext";

import {
  getLocationBreakdown,
  type LocationBreakdownItem,
} from "@/lib/api";

// ============================================================
// LocationBreakdown Component
// ============================================================

export function LocationBreakdown({
  days,
}: {
  days: number;
}) {
  // ==========================================================
  // Authentication / Workspace
  // ==========================================================

  const {
    workspace,
    loading: authLoading,
  } = useAuth();

  // ==========================================================
  // Component State
  // ==========================================================

  const [locations, setLocations] =
    useState<LocationBreakdownItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================================
  // Load Location Data
  // ==========================================================

  useEffect(() => {
    // Wait until authentication has finished and a workspace
    // is available.
    if (authLoading || !workspace) {
      return;
    }

    // Use the authenticated user's workspace instead of a
    // hardcoded workspace ID.
    const workspaceId = workspace.id;

    async function loadLocations() {
      try {
        setError(null);

        const response =
          await getLocationBreakdown(
            workspaceId,
            days,
            5
          );

        setLocations(response.data);
      } catch (error) {
        console.error(
          "Failed to load location breakdown:",
          error
        );

        setError(
          "Unable to load location data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadLocations();
  }, [
    workspace,
    authLoading,
    days,
  ]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">

      {/* ======================================================
          Section Header
          ====================================================== */}

      <div className="mb-6">
        <h2 className="text-base font-semibold">
          Top locations
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Cities generating the most activity
        </p>
      </div>

      {/* ======================================================
          Loading State
          ====================================================== */}

      {loading && (
        <div className="space-y-3">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-xl border border-slate-100 p-3 dark:border-slate-800"
            >
              <div className="h-8 w-8 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />

              <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />

              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />

                <div className="h-2.5 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              </div>

              <div className="h-3 w-10 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      )}

      {/* ======================================================
          Error State
          ====================================================== */}

      {!loading && error && (
        <div className="flex min-h-[180px] items-center justify-center text-sm text-red-500">
          {error}
        </div>
      )}

      {/* ======================================================
          Empty State
          ====================================================== */}

      {!loading &&
        !error &&
        locations.length === 0 && (
          <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
            <Globe2
              size={28}
              className="mb-3 text-slate-300 dark:text-slate-700"
            />

            <p className="text-sm font-medium">
              No location data yet
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Location information will appear
              when sessions include location data.
            </p>
          </div>
        )}

      {/* ======================================================
          Location List
          ====================================================== */}

      {!loading &&
        !error &&
        locations.length > 0 && (
          <div className="space-y-3">
            {locations.map(
              (location, index) => (
                <div
                  key={`${location.city}-${location.country}`}
                  className="flex items-center gap-4 rounded-xl border border-slate-100 p-3 dark:border-slate-800"
                >
                  {/* Ranking number */}

                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                    {index + 1}
                  </span>

                  {/* Location icon */}

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <Globe2 size={16} />
                  </div>

                  {/* Location information */}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {location.city}
                    </p>

                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {location.country}
                    </p>
                  </div>

                  {/* Session count */}

                  <span className="text-sm font-semibold">
                    {location.count.toLocaleString(
                      "en-IN"
                    )}
                  </span>
                </div>
              )
            )}
          </div>
        )}
    </section>
  );
}