"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ============================================================
// TrafficChart
// ============================================================
//
// Displays the website/application traffic over time.
//
// For now, the chart uses temporary mock data.
// Later, this data will come from our analytics backend.
//

const trafficData = [
  { name: "Mon", users: 1200 },
  { name: "Tue", users: 1800 },
  { name: "Wed", users: 1500 },
  { name: "Thu", users: 2400 },
  { name: "Fri", users: 2100 },
  { name: "Sat", users: 2800 },
  { name: "Sun", users: 3200 },
];

export function TrafficChart() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      
      {/* ======================================================
          Chart Header
          ====================================================== */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950 dark:text-white">
            Traffic overview
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            User activity over the selected period
          </p>
        </div>

        {/* Current period indicator */}
        <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
          Last 7 days
        </span>
      </div>

      {/* ======================================================
          Chart
          ====================================================== */}

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={trafficData}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            {/* Background grid */}
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              className="stroke-slate-200 dark:stroke-slate-800"
            />

            {/* X-axis */}
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
              }}
              className="fill-slate-400"
            />

            {/* Y-axis */}
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{
                fontSize: 12,
              }}
              className="fill-slate-400"
            />

            {/* Hover information */}
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />

            {/* Traffic area */}
            <Area
              type="monotone"
              dataKey="users"
              stroke="#059669"
              strokeWidth={2}
              fill="#10b981"
              fillOpacity={0.12}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}