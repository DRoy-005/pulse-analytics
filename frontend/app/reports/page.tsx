// ============================================================
// Reports Page
// ============================================================
//
// Reporting workspace.
//
// Later this will support:
// - Custom reports
// - Scheduled reports
// - CSV/PDF exports
// - Date ranges
// - Report sharing
//
// ============================================================

import {
  Download,
  FileBarChart,
  Plus,
} from "lucide-react";

const reports = [
  {
    name: "Weekly product overview",
    period: "Last 7 days",
    updated: "Today",
  },
  {
    name: "Monthly engagement report",
    period: "Last 30 days",
    updated: "Yesterday",
  },
  {
    name: "Conversion performance",
    period: "Last 30 days",
    updated: "2 days ago",
  },
];

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-900 dark:text-white">

      <header className="border-b border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-950 md:px-8">
        <div className="mx-auto max-w-[1600px]">

          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Analytics reporting
          </p>

          <div className="mt-1 flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Reports
              </h1>

              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                Generate and export product analytics reports.
              </p>
            </div>

            <button className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">
              <Plus size={16} />
              Create report
            </button>

          </div>

        </div>
      </header>

      <main className="mx-auto max-w-[1600px] p-4 md:p-8">

        <div className="space-y-3">

          {reports.map((report) => (
            <div
              key={report.name}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:flex-row md:items-center"
            >

              <div className="flex flex-1 items-center gap-4">

                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <FileBarChart size={20} />
                </div>

                <div>
                  <h2 className="font-medium">
                    {report.name}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {report.period} · Updated {report.updated}
                  </p>
                </div>

              </div>

              <button className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
                <Download size={16} />
                Export
              </button>

            </div>
          ))}

        </div>

      </main>
    </div>
  );
}