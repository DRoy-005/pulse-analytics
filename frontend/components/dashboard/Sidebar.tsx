"use client";

// ============================================================
// Sidebar
// ============================================================
//
// Main navigation sidebar for PulseAnalytics.
//
// Responsibilities:
// 1. Display the PulseAnalytics logo
// 2. Display analytics navigation
// 3. Display workspace navigation
// 4. Display workspace information
// 5. Handle the mobile sidebar open/close state
//
// Later, the navigation buttons will become real Next.js links.
//
// ============================================================

import {
  Activity,
  BarChart3,
  CircleHelp,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  MousePointerClick,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";

// ============================================================
// Navigation Items
// ============================================================

const navItems = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    active: true,
  },
  {
    label: "Realtime",
    icon: Activity,
    active: false,
  },
  {
    label: "Events",
    icon: MousePointerClick,
    active: false,
  },
  {
    label: "Segments",
    icon: Users,
    active: false,
  },
  {
    label: "Reports",
    icon: FileBarChart,
    active: false,
  },
  {
    label: "Insights",
    icon: Sparkles,
    active: false,
  },
];

// ============================================================
// Secondary Navigation
// ============================================================

const secondaryNav = [
  {
    label: "Settings",
    icon: Settings,
  },
  {
    label: "Help & Support",
    icon: CircleHelp,
  },
];

// ============================================================
// Sidebar Props
// ============================================================

interface SidebarProps {
  mobileMenuOpen: boolean;
  onClose: () => void;
}

// ============================================================
// Sidebar Component
// ============================================================

export function Sidebar({
  mobileMenuOpen,
  onClose,
}: SidebarProps) {
  return (
    <>
      {/* ======================================================
          Mobile Overlay
          ====================================================== */}

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* ======================================================
          Sidebar
          ====================================================== */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-slate-800 dark:bg-slate-950 ${
          mobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* ==================================================
            Logo
            ================================================== */}

        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex items-center gap-2.5">

            {/* Logo icon */}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <BarChart3 size={19} />
            </div>

            {/* Product name */}
            <span className="text-lg font-semibold tracking-tight">
              PulseAnalytics
            </span>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
            aria-label="Close navigation menu"
          >
            <X size={19} />
          </button>
        </div>

        {/* ==================================================
            Navigation
            ================================================== */}

        <nav className="flex-1 px-3 py-5">

          {/* Analytics navigation */}
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Analytics
          </p>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                  />

                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* ==================================================
              Workspace Navigation
              ================================================== */}

          <p className="mb-2 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <div className="space-y-1">
            {secondaryNav.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                >
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                  />

                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* ==================================================
            Workspace Information
            ================================================== */}

        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">

            <div className="flex items-center gap-3">

              {/* Workspace avatar */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                DR
              </div>

              {/* Workspace information */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  Demo Workspace
                </p>

                <p className="truncate text-xs text-slate-500">
                  Free plan
                </p>
              </div>

              {/* Logout button */}
              <button
                className="text-slate-400 hover:text-slate-600"
                aria-label="Log out"
              >
                <LogOut size={16} />
              </button>

            </div>
          </div>
        </div>
      </aside>
    </>
  );
}