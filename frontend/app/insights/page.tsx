"use client";

// ============================================================
// PulseAnalytics Insights
// ============================================================
// Displays:
// 1. Key analytics insight
// 2. Activity metrics
// 3. Actual vs forecasted activity
// 4. Anomaly detection
// 5. Top events
// 6. Recommended actions
// ============================================================

import { useEffect, useState } from "react";

import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ChevronDown,
  Lightbulb,
  Menu,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getAnalyticsAnomalies,
  getAnalyticsForecast,
  getAnalyticsInsight,
  getAnalyticsOverview,
  getTopEvents,
  type AnalyticsAnomaly,
  type AnalyticsForecastPoint,
  type AnalyticsInsight,
  type AnalyticsMetrics,
  type TopEvent,
} from "@/lib/api";

import { CURRENT_WORKSPACE_ID } from "@/lib/workspace";

import { Sidebar } from "@/components/dashboard/Sidebar";

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
// Forecast Chart Point
// ============================================================

interface ForecastChartPoint {
  date: string;
  label: string;

  // Actual historical activity
  actual?: number;

  // Forecasted activity
  predicted?: number;

  // Forecast expected range
  lowerBound?: number;
  upperBound?: number;
}

// ============================================================
// Insights Page
// ============================================================

export default function InsightsPage() {
  // ----------------------------------------------------------
  // Mobile navigation
  // ----------------------------------------------------------

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  // ----------------------------------------------------------
  // Date range
  // ----------------------------------------------------------

  const [selectedDays, setSelectedDays] =
    useState(7);

  const [dateMenuOpen, setDateMenuOpen] =
    useState(false);

  // ----------------------------------------------------------
  // Refresh key
  //
  // Changing this value forces the analytics APIs to run again.
  // ----------------------------------------------------------

  const [refreshKey, setRefreshKey] =
    useState(0);

  // ----------------------------------------------------------
  // Insight
  // ----------------------------------------------------------

  const [insight, setInsight] =
    useState<AnalyticsInsight | null>(null);

  // ----------------------------------------------------------
  // Overview metrics
  // ----------------------------------------------------------

  const [metrics, setMetrics] =
    useState<AnalyticsMetrics | null>(null);

  // ----------------------------------------------------------
  // Top events
  // ----------------------------------------------------------

  const [topEvents, setTopEvents] =
    useState<TopEvent[]>([]);

  // ----------------------------------------------------------
  // Anomalies
  // ----------------------------------------------------------

  const [anomalies, setAnomalies] =
    useState<AnalyticsAnomaly[]>([]);

  // ----------------------------------------------------------
  // Forecast
  // ----------------------------------------------------------

  const [historicalActivity, setHistoricalActivity] =
    useState<
      {
        date: string;
        eventCount: number;
      }[]
    >([]);

  const [forecast, setForecast] =
    useState<AnalyticsForecastPoint[]>([]);

  const [forecastTrend, setForecastTrend] =
    useState<
      | "increasing"
      | "decreasing"
      | "stable"
      | "insufficient_data"
    >("stable");

  const [forecastAverage, setForecastAverage] =
    useState(0);

  const [forecastDailyTrend, setForecastDailyTrend] =
    useState(0);

  // ----------------------------------------------------------
  // Loading / error
  // ----------------------------------------------------------

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // ==========================================================
  // Load Analytics
  // ==========================================================

  useEffect(() => {
    async function loadInsights() {
      try {
        setLoading(true);
        setError(null);

        const [
          insightResponse,
          overviewResponse,
          topEventsResponse,
          anomaliesResponse,
          forecastResponse,
        ] = await Promise.all([
          getAnalyticsInsight(
            CURRENT_WORKSPACE_ID,
            selectedDays
          ),

          getAnalyticsOverview(
            CURRENT_WORKSPACE_ID,
            selectedDays
          ),

          getTopEvents(
            CURRENT_WORKSPACE_ID,
            selectedDays,
            5
          ),

          getAnalyticsAnomalies(
            CURRENT_WORKSPACE_ID,
            selectedDays
          ),

          getAnalyticsForecast(
            CURRENT_WORKSPACE_ID,
            selectedDays
          ),
        ]);

        // Insight
        setInsight(
          insightResponse.data
        );

        // Overview
        setMetrics(
          overviewResponse.data.metrics
        );

        // Top events
        setTopEvents(
          topEventsResponse.data
        );

        // Anomalies
        setAnomalies(
          anomaliesResponse.data.anomalies
        );

        // Historical activity
        setHistoricalActivity(
          forecastResponse.data.historical
        );

        // Forecast
        setForecast(
          forecastResponse.data.forecast
        );

        setForecastTrend(
          forecastResponse.data.trend
        );

        setForecastAverage(
          forecastResponse.data.averageDailyEvents
        );

        setForecastDailyTrend(
          forecastResponse.data.dailyTrend
        );
      } catch (error) {
        console.error(
          "Failed to load insights:",
          error
        );

        setError(
          "Unable to load analytics insights."
        );
      } finally {
        setLoading(false);
      }
    }

    loadInsights();
  }, [selectedDays, refreshKey]);

  // ==========================================================
  // Date Range Label
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
  // Formatting Helpers
  // ==========================================================

  function formatDate(date: string) {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatShortDate(
    date: string
  ) {
    return new Date(
      `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
  }

  function formatChange(
    value: number
  ) {
    return `${value >= 0 ? "+" : ""}${value.toFixed(
      1
    )}%`;
  }

  // ==========================================================
  // Anomaly Severity Styling
  // ==========================================================

  function getSeverityClasses(
    severity: AnalyticsAnomaly["severity"]
  ) {
    if (severity === "high") {
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400";
    }

    if (severity === "medium") {
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400";
    }

    return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400";
  }

  // ==========================================================
  // Activity Trend
  // ==========================================================

  const activityChange =
    insight?.activityChange ?? 0;

  const trendIsPositive =
    activityChange > 0;

  const trendIsNegative =
    activityChange < 0;

  // ==========================================================
  // Forecast Trend Label
  // ==========================================================

  const forecastTrendLabel =
    forecastTrend === "increasing"
      ? "Increasing"
      : forecastTrend === "decreasing"
        ? "Decreasing"
        : forecastTrend === "stable"
          ? "Stable"
          : "Insufficient data";

  // ==========================================================
  // Build Actual + Forecast Chart
  // ==========================================================
  //
  // We display:
  //
  // Historical:
  //      actual ────────────────
  //
  // Forecast:
  //                         predicted ───────
  //                         - - upper bound
  //                         - - lower bound
  //
  // The final historical point is also used as the starting
  // point for the forecast line so the transition is visible.
  // ==========================================================

  const forecastChartData: ForecastChartPoint[] = [];

  // Only show the most recent 7 historical days.
  // This keeps the forecast chart readable even when the
  // selected analytics period is 30 or 90 days.

  const recentHistorical =
    historicalActivity.slice(-7);

  recentHistorical.forEach(
    (item) => {
      forecastChartData.push({
        date: item.date,
        label: formatShortDate(
          item.date
        ),
        actual: item.eventCount,
      });
    }
  );

  // Connect the forecast to the final actual value.
  if (
    recentHistorical.length > 0 &&
    forecast.length > 0
  ) {
    const lastHistorical =
      recentHistorical[
        recentHistorical.length - 1
      ];

    forecastChartData[
      forecastChartData.length - 1
    ] = {
      date: lastHistorical.date,
      label: formatShortDate(
        lastHistorical.date
      ),
      actual:
        lastHistorical.eventCount,
      predicted:
        lastHistorical.eventCount,
    };
  }

  // Add forecast days
  forecast.forEach((item) => {
    forecastChartData.push({
      date: item.date,
      label: formatShortDate(
        item.date
      ),
      predicted:
        item.predictedEvents,
      lowerBound:
        item.lowerBound,
      upperBound:
        item.upperBound,
    });
  });

  // ==========================================================
  // Recommended Action
  // ==========================================================

  let recommendedAction =
    "Continue monitoring your product activity.";

  if (anomalies.length > 0) {
    const strongestAnomaly =
      anomalies[0];

    if (
      strongestAnomaly.type === "spike"
    ) {
      recommendedAction =
        "Investigate the activity spike to understand what caused the sudden increase.";
    } else {
      recommendedAction =
        "Investigate the activity drop and check whether it is related to a product or tracking issue.";
    }
  } else if (
    forecastTrend === "increasing"
  ) {
    recommendedAction =
      "Activity is trending upward. Continue investing in the user flows driving the increase.";
  } else if (
    forecastTrend === "decreasing"
  ) {
    recommendedAction =
      "Activity is trending downward. Review recent product changes and investigate the source of the decline.";
  } else if (trendIsPositive) {
    recommendedAction =
      "Continue investing in the events and user flows driving the increase.";
  } else if (trendIsNegative) {
    recommendedAction =
      "Review recent product activity and identify the source of the decline.";
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
          Main Application
          ====================================================== */}

      <div className="lg:pl-64">

        {/* ==================================================
            Header
            ================================================== */}

        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6 dark:border-slate-800 dark:bg-slate-950/95">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(true)
              }
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">
                Insights
              </p>

              <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
                Understand what is happening in your product
              </p>
            </div>

          </div>

          {/* Header controls */}

          <div className="flex items-center gap-2">

            {/* Date selector */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setDateMenuOpen(
                    (open) => !open
                  )
                }
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <CalendarDays className="h-4 w-4" />

                <span className="hidden sm:inline">
                  {dateRangeLabel}
                </span>

                <span className="sm:hidden">
                  {selectedDays}d
                </span>

                <ChevronDown className="h-4 w-4" />
              </button>

              {dateMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">

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
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                          selectedDays ===
                          range.days
                            ? "bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                      >
                        {range.label}
                      </button>
                    )
                  )}

                </div>
              )}

            </div>

            {/* Refresh */}

            <button
              type="button"
              onClick={() =>
                setRefreshKey(
                  (value) => value + 1
                )
              }
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Refresh insights"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>

          </div>

        </header>

        {/* ==================================================
            Page Content
            ================================================== */}

        <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">

          {/* Page heading */}

          <div className="mb-6">

            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>

                <h1 className="text-xl font-semibold tracking-tight">
                  Product Insights
                </h1>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {dateRangeLabel}
                </p>

              </div>

            </div>

          </div>

          {/* Error */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          {/* ==================================================
              Key Insight
              ================================================== */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 dark:border-slate-800 dark:bg-slate-950">

            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

              <div className="flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <Lightbulb className="h-5 w-5" />
                </div>

                <div>

                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Key insight
                  </p>

                  <h2 className="text-lg font-semibold">
                    {loading
                      ? "Analyzing activity..."
                      : insight?.title ??
                        "No insight available"}
                  </h2>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {loading
                      ? "Please wait while we analyze your product activity."
                      : insight?.description ??
                        "There is not enough activity to generate an insight yet."}
                  </p>

                </div>

              </div>

              {!loading &&
                insight && (
                  <div
                    className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                      trendIsPositive
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : trendIsNegative
                          ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {trendIsPositive ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : trendIsNegative ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : (
                      <BarChart3 className="h-4 w-4" />
                    )}

                    {formatChange(
                      activityChange
                    )}
                  </div>
                )}

            </div>

          </section>

          {/* ==================================================
              Summary Cards
              ================================================== */}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Activity change
              </p>

              <div className="mt-2 flex items-center gap-2">

                {trendIsPositive ? (
                  <ArrowUpRight className="h-5 w-5 text-emerald-500" />
                ) : (
                  <ArrowDownRight className="h-5 w-5 text-red-500" />
                )}

                <p className="text-2xl font-semibold">
                  {loading
                    ? "—"
                    : formatChange(
                        activityChange
                      )}
                </p>

              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Events analyzed
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {loading
                  ? "—"
                  : (
                      metrics?.totalEvents ??
                      0
                    ).toLocaleString(
                      "en-IN"
                    )}
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Users analyzed
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {loading
                  ? "—"
                  : (
                      metrics?.totalUsers ??
                      0
                    ).toLocaleString(
                      "en-IN"
                    )}
              </p>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">

              <p className="text-sm text-slate-500 dark:text-slate-400">
                Anomalies detected
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {loading
                  ? "—"
                  : anomalies.length}
              </p>

            </div>

          </div>

          {/* ==================================================
              Forecast
              ================================================== */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">

            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between md:p-6 dark:border-slate-800">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <TrendingUp className="h-5 w-5" />
                </div>

                <div>

                  <h2 className="font-semibold">
                    7-Day Activity Forecast
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Actual activity compared with expected future activity
                  </p>

                </div>

              </div>

              {!loading &&
                forecast.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 text-sm">

                    <span
                      className={`rounded-full px-2.5 py-1 font-medium ${
                        forecastTrend ===
                        "increasing"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : forecastTrend ===
                              "decreasing"
                            ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {forecastTrendLabel}
                    </span>

                    <span className="text-slate-500 dark:text-slate-400">
                      Avg.{" "}
                      {forecastAverage.toFixed(
                        1
                      )}{" "}
                      events/day
                    </span>

                  </div>
                )}

            </div>

            <div className="p-5 md:p-6">

              {loading ? (
                <div className="h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900" />
              ) : forecast.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">

                  <p className="font-medium">
                    Not enough data for a forecast
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    More product activity is needed to generate a meaningful prediction.
                  </p>

                </div>
              ) : (
                <>
                  {/* Chart legend */}

                  <div className="mb-4 flex flex-wrap items-center gap-5 text-xs text-slate-500 dark:text-slate-400">

                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
                      Actual activity
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      Predicted activity
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-5 border-t border-dashed border-slate-400" />
                      Expected range
                    </div>

                  </div>

                  <div className="h-72 w-full">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >
                      <LineChart
                        data={
                          forecastChartData
                        }
                        margin={{
                          top: 10,
                          right: 10,
                          left: -20,
                          bottom: 0,
                        }}
                      >

                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-slate-200 dark:stroke-slate-800"
                        />

                        <XAxis
                          dataKey="label"
                          tick={{
                            fontSize: 12,
                          }}
                          tickLine={false}
                          axisLine={false}
                          className="fill-slate-500"
                        />

                        <YAxis
                          allowDecimals={false}
                          tick={{
                            fontSize: 12,
                          }}
                          tickLine={false}
                          axisLine={false}
                          className="fill-slate-500"
                        />

                        <Tooltip
                          contentStyle={{
                            borderRadius:
                              "12px",
                            border:
                              "1px solid #e2e8f0",
                            background:
                              "white",
                          }}
                          formatter={(
                            value,
                            name
                          ) => {
                            if (
                              name ===
                              "actual"
                            ) {
                              return [
                                value,
                                "Actual",
                              ];
                            }

                            if (
                              name ===
                              "predicted"
                            ) {
                              return [
                                value,
                                "Predicted",
                              ];
                            }

                            if (
                              name ===
                              "lowerBound"
                            ) {
                              return [
                                value,
                                "Lower range",
                              ];
                            }

                            if (
                              name ===
                              "upperBound"
                            ) {
                              return [
                                value,
                                "Upper range",
                              ];
                            }

                            return [
                              value,
                              name,
                            ];
                          }}
                        />

                        {/* Actual activity */}

                        <Line
                          type="monotone"
                          dataKey="actual"
                          stroke="currentColor"
                          className="text-slate-500 dark:text-slate-400"
                          strokeWidth={2.5}
                          dot={{
                            r: 3,
                          }}
                          activeDot={{
                            r: 5,
                          }}
                          connectNulls={false}
                        />

                        {/* Predicted activity */}

                        <Line
                          type="monotone"
                          dataKey="predicted"
                          stroke="currentColor"
                          className="text-emerald-500"
                          strokeWidth={3}
                          dot={{
                            r: 3,
                          }}
                          activeDot={{
                            r: 5,
                          }}
                          connectNulls={false}
                        />

                        {/* Lower expected range */}

                        <Line
                          type="monotone"
                          dataKey="lowerBound"
                          stroke="currentColor"
                          className="text-slate-300 dark:text-slate-700"
                          strokeWidth={1}
                          strokeDasharray="5 5"
                          dot={false}
                        />

                        {/* Upper expected range */}

                        <Line
                          type="monotone"
                          dataKey="upperBound"
                          stroke="currentColor"
                          className="text-slate-300 dark:text-slate-700"
                          strokeWidth={1}
                          strokeDasharray="5 5"
                          dot={false}
                        />

                      </LineChart>
                    </ResponsiveContainer>

                  </div>

                  {/* Forecast statistics */}

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">

                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">

                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Forecast trend
                      </p>

                      <p className="mt-1 font-semibold">
                        {forecastTrendLabel}
                      </p>

                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">

                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Daily trend
                      </p>

                      <p className="mt-1 font-semibold">
                        {forecastDailyTrend >=
                        0
                          ? "+"
                          : ""}
                        {forecastDailyTrend.toFixed(
                          1
                        )}{" "}
                        events/day
                      </p>

                    </div>

                    <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900">

                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Forecast horizon
                      </p>

                      <p className="mt-1 font-semibold">
                        7 days
                      </p>

                    </div>

                  </div>
                </>
              )}

            </div>

          </section>

          {/* ==================================================
              Anomaly Detection
              ================================================== */}

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">

            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between md:p-6 dark:border-slate-800">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                  <AlertTriangle className="h-5 w-5" />
                </div>

                <div>

                  <h2 className="font-semibold">
                    Anomaly Detection
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Unusual changes in daily product activity
                  </p>

                </div>

              </div>

              {!loading && (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {anomalies.length}{" "}
                  {anomalies.length === 1
                    ? "anomaly"
                    : "anomalies"}{" "}
                  detected
                </span>
              )}

            </div>

            <div className="p-5 md:p-6">

              {loading ? (
                <div className="space-y-3">

                  {[1, 2, 3].map(
                    (item) => (
                      <div
                        key={item}
                        className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-900"
                      />
                    )
                  )}

                </div>
              ) : anomalies.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">

                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <BarChart3 className="h-5 w-5" />
                  </div>

                  <p className="mt-3 font-medium">
                    No significant anomalies detected
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Activity is currently within the expected range.
                  </p>

                </div>
              ) : (
                <div className="space-y-3">

                  {anomalies.map(
                    (anomaly) => (
                      <div
                        key={`${anomaly.date}-${anomaly.type}`}
                        className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800"
                      >

                        <div className="flex min-w-0 items-center gap-3">

                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              anomaly.type ===
                              "spike"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                                : "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                            }`}
                          >
                            {anomaly.type ===
                            "spike" ? (
                              <ArrowUpRight className="h-4 w-4" />
                            ) : (
                              <ArrowDownRight className="h-4 w-4" />
                            )}
                          </div>

                          <div className="min-w-0">

                            <p className="font-medium">
                              {anomaly.type ===
                              "spike"
                                ? "Activity spike"
                                : "Activity drop"}
                            </p>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {formatDate(
                                anomaly.date
                              )}
                            </p>

                          </div>

                        </div>

                        <div className="flex flex-wrap items-center gap-3">

                          <div className="text-sm">
                            <span className="font-semibold">
                              {anomaly.eventCount}
                            </span>{" "}
                            events
                            <span className="mx-1 text-slate-400">
                              vs
                            </span>
                            <span className="text-slate-500 dark:text-slate-400">
                              {anomaly.expectedCount}{" "}
                              expected
                            </span>
                          </div>

                          <div
                            className={`font-semibold ${
                              anomaly.type ===
                              "spike"
                                ? "text-emerald-600 dark:text-emerald-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                          >
                            {formatChange(
                              anomaly.changePercent
                            )}
                          </div>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${getSeverityClasses(
                              anomaly.severity
                            )}`}
                          >
                            {anomaly.severity}
                          </span>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

          </section>

          {/* ==================================================
              Top Events + Recommended Action
              ================================================== */}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">

            {/* Top Events */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 dark:border-slate-800 dark:bg-slate-950">

              <div className="mb-5 flex items-center justify-between">

                <div>

                  <h2 className="font-semibold">
                    Top Event Activity
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Most frequently triggered events
                  </p>

                </div>

                <BarChart3 className="h-5 w-5 text-slate-400" />

              </div>

              {loading ? (
                <div className="space-y-4">

                  {[1, 2, 3].map(
                    (item) => (
                      <div
                        key={item}
                        className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900"
                      />
                    )
                  )}

                </div>
              ) : topEvents.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">
                  No event activity available.
                </p>
              ) : (
                <div className="space-y-4">

                  {topEvents.map(
                    (event) => (
                      <div key={event.name}>

                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">

                          <span className="truncate font-medium">
                            {event.name}
                          </span>

                          <span className="shrink-0 text-slate-500 dark:text-slate-400">
                            {event.count}
                          </span>

                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{
                              width: `${Math.min(
                                event.percentage,
                                100
                              )}%`,
                            }}
                          />

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </section>

            {/* Recommended Action */}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6 dark:border-slate-800 dark:bg-slate-950">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div>

                  <h2 className="font-semibold">
                    Recommended Action
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Based on the current analytics
                  </p>

                </div>

              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">

                <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {loading
                    ? "Analyzing your product activity..."
                    : recommendedAction}
                </p>

              </div>

            </section>

          </div>

          {/* ==================================================
              Analytics Engine Notice
              ================================================== */}

          <div className="mt-6 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">

            <strong className="font-medium text-slate-700 dark:text-slate-300">
              Analytics engine:
            </strong>{" "}
            Insights currently use deterministic analytics,
            rolling-baseline anomaly detection, and trend-based
            forecasting. Future versions can add machine-learning
            forecasting and LLM-generated explanations.

          </div>

        </main>

      </div>

    </div>
  );
}