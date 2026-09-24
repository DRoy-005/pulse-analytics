import {
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";

// ============================================================
// MetricCard
// ============================================================
//
// Reusable card used to display an important analytics metric.
//
// Example:
// Total users → 12,430 → +8.4%
//
// Later, the values will come from our backend instead of
// being hardcoded.
//

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  positive?: boolean;
  icon: React.ElementType;
}

export function MetricCard({
  title,
  value,
  change,
  positive = true,
  icon: Icon,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">

      {/* Metric title + icon */}
      <div className="flex items-start justify-between">

        <div>
          {/* Name of the metric */}
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          {/* Main metric value */}
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
            {value}
          </h3>
        </div>

        {/* Metric icon */}
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
          <Icon size={19} strokeWidth={2} />
        </div>
      </div>

      {/* Percentage change */}
      <div className="mt-4 flex items-center gap-2 text-xs">

        <span
          className={`flex items-center gap-1 font-medium ${
            positive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-500"
          }`}
        >
          {/* Change arrow */}
          {positive ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}

          {change}
        </span>

        {/* Comparison period */}
        <span className="text-slate-400">
          vs previous period
        </span>
      </div>
    </div>
  );
}