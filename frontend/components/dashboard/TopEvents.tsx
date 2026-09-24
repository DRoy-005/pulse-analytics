"use client";

// ============================================================
// TopEvents
// ============================================================
//
// Displays the events that are triggered most frequently.
//
// For now, the component uses mock data.
// Later, this will be calculated from the actual events stored
// in our PostgreSQL database.
//
// ============================================================

import { MousePointerClick } from "lucide-react";

// ============================================================
// Temporary Top Event Data
// ============================================================

const topEvents = [
  {
    name: "page_view",
    count: "18,429",
    percentage: 82,
  },
  {
    name: "button_click",
    count: "9,284",
    percentage: 64,
  },
  {
    name: "product_view",
    count: "6,742",
    percentage: 48,
  },
  {
    name: "signup",
    count: "4,218",
    percentage: 31,
  },
];

// ============================================================
// TopEvents Component
// ============================================================

export function TopEvents() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">

      {/* ======================================================
          Section Header
          ====================================================== */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">
            Top events
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Most frequently triggered events
          </p>
        </div>

        {/* Section icon */}
        <MousePointerClick
          size={18}
          className="text-slate-400"
        />
      </div>

      {/* ======================================================
          Event List
          ====================================================== */}

      <div className="space-y-5">
        {topEvents.map((event) => (
          <div key={event.name}>

            {/* Event name + event count */}
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                {event.name}
              </span>

              <span className="text-xs font-medium text-slate-500">
                {event.count}
              </span>
            </div>

            {/* ==================================================
                Progress Bar
                ==================================================
                
                The width represents the relative activity of
                each event.
                
                ================================================== */}

            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{
                  width: `${event.percentage}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}