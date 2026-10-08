"use client";

// ============================================================
// Live Activity
// ============================================================
//
// Displays the most recent analytics events received by
// PulseAnalytics.
//
// Data comes directly from the backend API.
//
// The workspace is taken from the authenticated user.
//
// ============================================================

import { useEffect, useState } from "react";

import {
  Activity,
  MousePointerClick,
  UserPlus,
  Eye,
  ShoppingCart,
} from "lucide-react";

// ============================================================
// Authentication
// ============================================================

import { useAuth } from "@/context/AuthContext";

// ============================================================
// API
// ============================================================

import {
  getRecentEvents,
  type AnalyticsEvent,
} from "@/lib/api";

// ============================================================
// Helpers
// ============================================================

function getEventIcon(eventName: string) {
  const name = eventName.toLowerCase();

  if (
    name.includes("signup") ||
    name.includes("register")
  ) {
    return UserPlus;
  }

  if (
    name.includes("checkout") ||
    name.includes("purchase")
  ) {
    return ShoppingCart;
  }

  if (
    name.includes("page") ||
    name.includes("view")
  ) {
    return Eye;
  }

  if (
    name.includes("click") ||
    name.includes("button")
  ) {
    return MousePointerClick;
  }

  return Activity;
}

// ============================================================
// Format Event Name
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
// Relative Time
// ============================================================

function formatRelativeTime(
  timestamp: string
) {
  const eventTime =
    new Date(timestamp).getTime();

  const now = Date.now();

  const difference = Math.max(
    0,
    now - eventTime
  );

  const seconds = Math.floor(
    difference / 1000
  );

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(
    seconds / 60
  );

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(
    hours / 24
  );

  return `${days}d ago`;
}

// ============================================================
// Component
// ============================================================

export function LiveActivity() {
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

  const [events, setEvents] = useState<
    AnalyticsEvent[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // ----------------------------------------------------------
  // Fetch recent events
  // ----------------------------------------------------------

  useEffect(() => {
    // Wait until authentication has finished.
    if (authLoading || !workspace) {
      return;
    }

    // Store the workspace ID locally.
    // TypeScript now knows this is a string.
    const workspaceId = workspace.id;

    async function loadEvents() {
      try {
        setError(null);

        const response =
          await getRecentEvents(
            workspaceId,
            1,
            8
          );

        setEvents(response.data);
      } catch (error) {
        console.error(
          "Failed to load recent events:",
          error
        );

        setError(
          "Unable to load recent activity."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, [
    workspace,
    authLoading,
  ]);

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-6">

      {/* ====================================================
          Header
          ==================================================== */}

      <div className="mb-5 flex items-center justify-between">

        <div>
          <h2 className="text-base font-semibold">
            Live activity
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Recent events from your product
          </p>
        </div>

        {/* Live indicator */}

        <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">

          <span className="relative flex h-2 w-2">

            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />

            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />

          </span>

          Live

        </div>

      </div>

      {/* ====================================================
          Loading
          ==================================================== */}

      {loading && (
        <div className="space-y-4">

          {Array.from({ length: 5 }).map(
            (_, index) => (
              <div
                key={index}
                className="flex items-center gap-3"
              >

                <div className="h-9 w-9 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />

                <div className="flex-1 space-y-2">

                  <div className="h-3 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />

                  <div className="h-2.5 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />

                </div>

              </div>
            )
          )}

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

            <Activity
              size={28}
              className="mb-3 text-slate-300 dark:text-slate-700"
            />

            <p className="text-sm font-medium">
              No activity yet
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Events will appear here when users
              interact with your product.
            </p>

          </div>
        )}

      {/* ====================================================
          Events
          ==================================================== */}

      {!loading &&
        !error &&
        events.length > 0 && (
          <div className="space-y-1">

            {events.map((event) => {
              const Icon =
                getEventIcon(event.name);

              const userName =
                event.user?.email ||
                event.user?.externalId ||
                "Anonymous user";

              return (
                <div
                  key={event.id}
                  className="flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
                >

                  {/* Event icon */}

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">

                    <Icon size={16} />

                  </div>

                  {/* Event information */}

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                      {formatEventName(
                        event.name
                      )}
                    </p>

                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {userName}
                    </p>

                  </div>

                  {/* Timestamp */}

                  <span className="shrink-0 text-xs text-slate-400">
                    {formatRelativeTime(
                      event.timestamp
                    )}
                  </span>

                </div>
              );
            })}

          </div>
        )}

    </div>
  );
}