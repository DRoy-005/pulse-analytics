// ============================================================
// Realtime Analytics Page
// ============================================================
//
// Displays live product activity.
//
// This is currently the UI foundation.
// Real WebSocket/SSE data will be connected later.
//
// ============================================================

import {
  Activity,
  MousePointerClick,
  Users,
} from "lucide-react";

export default function RealtimePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-900 dark:text-white">

      {/* ======================================================
          Header
          ====================================================== */}

      <header className="border-b border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-950 md:px-8">
        <div className="mx-auto max-w-[1600px]">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Live analytics
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            Realtime
          </h1>

          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Monitor what is happening across your product right now.
          </p>
        </div>
      </header>

      {/* ======================================================
          Main Content
          ====================================================== */}

      <main className="mx-auto max-w-[1600px] p-4 md:p-8">

        {/* ====================================================
            Live Status
            ==================================================== */}

        <div className="mb-6 flex items-center gap-2 text-sm">

          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

          <span className="font-medium text-slate-700 dark:text-slate-300">
            Live
          </span>

          <span className="text-slate-400">
            Events are updating in real time
          </span>

        </div>

        {/* ====================================================
            Realtime Metrics
            ==================================================== */}

        <div className="grid gap-4 md:grid-cols-3">

          {/* Active users */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Active users
                </p>

                <p className="mt-2 text-3xl font-semibold">
                  1,284
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Users size={20} />
              </div>

            </div>
          </div>

          {/* Events per minute */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Events / minute
                </p>

                <p className="mt-2 text-3xl font-semibold">
                  342
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <Activity size={20} />
              </div>

            </div>
          </div>

          {/* Events today */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Events today
                </p>

                <p className="mt-2 text-3xl font-semibold">
                  42,891
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                <MousePointerClick size={20} />
              </div>

            </div>
          </div>

        </div>

        {/* ====================================================
            Live Event Stream
            ==================================================== */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">

          <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">

            <h2 className="font-semibold">
              Live event stream
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Incoming product events will appear here.
            </p>

          </div>

          <div className="p-5">

            <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">

              <div className="text-center">

                <Activity
                  size={28}
                  className="mx-auto text-slate-300 dark:text-slate-700"
                />

                <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                  Waiting for live events
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  WebSocket integration will be connected later.
                </p>

              </div>

            </div>

          </div>
        </div>

      </main>
    </div>
  );
}