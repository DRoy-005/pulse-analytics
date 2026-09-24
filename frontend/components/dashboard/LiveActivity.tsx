"use client";

// ============================================================
// LiveActivity
// ============================================================
//
// Displays the most recent events happening in the product.
//
// For now, the events are mock data.
// Later, this component will receive real-time events from
// our backend using WebSockets / Socket.IO.
//
// ============================================================

import {
  Activity,
  MousePointerClick,
} from "lucide-react";

// ============================================================
// Temporary Event Data
// ============================================================
//
// Later this will come from the backend.
//

const recentEvents = [
  {
    event: "Page Viewed",
    user: "user_1024",
    location: "Kolkata, IN",
    time: "Just now",
  },
  {
    event: "Button Clicked",
    user: "user_871",
    location: "Mumbai, IN",
    time: "2 min ago",
  },
  {
    event: "Signup Completed",
    user: "user_654",
    location: "Delhi, IN",
    time: "4 min ago",
  },
  {
    event: "Product Viewed",
    user: "user_441",
    location: "Bangalore, IN",
    time: "7 min ago",
  },
  {
    event: "Checkout Started",
    user: "user_328",
    location: "Pune, IN",
    time: "9 min ago",
  },
];

// ============================================================
// LiveActivity Component
// ============================================================

export function LiveActivity() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">

      {/* ======================================================
          Section Header
          ====================================================== */}

      <div className="mb-5 flex items-center justify-between">
        <div>
          {/* Title + live indicator */}
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold">
              Live activity
            </h2>

            {/* Indicates that events are being received live */}
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live
            </span>
          </div>

          {/* Description */}
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Latest events from your users
          </p>
        </div>

        {/* Activity icon */}
        <Activity
          size={18}
          className="text-slate-400"
        />
      </div>

      {/* ======================================================
          Event List
          ====================================================== */}

      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {recentEvents.map((event, index) => (
          <div
            key={`${event.user}-${index}`}
            className="flex items-center gap-3 py-3.5"
          >
            {/* Event icon */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <MousePointerClick size={16} />
            </div>

            {/* Event information */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {event.event}
              </p>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                {event.user} · {event.location}
              </p>
            </div>

            {/* Time since event occurred */}
            <span className="shrink-0 text-xs text-slate-400">
              {event.time}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}