"use client";

// ============================================================
// PulseAnalytics Reports
// ============================================================
//
// This page creates a reusable analytics report from the same
// real data used by the main dashboard.
//
// Current capabilities:
// 1. Select a reporting period
// 2. Retrieve real analytics data
// 3. Show report summary
// 4. Show top events
// 5. Show device breakdown
// 6. Show location breakdown
// 7. Export the report as CSV
//
// ============================================================

import { useEffect, useState } from "react";

import {
  Activity,
  BarChart3,
  CalendarDays,
  Download,
  FileText,
  Globe2,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
  Users,
} from "lucide-react";

// ============================================================
// API
// ============================================================

import {
  getAnalyticsOverview,
  getDeviceBreakdown,
  getLocationBreakdown,
  getTopEvents,
} from "@/lib/api";

// ============================================================
// Workspace
// ============================================================

import { CURRENT_WORKSPACE_ID } from "@/lib/workspace";

// ============================================================
// Reusable navigation
// ============================================================

import { Sidebar } from "@/components/dashboard/Sidebar";

// ============================================================
// Date ranges
// ============================================================

const DATE_RANGES = [
  {
    label: "Last 7 days",
    days: 7,
  },
  {
    label: "Last 30 days",
    days: 30,
  },
  {
    label: "Last 90 days",
    days: 90,
  },
];

// ============================================================
// Local response types
// ============================================================

interface ReportMetrics {
  totalUsers: number;
  totalEvents: number;
  activeSessions: number;
  conversionRate: number;
}

interface TopEvent {
  name: string;
  count: number;
  percentage: number;
}

interface DeviceItem {
  name: string;
  count: number;
  percentage: number;
}

interface LocationItem {
  city: string;
  country: string;
  count: number;
}

interface ReportData {
  metrics: ReportMetrics;
  topEvents: TopEvent[];
  devices: DeviceItem[];
  locations: LocationItem[];
}

// ============================================================
// Reports Page
// ============================================================

export default function ReportsPage() {
  // ----------------------------------------------------------
  // Mobile navigation
  // ----------------------------------------------------------

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  // ----------------------------------------------------------
  // Selected reporting period
  // ----------------------------------------------------------

  const [selectedDays, setSelectedDays] =
    useState(30);

  // ----------------------------------------------------------
  // Report data
  // ----------------------------------------------------------

  const [report, setReport] =
    useState<ReportData | null>(null);

  // ----------------------------------------------------------
  // Loading / error state
  // ----------------------------------------------------------

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // ----------------------------------------------------------
  // Load report
  // ----------------------------------------------------------

  // ----------------------------------------------------------
// Load report
// ----------------------------------------------------------

async function loadReport() {
  try {
    // Give the current render/effect cycle time to finish
    // before updating component state.
    await Promise.resolve();

    setLoading(true);
    setError(null);

    // ------------------------------------------------------
    // Fetch all report sections in parallel.
    // ------------------------------------------------------

    const [
      overviewResponse,
      topEventsResponse,
      devicesResponse,
      locationsResponse,
    ] = await Promise.all([
      getAnalyticsOverview(
        CURRENT_WORKSPACE_ID,
        selectedDays
      ),

      getTopEvents(
        CURRENT_WORKSPACE_ID,
        selectedDays,
        5
      ),

      getDeviceBreakdown(
        CURRENT_WORKSPACE_ID,
        selectedDays
      ),

      getLocationBreakdown(
        CURRENT_WORKSPACE_ID,
        selectedDays,
        5
      ),
    ]);

    // ------------------------------------------------------
    // Combine the API responses into one report object.
    // ------------------------------------------------------

    setReport({
      metrics: overviewResponse.data.metrics,
      topEvents: topEventsResponse.data,
      devices: devicesResponse.data,
      locations: locationsResponse.data,
    });
  } catch (error) {
    console.error(
      "Failed to load analytics report:",
      error
    );

    setError(
      "Unable to generate the analytics report."
    );
  } finally {
    setLoading(false);
  }
}

// ----------------------------------------------------------
// Load report whenever the reporting period changes
// ----------------------------------------------------------
//
// This is an intentional data-fetching effect.
// The fetched data updates React state after the
// asynchronous API request completes.
// ----------------------------------------------------------

useEffect(() => {
  const timer = window.setTimeout(() => {
    void loadReport();
  }, 0);

  return () => {
    window.clearTimeout(timer);
  };

  // loadReport is intentionally triggered when selectedDays
  // changes. The function uses the current selectedDays value.
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedDays]);

  // ==========================================================
  // Formatting helpers
  // ==========================================================

  function formatEventName(name: string) {
    return name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  function formatNumber(value: number) {
    return value.toLocaleString("en-IN");
  }

  function formatPercentage(value: number) {
    return `${value.toFixed(2)}%`;
  }

  // ==========================================================
  // Device icon helper
  // ==========================================================

  function getDeviceIcon(deviceName: string) {
    const device = deviceName.toLowerCase();

    if (device.includes("mobile")) {
      return Smartphone;
    }

    if (device.includes("tablet")) {
      return Tablet;
    }

    return Monitor;
  }

  // ==========================================================
  // CSV helper
  // ==========================================================

  function escapeCsvValue(value: string | number) {
    const stringValue = String(value);

    if (
      stringValue.includes(",") ||
      stringValue.includes('"') ||
      stringValue.includes("\n")
    ) {
      return `"${stringValue.replace(
        /"/g,
        '""'
      )}"`;
    }

    return stringValue;
  }

  // ==========================================================
  // Export report as CSV
  // ==========================================================

  function exportCsv() {
    if (!report) {
      return;
    }

    const rows: Array<
      Array<string | number>
    > = [];

    // --------------------------------------------------------
    // Report information
    // --------------------------------------------------------

    rows.push([
      "PulseAnalytics Report",
      "",
    ]);

    rows.push([
      "Reporting period",
      `Last ${selectedDays} days`,
    ]);

    rows.push([]);

    // --------------------------------------------------------
    // Summary metrics
    // --------------------------------------------------------

    rows.push([
      "Summary",
      "",
    ]);

    rows.push([
      "Total users",
      report.metrics.totalUsers,
    ]);

    rows.push([
      "Total events",
      report.metrics.totalEvents,
    ]);

    rows.push([
      "Active sessions",
      report.metrics.activeSessions,
    ]);

    rows.push([
      "Conversion rate",
      `${report.metrics.conversionRate.toFixed(
        2
      )}%`,
    ]);

    rows.push([]);

    // --------------------------------------------------------
    // Top events
    // --------------------------------------------------------

    rows.push([
      "Top Events",
      "",
      "",
    ]);

    rows.push([
      "Event",
      "Count",
      "Relative %",
    ]);

    for (const event of report.topEvents) {
      rows.push([
        formatEventName(event.name),
        event.count,
        `${event.percentage}%`,
      ]);
    }

    rows.push([]);

    // --------------------------------------------------------
    // Devices
    // --------------------------------------------------------

    rows.push([
      "Device Breakdown",
      "",
      "",
    ]);

    rows.push([
      "Device",
      "Sessions",
      "Percentage",
    ]);

    for (const device of report.devices) {
      rows.push([
        device.name,
        device.count,
        `${device.percentage}%`,
      ]);
    }

    rows.push([]);

    // --------------------------------------------------------
    // Locations
    // --------------------------------------------------------

    rows.push([
      "Top Locations",
      "",
      "",
    ]);

    rows.push([
      "City",
      "Country",
      "Sessions",
    ]);

    for (const location of report.locations) {
      rows.push([
        location.city,
        location.country,
        location.count,
      ]);
    }

    // --------------------------------------------------------
    // Convert rows into CSV
    // --------------------------------------------------------

    const csv = rows
      .map((row) =>
        row
          .map((value) =>
            escapeCsvValue(value)
          )
          .join(",")
      )
      .join("\n");

    // --------------------------------------------------------
    // Create downloadable file
    // --------------------------------------------------------

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download = `pulseanalytics-report-${selectedDays}-days.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
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

          {/* Mobile menu */}

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(true)
            }
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Open navigation menu"
          >
            <BarChart3 size={20} />
          </button>

          <div className="hidden lg:block" />

          {/* Header actions */}

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => {
                void loadReport();
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw
                size={15}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              <span className="hidden sm:inline">
                Refresh
              </span>
            </button>

            <button
              type="button"
              onClick={exportCsv}
              disabled={!report || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Download size={15} />

              <span className="hidden sm:inline">
                Export CSV
              </span>
            </button>

          </div>

        </header>

        {/* ====================================================
            Page content
            ==================================================== */}

        <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">

          {/* ==================================================
              Page heading
              ================================================== */}

          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Analytics
              </p>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white md:text-3xl">
                Reports
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Generate a structured summary of your
                product activity and export the
                results for further analysis.
              </p>

            </div>

            {/* Period selector */}

            <div className="relative">

              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950">

                <CalendarDays
                  size={16}
                  className="text-slate-400"
                />

                <select
                  value={selectedDays}
                  onChange={(event) =>
                    setSelectedDays(
                      Number(
                        event.target.value
                      )
                    )
                  }
                  className="bg-transparent text-sm font-medium text-slate-700 outline-none dark:text-slate-200"
                >
                  {DATE_RANGES.map(
                    (range) => (
                      <option
                        key={range.days}
                        value={range.days}
                      >
                        {range.label}
                      </option>
                    )
                  )}
                </select>

              </div>

            </div>

          </div>

          {/* ==================================================
              Error state
              ================================================== */}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* ==================================================
              Loading state
              ================================================== */}

          {loading && !report && (
            <div className="space-y-6">

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                {[1, 2, 3, 4].map(
                  (item) => (
                    <div
                      key={item}
                      className="h-32 animate-pulse rounded-2xl bg-white dark:bg-slate-900"
                    />
                  )
                )}

              </div>

              <div className="h-72 animate-pulse rounded-2xl bg-white dark:bg-slate-900" />

            </div>
          )}

          {/* ==================================================
              Report
              ================================================== */}

          {!loading && report && (
            <>

              {/* ==================================================
                  Summary metrics
                  ================================================== */}

              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">

                {/* Users */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Total users
                      </p>

                      <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
                        {formatNumber(
                          report.metrics
                            .totalUsers
                        )}
                      </p>

                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <Users size={19} />
                    </div>

                  </div>

                </div>

                {/* Events */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Total events
                      </p>

                      <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
                        {formatNumber(
                          report.metrics
                            .totalEvents
                        )}
                      </p>

                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <Activity size={19} />
                    </div>

                  </div>

                </div>

                {/* Sessions */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Active sessions
                      </p>

                      <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
                        {formatNumber(
                          report.metrics
                            .activeSessions
                        )}
                      </p>

                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <BarChart3 size={19} />
                    </div>

                  </div>

                </div>

                {/* Conversion */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Conversion rate
                      </p>

                      <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
                        {formatPercentage(
                          report.metrics
                            .conversionRate
                        )}
                      </p>

                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                      <FileText size={19} />
                    </div>

                  </div>

                </div>

              </section>

              {/* ==================================================
                  Report overview
                  ================================================== */}

              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-6">

                <div className="flex items-start gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <FileText size={20} />
                  </div>

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Report period
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
                      Last {selectedDays} days
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      This report combines product
                      activity, event frequency,
                      device usage, and geographic
                      activity for the selected period.
                    </p>

                  </div>

                </div>

              </section>

              {/* ==================================================
                  Two-column report sections
                  ================================================== */}

              <div className="mt-6 grid gap-6 lg:grid-cols-2">

                {/* ==================================================
                    Top events
                    ================================================== */}

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-6">

                  <div className="mb-6 flex items-center justify-between">

                    <div>

                      <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                        Top events
                      </h2>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Most frequently triggered events.
                      </p>

                    </div>

                    <Activity
                      size={18}
                      className="text-slate-400"
                    />

                  </div>

                  {report.topEvents.length ===
                  0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">
                      No event data available.
                    </p>
                  ) : (
                    <div className="space-y-5">

                      {report.topEvents.map(
                        (event) => (
                          <div
                            key={event.name}
                          >

                            <div className="mb-2 flex items-center justify-between gap-4">

                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {formatEventName(
                                  event.name
                                )}
                              </span>

                              <span className="text-sm text-slate-500 dark:text-slate-400">
                                {formatNumber(
                                  event.count
                                )}
                              </span>

                            </div>

                            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{
                                  width: `${event.percentage}%`,
                                }}
                              />

                            </div>

                          </div>
                        )
                      )}

                    </div>
                  )}

                </section>

                {/* ==================================================
                    Device breakdown
                    ================================================== */}

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-6">

                  <div className="mb-6">

                    <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                      Device breakdown
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Sessions grouped by device type.
                    </p>

                  </div>

                  {report.devices.length ===
                  0 ? (
                    <p className="py-8 text-center text-sm text-slate-400">
                      No device data available.
                    </p>
                  ) : (
                    <div className="space-y-5">

                      {report.devices.map(
                        (device) => {
                          const Icon =
                            getDeviceIcon(
                              device.name
                            );

                          return (
                            <div
                              key={device.name}
                            >

                              <div className="mb-2 flex items-center justify-between">

                                <div className="flex items-center gap-2">

                                  <Icon
                                    size={16}
                                    className="text-slate-400"
                                  />

                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {formatEventName(
                                      device.name
                                    )}
                                  </span>

                                </div>

                                <span className="text-sm text-slate-500 dark:text-slate-400">
                                  {device.count}{" "}
                                  ·{" "}
                                  {device.percentage}%
                                </span>

                              </div>

                              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

                                <div
                                  className="h-full rounded-full bg-emerald-500"
                                  style={{
                                    width: `${device.percentage}%`,
                                  }}
                                />

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>
                  )}

                </section>

              </div>

              {/* ==================================================
                  Locations
                  ================================================== */}

              <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-6">

                <div className="mb-6 flex items-center justify-between">

                  <div>

                    <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                      Top locations
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Cities generating the most session
                      activity.
                    </p>

                  </div>

                  <Globe2
                    size={18}
                    className="text-slate-400"
                  />

                </div>

                {report.locations.length ===
                0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">
                    No location data available.
                  </p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">

                    {report.locations.map(
                      (
                        location,
                        index
                      ) => (
                        <div
                          key={`${location.city}-${location.country}`}
                          className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800"
                        >

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                            {index + 1}
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                              {location.city}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                              {location.country}
                            </p>

                          </div>

                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {location.count}
                          </span>

                        </div>
                      )
                    )}

                  </div>
                )}

              </section>

              {/* ==================================================
                  Export footer
                  ================================================== */}

              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-5 dark:border-slate-700 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Ready to share this report?
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Export the current {selectedDays}
                    -day report as a CSV file.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={exportCsv}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  <Download size={16} />

                  Download CSV
                </button>

              </div>

            </>
          )}

        </main>
      </div>
    </div>
  );
}