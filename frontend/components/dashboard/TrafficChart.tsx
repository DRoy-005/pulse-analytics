"use client";

// ============================================================
// Traffic Chart
// ============================================================
//
// Displays real event traffic retrieved from the
// PulseAnalytics backend.
//
// The chart uses the authenticated user's workspace
// instead of a hardcoded workspace ID.
//
// ============================================================

import { useEffect, useState } from "react";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ============================================================
// Authentication
// ============================================================

import { useAuth } from "@/context/AuthContext";

// ============================================================
// API
// ============================================================

import {
  getTrafficData,
  type TrafficDataPoint,
} from "@/lib/api";

// ============================================================
// Component
// ============================================================

export function TrafficChart({
  days,
}: {
  days: number;
}) {
  // ----------------------------------------------------------
  // Get authenticated workspace
  // ----------------------------------------------------------

  const {
    workspace,
    loading: authLoading,
  } = useAuth();

  // ----------------------------------------------------------
  // Traffic data
  // ----------------------------------------------------------

  const [data, setData] = useState<
    TrafficDataPoint[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // ----------------------------------------------------------
  // Load traffic data
  // ----------------------------------------------------------

  useEffect(() => {
    // Authentication is still being restored.
    // Wait until AuthContext finishes.
    if (authLoading || !workspace) {
      return;
    }

    // Store the workspace ID locally.
    // TypeScript now knows this is a string.
    const workspaceId = workspace.id;

    async function loadTraffic() {
      try {
        setError(null);

        const response =
          await getTrafficData(
            workspaceId,
            days
          );

        setData(response.data);
      } catch (error) {
        console.error(
          "Failed to load traffic:",
          error
        );

        setError(
          "Unable to load traffic data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadTraffic();
  }, [
    workspace,
    authLoading,
    days,
  ]);

  // ----------------------------------------------------------
  // Format dates for the chart
  // ----------------------------------------------------------

  const chartData = data.map(
    (item) => ({
      ...item,

      label: new Date(
        `${item.date}T00:00:00`
      ).toLocaleDateString(
        "en-US",
        {
          weekday: "short",
        }
      ),
    })
  );

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-6">

      {/* ====================================================
          Header
          ==================================================== */}

      <div className="mb-6 flex items-start justify-between">

        <div>
          <h2 className="text-base font-semibold">
            Event traffic
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Events recorded over the last {days} days
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Events
        </div>

      </div>

      {/* ====================================================
          Error
          ==================================================== */}

      {error && (
        <div className="flex h-[280px] items-center justify-center text-sm text-red-500">
          {error}
        </div>
      )}

      {/* ====================================================
          Loading
          ==================================================== */}

      {loading && !error && (
        <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
          Loading traffic...
        </div>
      )}

      {/* ====================================================
          Empty State
          ==================================================== */}

      {!loading &&
        !error &&
        chartData.length === 0 && (
          <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">
            No traffic data available.
          </div>
        )}

      {/* ====================================================
          Chart
          ==================================================== */}

      {!loading &&
        !error &&
        chartData.length > 0 && (
          <div className="h-[280px] w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 10,
                  left: -20,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-slate-200 dark:stroke-slate-800"
                />

                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                  }}
                  className="fill-slate-500"
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tick={{
                    fontSize: 12,
                  }}
                  className="fill-slate-500"
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    backgroundColor: "white",
                  }}
                  formatter={(value) => [
                    value,
                    "Events",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="events"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{
                    r: 5,
                  }}
                />

              </LineChart>
            </ResponsiveContainer>

          </div>
        )}

    </div>
  );
}