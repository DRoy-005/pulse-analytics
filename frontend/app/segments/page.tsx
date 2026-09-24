// ============================================================
// Segments Page
// ============================================================
//
// User segmentation workspace.
//
// Later this page will support:
// - Creating segments
// - Saving segment definitions
// - Combining conditions
// - Segment analytics
// - User counts
//
// ============================================================

import {
  Plus,
  Users,
} from "lucide-react";

const segments = [
  {
    name: "Active users",
    description: "Users active in the last 7 days",
    users: "8,284",
  },
  {
    name: "Power users",
    description: "Users with more than 20 sessions",
    users: "2,184",
  },
  {
    name: "Trial users",
    description: "Users currently on a trial",
    users: "1,492",
  },
];

export default function SegmentsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-900 dark:text-white">

      <header className="border-b border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-950 md:px-8">
        <div className="mx-auto max-w-[1600px]">

          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            User analysis
          </p>

          <div className="mt-1 flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>
              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Segments
              </h1>

              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                Understand different groups of users.
              </p>
            </div>

            <button className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">
              <Plus size={16} />
              Create segment
            </button>

          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] p-4 md:p-8">

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

          {segments.map((segment) => (
            <div
              key={segment.name}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >

              <div className="flex items-start justify-between">

                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <Users size={20} />
                </div>

                <span className="text-xs text-slate-400">
                  Saved segment
                </span>

              </div>

              <h2 className="mt-5 font-semibold">
                {segment.name}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {segment.description}
              </p>

              <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">

                <p className="text-2xl font-semibold">
                  {segment.users}
                </p>

                <p className="text-xs text-slate-500">
                  users
                </p>

              </div>

            </div>
          ))}

        </div>

      </main>
    </div>
  );
}