"use client";

// ============================================================
// PulseAnalytics Sidebar
// ============================================================
//
// Responsibilities:
//
// 1. Display the PulseAnalytics logo
// 2. Display primary workspace navigation
// 3. Highlight the currently active page
// 4. Support mobile navigation
// 5. Show upcoming features as "SOON"
// 6. Display the current authenticated workspace
//
// ============================================================

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Activity,
  ChevronRight,
  CircleHelp,
  FileText,
  LayoutDashboard,
  Lightbulb,
  Settings,
  Sparkles,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

// ============================================================
// Types
// ============================================================

interface SidebarProps {
  mobileMenuOpen: boolean;
  onClose: () => void;
}

// ============================================================
// Primary navigation
// ============================================================

const navigationItems = [
  {
    label: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Realtime",
    href: "/realtime",
    icon: Activity,
  },
  {
    label: "Events",
    href: "/events",
    icon: Activity,
  },
  {
    label: "Segments",
    href: "/segments",
    icon: Users,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    label: "Insights",
    href: "/insights",
    icon: Lightbulb,
  },
];

// ============================================================
// Secondary navigation
// ============================================================

const secondaryItems = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    soon: true,
  },
  {
    label: "Help & Support",
    href: "/help",
    icon: CircleHelp,
    soon: true,
  },
];

// ============================================================
// Sidebar Component
// ============================================================

export function Sidebar({
  mobileMenuOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  // ==========================================================
  // Authenticated workspace
  // ==========================================================

  const {
    workspace,
    loading: authLoading,
  } = useAuth();

  // ==========================================================
  // Determine whether a navigation item is active
  // ==========================================================

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href;
  }

  return (
    <>
      {/* ======================================================
          Mobile overlay
          ====================================================== */}

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden"
        />
      )}

      {/* ======================================================
          Sidebar
          ====================================================== */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex w-64 flex-col
          border-r border-slate-200
          bg-white
          transition-transform duration-200
          dark:border-slate-800
          dark:bg-slate-950
          lg:translate-x-0
          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* ==================================================
            Logo
            ================================================== */}

        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-sm font-bold text-white shadow-sm">
              P
            </div>

            <span className="text-base font-semibold tracking-tight text-slate-950 dark:text-white">
              PulseAnalytics
            </span>
          </Link>

          {/* Mobile close button */}

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-900"
            aria-label="Close navigation menu"
          >
            <X size={19} />
          </button>
        </div>

        {/* ==================================================
            Navigation
            ================================================== */}

        <div className="flex-1 overflow-y-auto px-3 py-5">
          {/* ------------------------------------------------
              Primary navigation
              ------------------------------------------------ */}

          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex w-full items-center gap-3
                    rounded-xl px-3 py-2.5
                    text-sm
                    transition-colors
                    ${
                      active
                        ? "bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                    }
                  `}
                >
                  <Icon size={18} />

                  <span className="flex-1">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* ==================================================
              Divider
              ================================================== */}

          <div className="my-5 border-t border-slate-200 dark:border-slate-800" />

          {/* ==================================================
              Secondary navigation
              ================================================== */}

          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {secondaryItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              if (item.soon) {
                return (
                  <div
                    key={item.label}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 dark:text-slate-500"
                  >
                    <Icon size={18} />

                    <span className="flex-1">
                      {item.label}
                    </span>

                    <span className="text-[11px] font-medium">
                      SOON
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex w-full items-center gap-3
                    rounded-xl px-3 py-2.5
                    text-sm
                    transition-colors
                    ${
                      active
                        ? "bg-emerald-50 font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                    }
                  `}
                >
                  <Icon size={18} />

                  <span className="flex-1">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ==================================================
            Authenticated Workspace Card
            ================================================== */}

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm dark:bg-slate-950 dark:text-slate-400">
              <Sparkles size={17} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {authLoading
                  ? "Loading workspace..."
                  : workspace?.name ||
                    "Workspace"}
              </p>

              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Free workspace
              </p>
            </div>

            <ChevronRight
              size={16}
              className="shrink-0 text-slate-400"
            />
          </button>
        </div>
      </aside>
    </>
  );
}