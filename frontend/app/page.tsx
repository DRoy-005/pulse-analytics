"use client";

// ============================================================
// Dashboard Page
// ============================================================
//
// Main analytics dashboard for PulseAnalytics.
//
// Responsibilities:
//
// 1. Manage dashboard-level state
// 2. Retrieve real analytics metrics from the backend
// 3. Manage the global dashboard date range
// 4. Use the authenticated user's workspace
// 5. Render the dashboard header
// 6. Combine reusable dashboard components
// 7. Handle loading and error states
//
// ============================================================

import { useEffect, useState } from "react";

import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  Menu,
  MousePointerClick,
  Users,
} from "lucide-react";

// ============================================================
// Authentication
// ============================================================

import { useAuth } from "@/context/AuthContext";

// ============================================================
// API
// ============================================================

import {
  getAnalyticsOverview,
  type AnalyticsMetrics,
} from "@/lib/api";

// ============================================================
// Reusable Dashboard Components
// ============================================================

import { AIInsight } from "@/components/dashboard/AIInsight";
import { DeviceBreakdown } from "@/components/dashboard/DeviceBreakdown";
import { LiveActivity } from "@/components/dashboard/LiveActivity";
import { LocationBreakdown } from "@/components/dashboard/LocationBreakdown";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopEvents } from "@/components/dashboard/TopEvents";
import { TrafficChart } from "@/components/dashboard/TrafficChart";

// ============================================================
// Date Range Options
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
// Dashboard Page
// ============================================================

export default function DashboardPage() {
  // ----------------------------------------------------------
  // Authentication
  // ----------------------------------------------------------

  const {
    workspace,
    loading: authLoading,
  } = useAuth();

  // ----------------------------------------------------------
  // Mobile navigation
  // ----------------------------------------------------------

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  // ----------------------------------------------------------
  // Selected analytics period
  // ----------------------------------------------------------

  const [selectedDays, setSelectedDays] =
    useState(7);

  // ----------------------------------------------------------
  // Date menu
  // ----------------------------------------------------------

  const [dateMenuOpen, setDateMenuOpen] =
    useState(false);

  // ----------------------------------------------------------
  // Analytics metrics
  // ----------------------------------------------------------

  const [metrics, setMetrics] =
    useState<AnalyticsMetrics | null>(null);

  // ----------------------------------------------------------
  // Analytics error
  // ----------------------------------------------------------

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================================
  // Load Analytics Overview
  // ==========================================================

  useEffect(() => {
    // Authentication is still being restored.
    // Wait until AuthContext finishes.
    if (authLoading || !workspace) {
      return;
    }

    // Store the workspace ID in a local constant.
    // This guarantees TypeScript knows it cannot be null
    // inside the async function below.
    const workspaceId = workspace.id;

    async function loadAnalytics() {
      try {
        setError(null);

        const response =
          await getAnalyticsOverview(
            workspaceId,
            selectedDays
          );

        setMetrics(
          response.data.metrics
        );
      } catch (error) {
        console.error(
          "Failed to load dashboard analytics:",
          error
        );

        setError(
          "Unable to load dashboard analytics."
        );
      }
    }

    loadAnalytics();
  }, [
    workspace,
    authLoading,
    selectedDays,
  ]);

  // ==========================================================
  // Derived loading state
  // ==========================================================
  //
  // We don't need another useState for loading.
  // Authentication loading comes from AuthContext.
  // Before metrics arrive, the dashboard is still loading.
  //
  // ==========================================================

  const loading =
    authLoading ||
    (workspace !== null &&
      metrics === null &&
      error === null);

  // ==========================================================
  // Current Date Range Label
  // ==========================================================

  const currentDateRange =
    DATE_RANGES.find(
      (range) =>
        range.days === selectedDays
    );

  const dateRangeLabel =
    currentDateRange?.label ??
    "Last 7 days";

  // ==========================================================
  // Format Metric Values
  // ==========================================================

  const formattedUsers =
    metrics?.totalUsers.toLocaleString(
      "en-IN"
    ) ?? "—";

  const formattedEvents =
    metrics?.totalEvents.toLocaleString(
      "en-IN"
    ) ?? "—";

  const formattedSessions =
    metrics?.activeSessions.toLocaleString(
      "en-IN"
    ) ?? "—";

  const formattedConversion =
    metrics !== null
      ? `${metrics.conversionRate.toFixed(2)}%`
      : "—";

  // ==========================================================
  // Authentication Loading Screen
  // ==========================================================

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-900 dark:text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500 dark:border-slate-700 dark:border-t-emerald-400" />

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Loading your workspace...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // No authenticated workspace
  // ==========================================================

  if (!workspace) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-900 dark:text-white">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-semibold">
              Authentication required
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Please log in to access your
              analytics workspace.
            </p>

            <a
              href="/login"
              className="mt-5 inline-flex rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
            >
              Go to login
            </a>
          </div>
        </div>
      </div>
    );
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
          Main Application Area
          ====================================================== */}

      <div className="lg:pl-64">

        {/* ====================================================
            Top Header
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
            <Menu size={21} />
          </button>

          {/* Right side */}

          <div className="ml-auto flex items-center gap-2 md:gap-4">

            {/* Notifications */}

            <button
              type="button"
              className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Notifications"
            >
              <Bell size={19} />

              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </button>

            {/* User */}

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                {workspace.name
                  ?.charAt(0)
                  .toUpperCase() ?? "P"}
              </div>

              <ChevronDown
                size={15}
                className="hidden text-slate-400 sm:block"
              />
            </button>
          </div>
        </header>

        {/* ====================================================
            Main Content
            ==================================================== */}

        <main className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">

          {/* ==================================================
              Dashboard Header
              ================================================== */}

          <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>

              <p className="mb-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Analytics overview
              </p>

              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Good morning 👋
              </h1>

              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                Here&apos;s what&apos;s happening with
                your product today.
              </p>

            </div>

            {/* ==================================================
                Date Range Selector
                ================================================== */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setDateMenuOpen(
                    (open) => !open
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                aria-expanded={
                  dateMenuOpen
                }
              >
                <CalendarDays size={16} />

                <span>
                  {dateRangeLabel}
                </span>

                <ChevronDown
                  size={15}
                  className={`text-slate-400 transition-transform ${
                    dateMenuOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />
              </button>

              {dateMenuOpen && (
                <div className="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-950">

                  {DATE_RANGES.map(
                    (range) => (
                      <button
                        key={range.days}
                        type="button"
                        onClick={() => {
                          setSelectedDays(
                            range.days
                          );

                          setDateMenuOpen(
                            false
                          );
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                          selectedDays ===
                          range.days
                            ? "bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                            : "text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900"
                        }`}
                      >
                        <span>
                          {range.label}
                        </span>

                        {selectedDays ===
                          range.days && (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            ✓
                          </span>
                        )}
                      </button>
                    )
                  )}

                </div>
              )}

            </div>

          </div>

          {/* ==================================================
              Dashboard Error
              ================================================== */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* ==================================================
              Metric Cards
              ================================================== */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <MetricCard
              title="Total users"
              value={
                loading
                  ? "..."
                  : formattedUsers
              }
              comparisonLabel={
                dateRangeLabel
              }
              icon={Users}
            />

            <MetricCard
              title="Total events"
              value={
                loading
                  ? "..."
                  : formattedEvents
              }
              comparisonLabel={
                dateRangeLabel
              }
              icon={MousePointerClick}
            />

            <MetricCard
              title="Active sessions"
              value={
                loading
                  ? "..."
                  : formattedSessions
              }
              comparisonLabel={
                dateRangeLabel
              }
              icon={Activity}
            />

            <MetricCard
              title="Conversion rate"
              value={
                loading
                  ? "..."
                  : formattedConversion
              }
              comparisonLabel={
                dateRangeLabel
              }
              icon={BarChart3}
            />

          </div>

          {/* ==================================================
              Traffic Chart
              ================================================== */}

          <div className="mt-6">
            <TrafficChart
              days={selectedDays}
            />
          </div>

          {/* ==================================================
              Activity + Top Events
              ================================================== */}

          <div className="mt-6 grid gap-6 xl:grid-cols-2">

            {/* Live Activity intentionally remains independent
                of the dashboard date range because it shows
                the latest incoming activity. */}

            <LiveActivity />

            <TopEvents
              days={selectedDays}
            />

          </div>

          {/* ==================================================
              Device + Location
              ================================================== */}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">

            <DeviceBreakdown
              days={selectedDays}
            />

            <LocationBreakdown
              days={selectedDays}
            />

          </div>

          {/* ==================================================
              AI Insight
              ================================================== */}

          <AIInsight
            days={selectedDays}
          />

        </main>

      </div>

    </div>
  );
}