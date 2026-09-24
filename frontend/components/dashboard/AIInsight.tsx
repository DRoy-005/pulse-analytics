"use client";

// ============================================================
// AIInsight
// ============================================================
//
// Displays an AI-generated observation about product analytics.
//
// Currently this contains placeholder insight text.
// Later, the insight will be generated from our analytics
// pipeline and AI/ML services.
//
// ============================================================

import { Sparkles } from "lucide-react";

// ============================================================
// AIInsight Component
// ============================================================

export function AIInsight() {
  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6 dark:border-emerald-900 dark:bg-emerald-950/20">

      {/* ======================================================
          Insight Container
          ====================================================== */}

      <div className="flex flex-col gap-5 md:flex-row md:items-start">

        {/* ====================================================
            AI Icon
            ==================================================== */}

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
          <Sparkles size={20} />
        </div>

        {/* ====================================================
            Insight Content
            ==================================================== */}

        <div className="flex-1">

          {/* Small section label */}
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            AI insight
          </p>

          {/* Insight title */}
          <h3 className="mt-1.5 text-base font-semibold text-slate-950 dark:text-white">
            Your user engagement is trending upward
          </h3>

          {/* Insight description */}
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">
            User activity increased by 12.1% compared with the
            previous period. The largest increase came from
            product views and signup events. Consider analyzing
            the user journey between these events to identify
            opportunities for improving conversion.
          </p>

          {/* Future insights page */}
          <button className="mt-4 text-sm font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300">
            View detailed insights →
          </button>

        </div>
      </div>
    </section>
  );
}