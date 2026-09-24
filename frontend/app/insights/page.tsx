// ============================================================
// Insights Page
// ============================================================
//
// AI-powered analytics workspace.
//
// Later this page will connect to the Python analytics/ML
// service for:
// - Anomaly detection
// - Forecasting
// - Predictive insights
// - Automated reports
//
// ============================================================

import {
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const insights = [
  {
    title: "Traffic increased significantly",
    description:
      "Daily active users have increased compared with the previous period.",
    type: "Trend",
    icon: TrendingUp,
  },
  {
    title: "Checkout activity changed",
    description:
      "The checkout_started event shows an unusual change in recent activity.",
    type: "Anomaly",
    icon: AlertTriangle,
  },
  {
    title: "Engagement opportunity",
    description:
      "Returning users are showing higher feature usage than new users.",
    type: "Prediction",
    icon: Sparkles,
  },
];

export default function InsightsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-900 dark:text-white">

      <header className="border-b border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-950 md:px-8">
        <div className="mx-auto max-w-[1600px]">

          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            AI analytics
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            Insights
          </h1>

          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Discover important patterns and changes in your product data.
          </p>

        </div>
      </header>

      <main className="mx-auto max-w-[1600px] p-4 md:p-8">

        <div className="grid gap-4 lg:grid-cols-3">

          {insights.map((insight) => {
            const Icon = insight.icon;

            return (
              <div
                key={insight.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
              >

                <div className="flex items-start justify-between">

                  <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    <Icon size={20} />
                  </div>

                  <ArrowUpRight
                    size={17}
                    className="text-slate-400"
                  />

                </div>

                <p className="mt-5 text-xs font-medium uppercase tracking-wider text-slate-400">
                  {insight.type}
                </p>

                <h2 className="mt-1 font-semibold">
                  {insight.title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {insight.description}
                </p>

              </div>
            );
          })}

        </div>

      </main>
    </div>
  );
}