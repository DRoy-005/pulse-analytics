"use client";

// ============================================================
// Sidebar
// ============================================================
//
// Main navigation sidebar for PulseAnalytics.
//
// Responsibilities:
// 1. Display the PulseAnalytics logo
// 2. Navigate between analytics pages
// 3. Highlight the currently active page
// 4. Display workspace navigation
// 5. Handle the mobile sidebar open/close state
//
// ============================================================

import Link from "next/link";
import { usePathname } from "next/navigation";

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
// Main Navigation
// ============================================================

const navItems = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Realtime",
    icon: Activity,
    href: "/realtime",
  },
  {
    label: "Events",
    icon: MousePointerClick,
    href: "/events",
  },
  {
    label: "Segments",
    icon: Users,
    href: "/segments",
  },
  {
    label: "Reports",
    icon: FileBarChart,
    href: "/reports",
  },
  {
    label: "Insights",
    icon: Sparkles,
    href: "/insights",
  },
];

// ============================================================
// Secondary Navigation
// ============================================================

const secondaryNav = [
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    label: "Help & Support",
    icon: CircleHelp,
    href: "/help",
  },
];

// ============================================================
// Component Props
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
  // usePathname() gives us the current URL path.
  //
  // Example:
  // /dashboard -> Overview is active
  // /events    -> Events is active
  // /insights  -> Insights is active

  const pathname = usePathname();

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
        {/* ====================================================
            Sidebar Header
            ==================================================== */}

        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">

          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <BarChart3 size={19} />
            </div>

            <span className="text-lg font-semibold tracking-tight">
              PulseAnalytics
            </span>
          </Link>

          {/* Mobile close button */}

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
            aria-label="Close navigation menu"
          >
            <X size={19} />
          </button>
        </div>

        {/* ====================================================
            Navigation
            ==================================================== */}

        <nav className="flex-1 overflow-y-auto px-3 py-5">

          {/* Analytics */}

          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Analytics
          </p>

          <div className="space-y-1">

            {navItems.map((item) => {
              const Icon = item.icon;

              // Only mark the exact dashboard route as active.
              //
              // This prevents /dashboard from being active when
              // we eventually create nested dashboard routes.

              const isActive =
                pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  aria-current={
                    isActive ? "page" : undefined
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}

          </div>

          {/* Workspace */}

          <p className="mb-2 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <div className="space-y-1">

            {secondaryNav.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  aria-current={
                    isActive ? "page" : undefined
                  }
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}

          </div>
        </nav>

        {/* ====================================================
            Workspace / User Section
            ==================================================== */}

        <div className="border-t border-slate-200 p-3 dark:border-slate-800">

          <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">

            <div className="flex items-center gap-3">

              {/* Avatar */}

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

              {/* Logout */}

              <button
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
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