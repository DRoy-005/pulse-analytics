"use client";

// ============================================================
// DeviceBreakdown
// ============================================================
//
// Shows which device types are generating analytics activity.
//
// Data is retrieved from the PulseAnalytics backend and is
// calculated from real sessions in the database.
//
// ============================================================

import { useEffect, useState } from "react";

import {
  Cpu,
  Database,
  Smartphone,
  Monitor,
} from "lucide-react";

import {
  getDeviceBreakdown,
  type DeviceBreakdownItem,
} from "@/lib/api";

import {
  CURRENT_WORKSPACE_ID,
} from "@/lib/workspace";

// ============================================================
// Device Icon
// ============================================================

function getDeviceIcon(
  deviceName: string
) {
  const name =
    deviceName.toLowerCase();

  if (name.includes("mobile")) {
    return Smartphone;
  }

  if (name.includes("tablet")) {
    return Database;
  }

  if (name.includes("desktop")) {
    return Cpu;
  }

  return Monitor;
}

// ============================================================
// DeviceBreakdown Component
// ============================================================

export function DeviceBreakdown({
  days,
}: {
  days: number;
}) {
  const [devices, setDevices] =
    useState<DeviceBreakdownItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadDevices() {
      try {
        setLoading(true);
        setError(null);

        const response =
          await getDeviceBreakdown(
            CURRENT_WORKSPACE_ID,
            days
          );

        setDevices(response.data);
      } catch (error) {
        console.error(
          "Failed to load device breakdown:",
          error
        );

        setError(
          "Unable to load device data."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDevices();
  }, []);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">

      {/* ======================================================
          Section Header
          ====================================================== */}

      <div className="mb-6">
        <h2 className="text-base font-semibold">
          Devices
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Where your users are accessing from
        </p>
      </div>

      {/* ======================================================
          Loading State
          ====================================================== */}

      {loading && (
        <div className="space-y-5">
          {Array.from({
            length: 3,
          }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4"
            >
              <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />

              <div className="min-w-0 flex-1">
                <div className="mb-2 flex justify-between">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />

                  <div className="h-3 w-10 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                </div>

                <div className="h-2 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
              </div>

              <div className="h-3 w-8 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      )}

      {/* ======================================================
          Error State
          ====================================================== */}

      {!loading && error && (
        <div className="flex min-h-[180px] items-center justify-center text-sm text-red-500">
          {error}
        </div>
      )}

      {/* ======================================================
          Empty State
          ====================================================== */}

      {!loading &&
        !error &&
        devices.length === 0 && (
          <div className="flex min-h-[180px] flex-col items-center justify-center text-center">
            <Monitor
              size={28}
              className="mb-3 text-slate-300 dark:text-slate-700"
            />

            <p className="text-sm font-medium">
              No device data yet
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Device information will appear
              when sessions are recorded.
            </p>
          </div>
        )}

      {/* ======================================================
          Device List
          ====================================================== */}

      {!loading &&
        !error &&
        devices.length > 0 && (
          <div className="space-y-5">
            {devices.map((device) => {
              const Icon =
                getDeviceIcon(device.name);

              return (
                <div
                  key={device.name}
                  className="flex items-center gap-4"
                >
                  {/* Device icon */}

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    <Icon size={18} />
                  </div>

                  {/* Device information */}

                  <div className="min-w-0 flex-1">

                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {device.name}
                      </span>

                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {device.count.toLocaleString(
                          "en-IN"
                        )}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{
                          width: `${device.percentage}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Percentage */}

                  <span className="w-10 text-right text-xs font-medium text-slate-500 dark:text-slate-400">
                    {device.percentage}%
                  </span>
                </div>
              );
            })}
          </div>
        )}
    </section>
  );
}