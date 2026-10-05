"use client";

// ============================================================
// PulseAnalytics Realtime
// ============================================================
//
// True realtime implementation using Server-Sent Events (SSE).
//
// The browser opens one persistent connection to:
//
//   GET /api/realtime?workspaceId=...
//
// Whenever a new event is created by the backend, the server
// pushes it through that connection immediately.
//
// No 5-second polling is required.
//
// ============================================================

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Activity,
  Clock3,
  Eye,
  Globe2,
  Laptop,
  Menu,
  MousePointerClick,
  RefreshCw,
  ShoppingCart,
  Smartphone,
  Tablet,
  UserPlus,
  Wifi,
  WifiOff,
} from "lucide-react";

import {
  getRecentEvents,
  type AnalyticsEvent,
} from "@/lib/api";

import { CURRENT_WORKSPACE_ID } from "@/lib/workspace";

import { Sidebar } from "@/components/dashboard/Sidebar";

// ============================================================
// Constants
// ============================================================

const EVENT_LIMIT = 20;

const SSE_URL =
  `http://localhost:5000/api/realtime?workspaceId=${encodeURIComponent(
    CURRENT_WORKSPACE_ID
  )}`;

// ============================================================
// Realtime Page
// ============================================================

export default function RealtimePage() {
  // ----------------------------------------------------------
  // Mobile navigation
  // ----------------------------------------------------------

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  // ----------------------------------------------------------
  // Events currently displayed in the feed
  // ----------------------------------------------------------

  const [events, setEvents] = useState<
    AnalyticsEvent[]
  >([]);

  // ----------------------------------------------------------
  // Initial event loading
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------------
  // Manual refresh state
  // ----------------------------------------------------------

  const [refreshing, setRefreshing] =
    useState(false);

  // ----------------------------------------------------------
  // Error state
  // ----------------------------------------------------------

  const [error, setError] =
    useState<string | null>(null);

  // ----------------------------------------------------------
  // SSE connection status
  // ----------------------------------------------------------

  const [connected, setConnected] =
    useState(false);

  // ----------------------------------------------------------
  // Last event received from SSE
  // ----------------------------------------------------------

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  // ----------------------------------------------------------
  // Current reference time
  //
  // Used by formatRelativeTime() instead of calling Date.now()
  // directly during render.
  // ----------------------------------------------------------

  const [currentTime, setCurrentTime] =
    useState<number | null>(null);

  // ==========================================================
  // Load initial events
  // ==========================================================
  //
  // SSE only tells us about NEW events.
  //
  // Therefore we first load the latest events already stored
  // in PostgreSQL.
  //
  // After that, SSE keeps the feed updated.
  //
  // ==========================================================

  const loadInitialEvents =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getRecentEvents(
            CURRENT_WORKSPACE_ID,
            1,
            EVENT_LIMIT
          );

        setEvents(response.data);

        const now = new Date();

        setLastUpdated(now);
        setCurrentTime(
          now.getTime()
        );
      } catch (error) {
        console.error(
          "Failed to load realtime events:",
          error
        );

        setError(
          "Unable to load recent activity."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  // ==========================================================
  // Initial database load
  // ==========================================================

  useEffect(() => {
    const initialLoad =
      window.setTimeout(() => {
        void loadInitialEvents();
      }, 0);

    return () => {
      window.clearTimeout(initialLoad);
    };
  }, [loadInitialEvents]);

  // ==========================================================
  // Server-Sent Events connection
  // ==========================================================
  //
  // EventSource automatically keeps the connection open.
  //
  // If the backend temporarily disconnects, the browser will
  // automatically attempt to reconnect.
  //
  // ==========================================================

  useEffect(() => {
    const eventSource =
      new EventSource(SSE_URL);

    // --------------------------------------------------------
    // Connection opened
    // --------------------------------------------------------

    eventSource.onopen = () => {
      setConnected(true);
      setError(null);
    };

    // --------------------------------------------------------
    // Generic message
    //
    // The backend sends:
    //
    // data: {...event}
    //
    // --------------------------------------------------------

    eventSource.onmessage = (
      message
    ) => {
      try {
        const newEvent =
          JSON.parse(
            message.data
          ) as AnalyticsEvent;

        setEvents((currentEvents) => {
          // --------------------------------------------------
          // Prevent duplicate events.
          // --------------------------------------------------

          const alreadyExists =
            currentEvents.some(
              (event) =>
                event.id ===
                newEvent.id
            );

          if (alreadyExists) {
            return currentEvents;
          }

          // --------------------------------------------------
          // Add newest event to the beginning.
          // --------------------------------------------------

          return [
            newEvent,
            ...currentEvents,
          ].slice(0, EVENT_LIMIT);
        });

        const now = new Date();

        setLastUpdated(now);
        setCurrentTime(
          now.getTime()
        );
      } catch (error) {
        console.error(
          "Failed to parse realtime event:",
          error
        );
      }
    };

    // --------------------------------------------------------
    // Connected event
    //
    // The backend sends this immediately after the SSE
    // connection is established.
    // --------------------------------------------------------

    eventSource.addEventListener(
      "connected",
      () => {
        setConnected(true);
      }
    );

    // --------------------------------------------------------
    // Connection error
    // --------------------------------------------------------

    eventSource.onerror = () => {
      setConnected(false);
    };

    // --------------------------------------------------------
    // Cleanup
    //
    // Closing the page closes the SSE connection.
    // --------------------------------------------------------

    return () => {
      eventSource.close();
    };
  }, []);

  // ==========================================================
  // Manual refresh
  // ==========================================================
  //
  // This is still useful as a manual database refresh.
  //
  // It does NOT control the realtime connection.
  //
  // ==========================================================

  async function handleRefresh() {
    try {
      setRefreshing(true);

      await loadInitialEvents();
    } finally {
      setRefreshing(false);
    }
  }

  // ==========================================================
  // Formatting helpers
  // ==========================================================

  function formatEventName(
    eventName: string
  ) {
    return eventName
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  // ----------------------------------------------------------
  // Relative timestamp
  // ----------------------------------------------------------

  function formatRelativeTime(
    timestamp: string
  ) {
    if (currentTime === null) {
      return "—";
    }

    const eventTime =
      new Date(timestamp).getTime();

    const difference = Math.max(
      0,
      currentTime - eventTime
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

  // ----------------------------------------------------------
  // Full timestamp
  // ----------------------------------------------------------

  function formatTimestamp(
    timestamp: string
  ) {
    return new Date(
      timestamp
    ).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  // ==========================================================
  // Event icon
  // ==========================================================

  function getEventIcon(
    eventName: string
  ) {
    const name =
      eventName.toLowerCase();

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

  // ==========================================================
  // Device icon
  // ==========================================================

  function getDeviceIcon(
    deviceType:
      | string
      | null
      | undefined
  ) {
    const device =
      deviceType?.toLowerCase() ?? "";

    if (device.includes("mobile")) {
      return Smartphone;
    }

    if (device.includes("tablet")) {
      return Tablet;
    }

    return Laptop;
  }

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-900 dark:text-white">

      {/* ======================================================
          Sidebar
          ====================================================== */}

      <Sidebar
        mobileMenuOpen={mobileMenuOpen}
        onClose={() =>
          setMobileMenuOpen(false)
        }
      />

      {/* ======================================================
          Main application area
          ====================================================== */}

      <div className="lg:pl-64">

        {/* ====================================================
            Header
            ==================================================== */}

        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6 dark:border-slate-800 dark:bg-slate-950/95">

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(true)
            }
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:block" />

          <button
            type="button"
            onClick={() => {
              void handleRefresh();
            }}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            <span className="hidden sm:inline">
              Refresh
            </span>
          </button>
        </header>

        {/* ====================================================
            Main content
            ==================================================== */}

        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">

          {/* ==================================================
              Page heading
              ================================================== */}

          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  Live analytics
                </p>

                <span
                  className={
                    connected
                      ? "flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                      : "flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                  }
                >
                  <span
                    className={
                      connected
                        ? "h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"
                        : "h-1.5 w-1.5 rounded-full bg-slate-400"
                    }
                  />

                  {connected
                    ? "Live"
                    : "Connecting"}
                </span>

              </div>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-3xl">
                Realtime
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Monitor product activity as events
                arrive from your application.
              </p>

            </div>

            <div className="flex items-center gap-3 text-sm">

              <div
                className={
                  connected
                    ? "flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400"
                    : "flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400"
                }
              >

                {connected ? (
                  <Wifi size={15} />
                ) : (
                  <WifiOff size={15} />
                )}

                <span>
                  {connected
                    ? "SSE connected"
                    : "Connecting to server"}
                </span>

              </div>

            </div>

          </div>

          {/* ==================================================
              Error
              ================================================== */}

          {error && (
            <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">

              <span>{error}</span>

              <button
                type="button"
                onClick={() => {
                  void loadInitialEvents();
                }}
                className="font-medium underline underline-offset-2"
              >
                Retry
              </button>

            </div>
          )}

          {/* ==================================================
              Summary cards
              ================================================== */}

          <section className="grid gap-4 md:grid-cols-3">

            {/* Recent events */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Recent events
                  </p>

                  <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
                    {loading
                      ? "—"
                      : events.length}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Latest {EVENT_LIMIT} events
                  </p>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <Activity size={19} />
                </div>

              </div>

            </div>

            {/* Connection */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Connection
                  </p>

                  <p
                    className={
                      connected
                        ? "mt-3 text-2xl font-semibold text-emerald-600 dark:text-emerald-400"
                        : "mt-3 text-2xl font-semibold text-slate-500 dark:text-slate-400"
                    }
                  >
                    {connected
                      ? "Live"
                      : "Offline"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Server-Sent Events
                  </p>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  {connected ? (
                    <Wifi size={19} />
                  ) : (
                    <WifiOff size={19} />
                  )}
                </div>

              </div>

            </div>

            {/* Last update */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Last event
                  </p>

                  <p className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">
                    {lastUpdated
                      ? lastUpdated.toLocaleTimeString(
                          "en-IN",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          }
                        )
                      : "—"}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Local time
                  </p>

                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                  <Clock3 size={19} />
                </div>

              </div>

            </div>

          </section>

          {/* ==================================================
              Live event feed
              ================================================== */}

          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">

            {/* Feed header */}

            <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-6 dark:border-slate-800">

              <div>

                <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                  Live event feed
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  New events are pushed from the
                  server immediately.
                </p>

              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">

                <span
                  className={
                    connected
                      ? "h-2 w-2 animate-pulse rounded-full bg-emerald-500"
                      : "h-2 w-2 rounded-full bg-slate-400"
                  }
                />

                {connected
                  ? "Listening for activity"
                  : "Waiting for connection"}

              </div>

            </div>

            {/* Loading */}

            {loading && (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">

                {[1, 2, 3, 4, 5].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex items-center gap-4 px-5 py-5 md:px-6"
                    >

                      <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />

                      <div className="flex-1">

                        <div className="h-4 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />

                        <div className="mt-2 h-3 w-56 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />

                      </div>

                      <div className="h-3 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-900" />

                    </div>
                  )
                )}

              </div>
            )}

            {/* Empty */}

            {!loading &&
              !error &&
              events.length === 0 && (
                <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900">
                    <Activity size={24} />
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
                    No recent activity
                  </h3>

                  <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
                    New events will appear here
                    automatically when your product
                    sends activity.
                  </p>

                </div>
              )}

            {/* Events */}

            {!loading &&
              events.length > 0 && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">

                  {events.map((event) => {
                    const EventIcon =
                      getEventIcon(
                        event.name
                      );

                    const DeviceIcon =
                      getDeviceIcon(
                        event.session
                          ?.deviceType
                      );

                    return (
                      <div
                        key={event.id}
                        className="px-5 py-5 transition-colors hover:bg-slate-50 md:px-6 dark:hover:bg-slate-900/50"
                      >

                        <div className="flex items-start gap-4">

                          {/* Event icon */}

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">

                            <EventIcon
                              size={18}
                            />

                          </div>

                          {/* Event details */}

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                              <div className="flex items-center gap-2">

                                <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                                  {formatEventName(
                                    event.name
                                  )}
                                </h3>

                                <span className="hidden rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 sm:inline dark:bg-slate-900 dark:text-slate-400">
                                  EVENT
                                </span>

                              </div>

                              <span
                                title={formatTimestamp(
                                  event.timestamp
                                )}
                                className="text-xs text-slate-400"
                              >
                                {formatRelativeTime(
                                  event.timestamp
                                )}
                              </span>

                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">

                              {event.user && (
                                <span>
                                  {event.user
                                    .email ??
                                    event.user
                                      .externalId ??
                                    "Anonymous user"}
                                </span>
                              )}

                              {event.session
                                ?.deviceType && (
                                <span className="flex items-center gap-1.5">

                                  <DeviceIcon
                                    size={13}
                                  />

                                  {
                                    event
                                      .session
                                      .deviceType
                                  }

                                </span>
                              )}

                              {(event.session
                                ?.city ||
                                event.session
                                  ?.country) && (
                                <span className="flex items-center gap-1.5">

                                  <Globe2
                                    size={13}
                                  />

                                  {[
                                    event
                                      .session
                                      .city,
                                    event
                                      .session
                                      .country,
                                  ]
                                    .filter(
                                      Boolean
                                    )
                                    .join(
                                      ", "
                                    )}

                                </span>
                              )}

                            </div>

                          </div>

                        </div>

                      </div>
                    );
                  })}

                </div>
              )}

          </section>

          {/* ==================================================
              SSE information
              ================================================== */}

          <div className="mt-6 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 px-5 py-4 dark:border-emerald-900 dark:bg-emerald-950/10">

            <div className="flex items-start gap-3">

              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <Wifi size={16} />
              </div>

              <div>

                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Server-Sent Events enabled
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  This feed uses a persistent SSE
                  connection. New events are pushed
                  directly from the backend instead of
                  being discovered through periodic
                  polling.
                </p>

              </div>

            </div>

          </div>

        </main>
      </div>
    </div>
  );
}