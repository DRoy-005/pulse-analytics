"use client";

// ============================================================
// LocationBreakdown
// ============================================================
//
// Shows the locations generating the most user activity.
//
// Current data is temporary mock data.
// Later this will be calculated from real analytics events.
//
// ============================================================

import { Globe2 } from "lucide-react";

// ============================================================
// Temporary Location Data
// ============================================================

const locations = [
  {
    city: "Kolkata",
    country: "India",
    users: "3,842",
  },
  {
    city: "Mumbai",
    country: "India",
    users: "3,214",
  },
  {
    city: "Bangalore",
    country: "India",
    users: "2,876",
  },
  {
    city: "Delhi",
    country: "India",
    users: "2,142",
  },
];

// ============================================================
// LocationBreakdown Component
// ============================================================

export function LocationBreakdown() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">

      {/* ======================================================
          Section Header
          ====================================================== */}

      <div className="mb-6">
        <h2 className="text-base font-semibold">
          Top locations
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Cities generating the most activity
        </p>
      </div>

      {/* ======================================================
          Location List
          ====================================================== */}

      <div className="space-y-3">
        {locations.map((location, index) => (
          <div
            key={location.city}
            className="flex items-center gap-4 rounded-xl border border-slate-100 p-3 dark:border-slate-800"
          >

            {/* Ranking number */}
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-500 dark:bg-slate-900">
              {index + 1}
            </span>

            {/* Location icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Globe2 size={16} />
            </div>

            {/* Location information */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">
                {location.city}
              </p>

              <p className="text-xs text-slate-500">
                {location.country}
              </p>
            </div>

            {/* User count */}
            <span className="text-sm font-semibold">
              {location.users}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}