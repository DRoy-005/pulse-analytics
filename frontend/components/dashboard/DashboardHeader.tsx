"use client";

// ============================================================
// Dashboard Header
// ============================================================
//
// Top navigation/header area for the dashboard.
//
// Responsibilities:
// 1. Open the mobile sidebar
// 2. Display notifications
// 3. Display the current user/workspace avatar
//
// The actual navigation sidebar is handled separately by
// Sidebar.tsx.
//
// ============================================================

import {
  Bell,
  ChevronDown,
  Menu,
} from "lucide-react";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({
  onMenuClick,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6 dark:border-slate-800 dark:bg-slate-950/95">

      {/* ======================================================
          Mobile Menu Button
          ====================================================== */}

      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Open navigation menu"
      >
        <Menu size={21} />
      </button>

      {/* ======================================================
          Right-side Header Actions
          ====================================================== */}

      <div className="ml-auto flex items-center gap-2 md:gap-4">

        {/* Notifications */}

        <button
          className="relative rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Notifications"
        >
          <Bell size={19} />

          {/* Small indicator showing unread notifications */}

          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </button>

        {/* User menu */}

        <button
          className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open user menu"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            DR
          </div>

          <ChevronDown
            size={15}
            className="hidden text-slate-400 sm:block"
          />
        </button>
      </div>
    </header>
  );
}