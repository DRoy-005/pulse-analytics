"use client";

// ============================================================
// TopEvents
// ============================================================
//
// Displays the most frequently triggered events.
//
// Data comes directly from PostgreSQL through the
// PulseAnalytics analytics API.
//
// The workspace is taken from the authenticated user.
//
// ============================================================

import { useEffect, useState } from "react";

import {
  MousePointerClick,
} from "lucide-react";

// ============================================================
// Authentication
// ============================================================

import { useAuth } from "@/context/AuthContext";

// ============================================================
// API
// ============================================================

import {
  getTopEvents,
  type TopEvent,
} from "@/lib/api";

// ============================================================
// Helpers
// ============================================================

function formatEventName(
  eventName: string
) {
  return eventName
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

// ============================================================
// Component
// ============================================================

export function TopEvents({
  days,
}: {
  days: number;
}) {
  // ----------------------------------------------------------
  // Authenticated workspace
  // ----------------------------------------------------------

  const {
    workspace,
    loading: authLoading,
  } = useAuth();

  // ----------------------------------------------------------
  // Events
  // ----------------------------------------------------------

  const [events, setEvents] =
    useState<TopEvent[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================================
  // Load Top Events
  // ==========================================================

  useEffect(() => {
    // Wait until authentication has finished.
    if (authLoading || !workspace) {
      return;
    }

    // Store the workspace ID locally.
    // TypeScript now knows this is a string.
    const workspaceId = workspace.id;

    async function loadTopEvents() {
      try {
        setError(null);

        const response =
          await getTopEvents(
            workspaceId,
            days,
            5
          );

        setEvents(response.data);
      } catch (error) {
        console.error(
          "Failed to load top events:",
          error
        );

        setError(
          "Unable to load top events."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTopEvents();
  }, [
    workspace,
    authLoading,
    days,
  ]);

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">

      {/* ====================================================
          Section Header
          ==================================================== */}

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-base font-semibold">
            Top events
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Most frequently triggered events
          </p>

        </div>

        <MousePointerClick
          size={18}
          className="text-slate-400"
        />

      </div>

      {/* ====================================================
          Loading
          ==================================================== */}

      {loading && (
        <div className="space-y-5">

          {Array.from({
            length: 5,
          }).map((_, index) => (
            <div key={index}>

              <div className="mb-2 flex justify-between">

                <div className="h-3 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />

                <div className="h-3 w-10 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />

              </div>

              <div className="h-2 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />

            </div>
          ))}

        </div>
      )}

      {/* ====================================================
          Error
          ==================================================== */}

      {!loading && error && (
        <div className="flex min-h-[220px] items-center justify-center text-sm text-red-500">
          {error}
        </div>
      )}

      {/* ====================================================
          Empty State
          ==================================================== */}

      {!loading &&
        !error &&
        events.length === 0 && (
          <div className="flex min-h-[220px] flex-col items-center justify-center text-center">

            <MousePointerClick
              size={28}
              className="mb-3 text-slate-300 dark:text-slate-700"
            />

            <p className="text-sm font-medium">
              No events yet
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Event activity will appear here
              once your product starts receiving
              events.
            </p>

          </div>
        )}

      {/* ====================================================
          Event List
          ==================================================== */}

      {!loading &&
        !error &&
        events.length > 0 && (
          <div className="space-y-5">

            {events.map((event) => (
              <div key={event.name}>

                {/* Event name + count */}

                <div className="mb-2 flex items-center justify-between">

                  <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                    {formatEventName(
                      event.name
                    )}
                  </span>

                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {event.count.toLocaleString(
                      "en-IN"
                    )}
                  </span>

                </div>

                {/* Progress bar */}

                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${event.percentage}%`,
                    }}
                  />

                </div>

              </div>
            ))}

          </div>
        )}

    </section>
  );
}