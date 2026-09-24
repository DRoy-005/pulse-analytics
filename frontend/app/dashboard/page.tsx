"use client";

// ============================================================
// Dashboard Page
// ============================================================
//
// Main analytics dashboard for PulseAnalytics.
//
// The page is responsible for:
// 1. Managing dashboard-level state
// 2. Rendering the dashboard layout
// 3. Combining reusable dashboard components
//
// Individual UI sections are kept in separate components.
//
// ============================================================

import { useState } from "react";

import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronDown,
  MousePointerClick,
  Users,
} from "lucide-react";

// ============================================================
// Reusable Dashboard Components
// ============================================================

import { AIInsight } from "@/components/dashboard/AIInsight";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DeviceBreakdown } from "@/components/dashboard/DeviceBreakdown";
import { LiveActivity } from "@/components/dashboard/LiveActivity";
import { LocationBreakdown } from "@/components/dashboard/LocationBreakdown";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopEvents } from "@/components/dashboard/TopEvents";
import { TrafficChart } from "@/components/dashboard/TrafficChart";

// ============================================================
// Dashboard Page
// ============================================================

export default function DashboardPage() {
  // Controls whether the mobile sidebar is visible.

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-900 dark:text-white">

      {/* ======================================================
          Sidebar
          ====================================================== */}

      <Sidebar
        mobileMenuOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* ======================================================
          Main Application Area
          ====================================================== */}

      <div className="lg:pl-64">

        {/* ====================================================
            Dashboard Header
            ==================================================== */}

        <DashboardHeader
          onMenuClick={() => setMobileMenuOpen(true)}
        />

        {/* ====================================================
            Dashboard Content
            ==================================================== */}

        <main className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">

          {/* ==================================================
              Page Introduction
              ================================================== */}

          <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>
              <p className="mb-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Analytics overview
              </p>

              <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Good morning 👋
              </h1>

              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                Here&apos;s what&apos;s happening with your product today.
              </p>
            </div>

            {/* Date range selector */}

            <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900">
              <CalendarDays size={16} />

              <span>Last 7 days</span>

              <ChevronDown
                size={15}
                className="text-slate-400"
              />
            </button>
          </div>

          {/* ==================================================
              KPI Metrics
              ================================================== */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <MetricCard
              title="Total users"
              value="12,430"
              change="+8.4%"
              icon={Users}
            />

            <MetricCard
              title="Total events"
              value="42,891"
              change="+12.1%"
              icon={MousePointerClick}
            />

            <MetricCard
              title="Active sessions"
              value="8,284"
              change="+6.8%"
              icon={Activity}
            />

            <MetricCard
              title="Conversion rate"
              value="8.42%"
              change="+2.1%"
              icon={BarChart3}
            />

          </div>

          {/* ==================================================
              Traffic Overview
              ================================================== */}

          <div className="mt-6">
            <TrafficChart />
          </div>

          {/* ==================================================
              Live Activity + Top Events
              ================================================== */}

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <LiveActivity />
            <TopEvents />
          </div>

          {/* ==================================================
              Device + Location Breakdown
              ================================================== */}

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <DeviceBreakdown />
            <LocationBreakdown />
          </div>

          {/* ==================================================
              AI Insight
              ================================================== */}

          <AIInsight />

        </main>
      </div>
    </div>
  );
}