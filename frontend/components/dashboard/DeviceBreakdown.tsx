"use client";

// ============================================================
// DeviceBreakdown
// ============================================================
//
// Shows which device types are generating analytics activity.
//
// Current data is temporary mock data.
// Later this will be calculated from real event data.
//
// ============================================================

import {
  Cpu,
  Database,
  Smartphone,
} from "lucide-react";

// ============================================================
// Temporary Device Data
// ============================================================

const devices = [
  {
    name: "Desktop",
    percentage: 58,
    count: "24,876",
    icon: Cpu,
  },
  {
    name: "Mobile",
    percentage: 34,
    count: "14,562",
    icon: Smartphone,
  },
  {
    name: "Tablet",
    percentage: 8,
    count: "3,453",
    icon: Database,
  },
];

// ============================================================
// DeviceBreakdown Component
// ============================================================

export function DeviceBreakdown() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">

      {/* ======================================================
          Section Header
          ====================================================== */}

      <div className="mb-6">
        <h2 className="text-base font-semibold">
          Devices
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Where your users are accessing from
        </p>
      </div>

      {/* ======================================================
          Device List
          ====================================================== */}

      <div className="space-y-5">
        {devices.map((device) => {
          const Icon = device.icon;

          return (
            <div
              key={device.name}
              className="flex items-center gap-4"
            >

              {/* Device icon */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                <Icon size={18} />
              </div>

              {/* Device information */}
              <div className="min-w-0 flex-1">

                {/* Device name + event count */}
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {device.name}
                  </span>

                  <span className="text-xs text-slate-500">
                    {device.count}
                  </span>
                </div>

                {/* Usage progress bar */}
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{
                      width: `${device.percentage}%`,
                    }}
                  />
                </div>
              </div>

              {/* Percentage */}
              <span className="w-10 text-right text-xs font-medium text-slate-500">
                {device.percentage}%
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}