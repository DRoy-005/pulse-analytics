// ============================================================
// Analytics Controller
// ============================================================
//
// Handles read-only analytics queries.
//
// Responsibilities:
// 1. Return paginated analytics events
// 2. Search events
// 3. Filter events
// 4. Return available event types
// 5. Calculate dashboard overview metrics
// 6. Calculate daily traffic
//
// ============================================================

import type { Request, Response } from "express";

import { prisma } from "../lib/prisma.js";

// ============================================================
// Get Events
// ============================================================
//
// GET /api/events
//
// Query parameters:
//
// workspaceId - required
// page        - page number, default 1
// limit       - events per page, default 10
// search      - searches event/user/page information
// eventName   - filter by event name
// deviceType  - filter by device type
// country     - filter by country
// startDate   - beginning of date range
// endDate     - end of date range
//
// ============================================================

export async function getEvents(
  req: Request,
  res: Response
) {
  try {
    const workspaceId =
      req.query.workspaceId as string | undefined;

    const requestedPage = Number(
      req.query.page ?? 1
    );

    const requestedLimit = Number(
      req.query.limit ?? 10
    );

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const eventName =
      typeof req.query.eventName === "string"
        ? req.query.eventName.trim()
        : "";

    const deviceType =
      typeof req.query.deviceType === "string"
        ? req.query.deviceType.trim()
        : "";

    const country =
      typeof req.query.country === "string"
        ? req.query.country.trim()
        : "";

    const startDate =
      typeof req.query.startDate === "string"
        ? req.query.startDate
        : "";

    const endDate =
      typeof req.query.endDate === "string"
        ? req.query.endDate
        : "";

    // --------------------------------------------------------
    // Validate workspace
    // --------------------------------------------------------

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "workspaceId is required.",
      });
    }

    // --------------------------------------------------------
    // Pagination
    // --------------------------------------------------------

    const page = Math.max(
      requestedPage || 1,
      1
    );

    const limit = Math.min(
      Math.max(requestedLimit || 10, 1),
      100
    );

    const skip = (page - 1) * limit;

    // --------------------------------------------------------
    // Search conditions
    // --------------------------------------------------------

    const searchConditions = search
      ? [
          {
            name: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            pageTitle: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            pageUrl: {
              contains: search,
              mode: "insensitive" as const,
            },
          },
          {
            user: {
              email: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          },
          {
            user: {
              externalId: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          },
        ]
      : undefined;

    // --------------------------------------------------------
    // Date filter
    // --------------------------------------------------------

    let timestampFilter:
      | {
          gte?: Date;
          lt?: Date;
        }
      | undefined;

    if (startDate || endDate) {
      timestampFilter = {};

      if (startDate) {
        const start = new Date(
          `${startDate}T00:00:00`
        );

        if (!Number.isNaN(start.getTime())) {
          timestampFilter.gte = start;
        }
      }

      if (endDate) {
        const end = new Date(
          `${endDate}T00:00:00`
        );

        if (!Number.isNaN(end.getTime())) {
          // Use the following day as an exclusive
          // upper boundary so the selected end date
          // is included completely.

          end.setDate(end.getDate() + 1);

          timestampFilter.lt = end;
        }
      }
    }

    // --------------------------------------------------------
    // Build Prisma query
    // --------------------------------------------------------

    const where = {
      workspaceId,

      ...(searchConditions
        ? {
            OR: searchConditions,
          }
        : {}),

      ...(eventName
        ? {
            name: eventName,
          }
        : {}),

      ...(deviceType || country
        ? {
            session: {
              ...(deviceType
                ? {
                    deviceType,
                  }
                : {}),

              ...(country
                ? {
                    country,
                  }
                : {}),
            },
          }
        : {}),

      ...(timestampFilter
        ? {
            timestamp: timestampFilter,
          }
        : {}),
    };

    // --------------------------------------------------------
    // Fetch events and total count
    // --------------------------------------------------------

    // --------------------------------------------------------
// Fetch events
// --------------------------------------------------------
// Keep these queries sequential so we do not create
// unnecessary simultaneous database connections.
// This is especially useful with Supabase connection pooling.
// --------------------------------------------------------

const events =
  await prisma.event.findMany({
    where,

    orderBy: {
      timestamp: "desc",
    },

    skip,
    take: limit,

    include: {
      user: {
        select: {
          id: true,
          externalId: true,
          email: true,
        },
      },

      session: {
        select: {
          id: true,
          deviceType: true,
          browser: true,
          operatingSystem: true,
          country: true,
          city: true,
        },
      },
    },
  });

// --------------------------------------------------------
// Count total matching events
// --------------------------------------------------------

const total =
  await prisma.event.count({
    where,
  });

    // --------------------------------------------------------
    // Pagination metadata
    // --------------------------------------------------------

    const totalPages = Math.max(
      1,
      Math.ceil(total / limit)
    );

    return res.json({
      success: true,

      data: events,

      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage:
          page < totalPages,
        hasPreviousPage:
          page > 1,
      },
    });
  } catch (error) {
    console.error(
      "Get events error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve events.",
    });
  }
}

// ============================================================
// Get Event Types
// ============================================================
//
// GET /api/events/types?workspaceId=...
//
// Returns the unique event names used by the workspace.
//
// ============================================================

// ============================================================
// Get Top Events
// ============================================================
//
// GET /api/analytics/top-events?workspaceId=...&days=7
//
// Returns the most frequently triggered event types during
// the requested period.
//
// ============================================================

export async function getTopEvents(
  req: Request,
  res: Response
) {
  try {
    const workspaceId =
      req.query.workspaceId as string | undefined;

    const requestedDays = Number(
      req.query.days ?? 7
    );

    const requestedLimit = Number(
      req.query.limit ?? 5
    );

    const days = Math.min(
      Math.max(requestedDays || 7, 1),
      90
    );

    const limit = Math.min(
      Math.max(requestedLimit || 5, 1),
      20
    );

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "workspaceId is required.",
      });
    }

    // --------------------------------------------------------
    // Calculate period start
    // --------------------------------------------------------

    const startDate = new Date();

    startDate.setDate(
      startDate.getDate() - days
    );

    // --------------------------------------------------------
    // Group events by event name
    // --------------------------------------------------------

    const groupedEvents =
      await prisma.event.groupBy({
        by: ["name"],

        where: {
          workspaceId,

          timestamp: {
            gte: startDate,
          },
        },

        _count: {
          name: true,
        },

        orderBy: {
          _count: {
            name: "desc",
          },
        },

        take: limit,
      });

    // --------------------------------------------------------
    // Find the highest event count.
    //
    // This is used by the frontend to calculate the
    // relative progress-bar width.
    // --------------------------------------------------------

    const highestCount =
      groupedEvents.length > 0
        ? groupedEvents[0]._count.name
        : 0;

    const data = groupedEvents.map(
      (event) => ({
        name: event.name,

        count: event._count.name,

        percentage:
          highestCount > 0
            ? Math.round(
                (event._count.name /
                  highestCount) *
                  100
              )
            : 0,
      })
    );

    return res.json({
      success: true,

      data,

      period: {
        days,
        startDate,
        endDate: new Date(),
      },
    });
  } catch (error) {
    console.error(
      "Get top events error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve top events.",
    });
  }
}

// ============================================================
// Device Breakdown
// ============================================================
//
// Groups sessions by device type for the requested period.
//
// ============================================================

export async function getDeviceBreakdown(
  req: Request,
  res: Response
) {
  try {
    const workspaceId =
      req.query.workspaceId as string | undefined;

    const requestedDays = Number(
      req.query.days ?? 7
    );

    const days = Math.min(
      Math.max(requestedDays || 7, 1),
      90
    );

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "workspaceId is required.",
      });
    }

    const startDate = new Date();

    startDate.setDate(
      startDate.getDate() - days
    );

    const sessions =
      await prisma.session.findMany({
        where: {
          workspaceId,
          startedAt: {
            gte: startDate,
          },
        },
        select: {
          deviceType: true,
        },
      });

    const counts = new Map<
      string,
      number
    >();

    for (const session of sessions) {
      const device =
        session.deviceType?.trim() ||
        "Unknown";

      counts.set(
        device,
        (counts.get(device) ?? 0) + 1
      );
    }

    const totalSessions =
      sessions.length;

    const data = Array.from(
      counts.entries()
    )
      .map(([name, count]) => ({
        name,
        count,
        percentage:
          totalSessions > 0
            ? Math.round(
                (count / totalSessions) * 100
              )
            : 0,
      }))
      .sort(
        (a, b) => b.count - a.count
      );

    return res.json({
      success: true,
      data,
      period: {
        days,
        startDate,
        endDate: new Date(),
      },
    });
  } catch (error) {
    console.error(
      "Get device breakdown error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve device breakdown.",
    });
  }
}


// ============================================================
// Location Breakdown
// ============================================================
//
// Groups sessions by city and country for the requested period.
//
// ============================================================

export async function getLocationBreakdown(
  req: Request,
  res: Response
) {
  try {
    const workspaceId =
      req.query.workspaceId as string | undefined;

    const requestedDays = Number(
      req.query.days ?? 7
    );

    const requestedLimit = Number(
      req.query.limit ?? 5
    );

    const days = Math.min(
      Math.max(requestedDays || 7, 1),
      90
    );

    const limit = Math.min(
      Math.max(requestedLimit || 5, 1),
      20
    );

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "workspaceId is required.",
      });
    }

    const startDate = new Date();

    startDate.setDate(
      startDate.getDate() - days
    );

    const sessions =
      await prisma.session.findMany({
        where: {
          workspaceId,
          startedAt: {
            gte: startDate,
          },
        },
        select: {
          city: true,
          country: true,
        },
      });

    const counts = new Map<
      string,
      {
        city: string;
        country: string;
        count: number;
      }
    >();

    for (const session of sessions) {
      const city =
        session.city?.trim() ||
        "Unknown";

      const country =
        session.country?.trim() ||
        "Unknown";

      const key = `${city}|${country}`;

      const existing =
        counts.get(key);

      if (existing) {
        existing.count += 1;
      } else {
        counts.set(key, {
          city,
          country,
          count: 1,
        });
      }
    }

    const data = Array.from(
      counts.values()
    )
      .sort(
        (a, b) => b.count - a.count
      )
      .slice(0, limit);

    return res.json({
      success: true,
      data,
      period: {
        days,
        startDate,
        endDate: new Date(),
      },
    });
  } catch (error) {
    console.error(
      "Get location breakdown error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve location breakdown.",
    });
  }
}

export async function getEventTypes(
  req: Request,
  res: Response
) {
  try {
    const workspaceId =
      req.query.workspaceId as string | undefined;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "workspaceId is required.",
      });
    }

    const events =
      await prisma.event.findMany({
        where: {
          workspaceId,
        },

        distinct: ["name"],

        select: {
          name: true,
        },

        orderBy: {
          name: "asc",
        },
      });

    return res.json({
      success: true,

      data: events.map(
        (event) => event.name
      ),
    });
  } catch (error) {
    console.error(
      "Get event types error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve event types.",
    });
  }
}

// ============================================================
// Get Analytics Overview
// ============================================================

export async function getAnalyticsOverview(
  req: Request,
  res: Response
) {
  try {
    const workspaceId =
      req.query.workspaceId as string | undefined;

    const requestedDays = Number(
      req.query.days ?? 7
    );

    const days = Math.min(
      Math.max(requestedDays || 7, 1),
      90
    );

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "workspaceId is required.",
      });
    }

    const startDate = new Date();

    startDate.setDate(
      startDate.getDate() - days
    );

    const totalEvents =
      await prisma.event.count({
        where: {
          workspaceId,
          timestamp: {
            gte: startDate,
          },
        },
      });

    const users =
      await prisma.event.findMany({
        where: {
          workspaceId,
          timestamp: {
            gte: startDate,
          },
          userId: {
            not: null,
          },
        },

        distinct: ["userId"],

        select: {
          userId: true,
        },
      });

    const totalUsers = users.length;

    const activeSessions =
      await prisma.session.count({
        where: {
          workspaceId,
          startedAt: {
            gte: startDate,
          },
        },
      });

    const convertedUsers =
      await prisma.event.findMany({
        where: {
          workspaceId,
          timestamp: {
            gte: startDate,
          },
          name: "signup_completed",
          userId: {
            not: null,
          },
        },

        distinct: ["userId"],

        select: {
          userId: true,
        },
      });

    const conversionRate =
      totalUsers > 0
        ? Number(
            (
              (convertedUsers.length /
                totalUsers) *
              100
            ).toFixed(2)
          )
        : 0;

    return res.json({
      success: true,

      data: {
        period: {
          days,
          startDate,
          endDate: new Date(),
        },

        metrics: {
          totalUsers,
          totalEvents,
          activeSessions,
          conversionRate,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get analytics overview error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to calculate analytics overview.",
    });
  }
}

// ============================================================
// Get Daily Event Traffic
// ============================================================

export async function getTrafficData(
  req: Request,
  res: Response
) {
  try {
    const workspaceId =
      req.query.workspaceId as string | undefined;

    const requestedDays = Number(
      req.query.days ?? 7
    );

    const days = Math.min(
      Math.max(requestedDays || 7, 1),
      90
    );

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "workspaceId is required.",
      });
    }

    const startDate = new Date();

    startDate.setHours(
      0,
      0,
      0,
      0
    );

    startDate.setDate(
      startDate.getDate() - (days - 1)
    );

    const events =
      await prisma.event.findMany({
        where: {
          workspaceId,

          timestamp: {
            gte: startDate,
          },
        },

        select: {
          timestamp: true,
        },

        orderBy: {
          timestamp: "asc",
        },
      });

    const trafficMap = new Map<
      string,
      number
    >();

    for (let i = 0; i < days; i++) {
      const date = new Date(
        startDate
      );

      date.setDate(
        startDate.getDate() + i
      );

      const key = date
        .toISOString()
        .split("T")[0];

      trafficMap.set(key, 0);
    }

    for (const event of events) {
      const key = event.timestamp
        .toISOString()
        .split("T")[0];

      trafficMap.set(
        key,
        (trafficMap.get(key) ?? 0) + 1
      );
    }

    const traffic = Array.from(
      trafficMap.entries()
    ).map(([date, events]) => ({
      date,
      events,
    }));

    return res.json({
      success: true,
      data: traffic,
    });
  } catch (error) {
    console.error(
      "Get traffic data error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to retrieve traffic data.",
    });
  }
}

// ============================================================
// Generate Analytics Insight
// ============================================================
//
// GET /api/analytics/insights
//
// Compares the selected period with the previous equivalent
// period and generates a data-driven product insight.
//
// This is intentionally rule-based for now.
// A real AI/LLM layer can be added later.
//
// ============================================================

export async function getAnalyticsInsight(
  req: Request,
  res: Response
) {
  try {
    const workspaceId =
      req.query.workspaceId as string | undefined;

    const requestedDays = Number(
      req.query.days ?? 7
    );

    const days = Math.min(
      Math.max(requestedDays || 7, 1),
      90
    );

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "workspaceId is required.",
      });
    }

    // --------------------------------------------------------
    // Current period
    // --------------------------------------------------------

    const currentEnd = new Date();

    const currentStart = new Date(
      currentEnd
    );

    currentStart.setDate(
      currentStart.getDate() - days
    );

    // --------------------------------------------------------
    // Previous equivalent period
    // --------------------------------------------------------

    const previousEnd = new Date(
      currentStart
    );

    const previousStart = new Date(
      previousEnd
    );

    previousStart.setDate(
      previousStart.getDate() - days
    );

    // --------------------------------------------------------
    // Fetch current and previous events
    // --------------------------------------------------------

    const [
      currentEvents,
      previousEvents,
    ] = await Promise.all([
      prisma.event.findMany({
        where: {
          workspaceId,
          timestamp: {
            gte: currentStart,
            lt: currentEnd,
          },
        },
        select: {
          name: true,
        },
      }),

      prisma.event.findMany({
        where: {
          workspaceId,
          timestamp: {
            gte: previousStart,
            lt: previousEnd,
          },
        },
        select: {
          name: true,
        },
      }),
    ]);

    // --------------------------------------------------------
    // Calculate activity change
    // --------------------------------------------------------

    const currentCount =
      currentEvents.length;

    const previousCount =
      previousEvents.length;

    let activityChange = 0;

    if (previousCount > 0) {
      activityChange = Number(
        (
          ((currentCount -
            previousCount) /
            previousCount) *
          100
        ).toFixed(1)
      );
    }

    // --------------------------------------------------------
    // Count current event types
    // --------------------------------------------------------

    const eventCounts =
      new Map<string, number>();

    for (const event of currentEvents) {
      eventCounts.set(
        event.name,
        (eventCounts.get(event.name) ?? 0) +
          1
      );
    }

    // --------------------------------------------------------
    // Find the most frequent event
    // --------------------------------------------------------

    let topEvent = "No events yet";
    let topEventCount = 0;

    for (const [
      eventName,
      count,
    ] of eventCounts.entries()) {
      if (count > topEventCount) {
        topEvent = eventName;
        topEventCount = count;
      }
    }

    // --------------------------------------------------------
    // Generate insight text
    // --------------------------------------------------------

    let title: string;
    let description: string;

    if (
      currentCount === 0 &&
      previousCount === 0
    ) {
      title =
        "Waiting for product activity";

      description =
        "There is not enough event data yet to generate an analytics insight.";
    } else if (
      previousCount === 0 &&
      currentCount > 0
    ) {
      title =
        "Your product is starting to generate activity";

      description =
        `${currentCount.toLocaleString(
          "en-IN"
        )} events were recorded during the selected period. ${topEvent} was the most frequently triggered event.`;
    } else if (activityChange > 0) {
      title =
        "User activity is trending upward";

      description =
        `Event activity increased by ${activityChange}% compared with the previous period. ${topEvent} was the most frequently triggered event with ${topEventCount.toLocaleString(
          "en-IN"
        )} occurrences.`;
    } else if (activityChange < 0) {
      title =
        "User activity has decreased";

      description =
        `Event activity decreased by ${Math.abs(
          activityChange
        )}% compared with the previous period. ${topEvent} remained the most frequently triggered event with ${topEventCount.toLocaleString(
          "en-IN"
        )} occurrences.`;
    } else {
      title =
        "User activity is holding steady";

      description =
        `Event activity remained unchanged compared with the previous period. ${topEvent} was the most frequently triggered event with ${topEventCount.toLocaleString(
          "en-IN"
        )} occurrences.`;
    }

    // --------------------------------------------------------
    // Return insight
    // --------------------------------------------------------

    return res.json({
      success: true,

      data: {
        title,
        description,

        activityChange,

        topEvent,
        topEventCount,

        period: {
          days,
          currentStart,
          currentEnd,
          previousStart,
          previousEnd,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get analytics insight error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate analytics insight.",
    });
  }
}
// Detect unusual changes in daily event activity using a
// rolling 7-day historical baseline.
export async function getAnalyticsAnomalies(
  req: Request,
  res: Response
) {
  try {
    const workspaceId = String(
      req.query.workspaceId || ""
    );

    const requestedDays = Number(
      req.query.days || 30
    );

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "workspaceId is required",
      });
    }

    // Keep the analysis window between 7 and 90 days.
    const days = Math.min(
      Math.max(requestedDays, 7),
      90
    );

    const now = new Date();

    // We need an additional 7 days before the requested
    // period because those days are used as the baseline.
    const analysisStart = new Date(now);
    analysisStart.setHours(0, 0, 0, 0);
    analysisStart.setDate(
      analysisStart.getDate() - (days - 1)
    );

    const queryStart = new Date(analysisStart);
    queryStart.setDate(
      queryStart.getDate() - 7
    );

    // Fetch events for the analysis period plus the
    // previous 7 days required for the rolling baseline.
    const events = await prisma.event.findMany({
      where: {
        workspaceId,
        timestamp: {
          gte: queryStart,
          lte: now,
        },
      },
      select: {
        timestamp: true,
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    // Build daily event counts.
    const dailyCounts = new Map<string, number>();

    const totalDaysToCreate = days + 7;

    for (let i = 0; i < totalDaysToCreate; i++) {
      const date = new Date(queryStart);

      date.setDate(
        date.getDate() + i
      );

      const key = date
        .toISOString()
        .split("T")[0];

      dailyCounts.set(key, 0);
    }

    // Count events for each day.
    for (const event of events) {
      const key = event.timestamp
        .toISOString()
        .split("T")[0];

      dailyCounts.set(
        key,
        (dailyCounts.get(key) || 0) + 1
      );
    }

    const allDailyData = Array.from(
      dailyCounts.entries()
    ).map(([date, eventCount]) => ({
      date,
      eventCount,
    }));

    const anomalies: Array<{
      date: string;
      eventCount: number;
      expectedCount: number;
      changePercent: number;
      type: "spike" | "drop";
      severity: "low" | "medium" | "high";
    }> = [];

    // Only analyze dates inside the requested period.
    const analysisData =
      allDailyData.slice(7);

    for (
      let i = 0;
      i < analysisData.length;
      i++
    ) {
      const current = analysisData[i];

      // Get the previous 7 days as the baseline.
      const previousDays =
        allDailyData.slice(i, i + 7);

      const baselineTotal =
        previousDays.reduce(
          (sum, item) =>
            sum + item.eventCount,
          0
        );

      // If there is no meaningful historical activity,
      // we cannot reliably call the current day an anomaly.
      if (baselineTotal < 3) {
        continue;
      }

      const baselineAverage =
        baselineTotal /
        previousDays.length;

      if (baselineAverage <= 0) {
        continue;
      }

      const changePercent =
        ((current.eventCount -
          baselineAverage) /
          baselineAverage) *
        100;

      const absoluteChange =
        Math.abs(changePercent);

      // Ignore small normal fluctuations.
      if (absoluteChange < 30) {
        continue;
      }

      let severity:
        | "low"
        | "medium"
        | "high";

      if (absoluteChange >= 100) {
        severity = "high";
      } else if (absoluteChange >= 60) {
        severity = "medium";
      } else {
        severity = "low";
      }

      // Ignore zero-event days when the baseline itself
      // is extremely small. This prevents normal sparse
      // traffic from becoming fake "high severity" alerts.
      if (
        current.eventCount === 0 &&
        baselineAverage < 2
      ) {
        continue;
      }

      anomalies.push({
        date: current.date,
        eventCount: current.eventCount,
        expectedCount: Math.round(
          baselineAverage
        ),
        changePercent: Number(
          changePercent.toFixed(1)
        ),
        type:
          changePercent >= 0
            ? "spike"
            : "drop",
        severity,
      });
    }

    // Sort strongest anomalies first.
    anomalies.sort(
      (a, b) =>
        Math.abs(b.changePercent) -
        Math.abs(a.changePercent)
    );

    // Calculate the average only for the requested
    // analysis period.
    const analysisTotal =
      analysisData.reduce(
        (sum, item) =>
          sum + item.eventCount,
        0
      );

    const averageDailyEvents =
      analysisData.length > 0
        ? analysisTotal /
          analysisData.length
        : 0;

    return res.json({
      success: true,
      data: {
        anomalies,
        averageDailyEvents: Number(
          averageDailyEvents.toFixed(1)
        ),
        analyzedDays: days,
      },
    });
  } catch (error) {
    console.error(
      "Failed to detect analytics anomalies:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to detect analytics anomalies.",
    });
  }
}

// ============================================================
// Analytics Forecast
// ============================================================
//
// Forecasts daily event activity for the next 7 days using
// a simple trend-based model built from historical events.
//
// This is intentionally deterministic for the MVP.
// A more advanced forecasting model can be introduced later.
// ============================================================
// ============================================================
// Analytics Forecast
// ============================================================
//
// Forecasts daily event activity for the next 7 days.
//
// The MVP uses the most recent 7 days of activity as the
// forecasting baseline. This prevents long periods of zero
// historical traffic from dominating the forecast.
//
// ============================================================

export async function getAnalyticsForecast(
  req: Request,
  res: Response
) {
  try {
    const workspaceId = String(
      req.query.workspaceId || ""
    );

    const requestedDays = Number(
      req.query.days || 30
    );

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "workspaceId is required",
      });
    }

    const days = Math.min(
      Math.max(requestedDays, 7),
      90
    );

    const now = new Date();

    // --------------------------------------------------------
    // Historical period
    // --------------------------------------------------------

    const startDate = new Date(now);

    startDate.setHours(0, 0, 0, 0);

    startDate.setDate(
      startDate.getDate() - (days - 1)
    );

    // --------------------------------------------------------
    // Fetch historical events
    // --------------------------------------------------------

    const events =
      await prisma.event.findMany({
        where: {
          workspaceId,
          timestamp: {
            gte: startDate,
            lte: now,
          },
        },
        select: {
          timestamp: true,
        },
        orderBy: {
          timestamp: "asc",
        },
      });

    // --------------------------------------------------------
    // Build daily event counts
    // --------------------------------------------------------

    const dailyCounts = new Map<
      string,
      number
    >();

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);

      date.setDate(
        date.getDate() + i
      );

      const key = date
        .toISOString()
        .split("T")[0];

      dailyCounts.set(key, 0);
    }

    for (const event of events) {
      const key = event.timestamp
        .toISOString()
        .split("T")[0];

      dailyCounts.set(
        key,
        (dailyCounts.get(key) || 0) + 1
      );
    }

    const historicalData =
      Array.from(
        dailyCounts.entries()
      ).map(
        ([date, eventCount]) => ({
          date,
          eventCount,
        })
      );

    // --------------------------------------------------------
    // Check for activity
    // --------------------------------------------------------

    const totalHistoricalEvents =
      historicalData.reduce(
        (sum, item) =>
          sum + item.eventCount,
        0
      );

    if (totalHistoricalEvents === 0) {
      return res.json({
        success: true,
        data: {
          historical:
            historicalData,
          forecast: [],
          trend: "insufficient_data",
          averageDailyEvents: 0,
          dailyTrend: 0,
          forecastDays: 7,
        },
      });
    }

    // --------------------------------------------------------
    // Recent activity baseline
    // --------------------------------------------------------
    //
    // Only the latest 7 days are used for forecasting.
    // This makes the forecast responsive to current product
    // behavior instead of old inactive periods.
    // --------------------------------------------------------

    const recentDays =
      Math.min(
        7,
        historicalData.length
      );

    const recentData =
      historicalData.slice(
        -recentDays
      );

    const recentTotal =
      recentData.reduce(
        (sum, item) =>
          sum + item.eventCount,
        0
      );

    const recentAverage =
      recentTotal /
      recentData.length;

    // --------------------------------------------------------
    // Calculate recent trend
    // --------------------------------------------------------
    //
    // Compare the first half of recent activity with the
    // second half.
    // --------------------------------------------------------

    const midpoint =
      Math.floor(
        recentData.length / 2
      );

    const firstHalf =
      recentData.slice(
        0,
        midpoint
      );

    const secondHalf =
      recentData.slice(
        midpoint
      );

    const firstAverage =
      firstHalf.length > 0
        ? firstHalf.reduce(
            (sum, item) =>
              sum + item.eventCount,
            0
          ) / firstHalf.length
        : recentAverage;

    const secondAverage =
      secondHalf.length > 0
        ? secondHalf.reduce(
            (sum, item) =>
              sum + item.eventCount,
            0
          ) / secondHalf.length
        : recentAverage;

    const recentTrend =
      secondAverage -
      firstAverage;

    // --------------------------------------------------------
    // Determine trend direction
    // --------------------------------------------------------

    const trendThreshold =
      Math.max(
        recentAverage * 0.1,
        0.5
      );

    let trend:
      | "increasing"
      | "decreasing"
      | "stable";

    if (
      recentTrend >
      trendThreshold
    ) {
      trend = "increasing";
    } else if (
      recentTrend <
      -trendThreshold
    ) {
      trend = "decreasing";
    } else {
      trend = "stable";
    }

    // --------------------------------------------------------
    // Calculate variability
    // --------------------------------------------------------

    const variance =
      recentData.reduce(
        (sum, item) =>
          sum +
          Math.pow(
            item.eventCount -
              recentAverage,
            2
          ),
        0
      ) /
      recentData.length;

    const standardDeviation =
      Math.sqrt(variance);

    // --------------------------------------------------------
    // Generate 7-day forecast
    // --------------------------------------------------------

    const forecastDays = 7;

    const forecast = [];

    for (
      let i = 1;
      i <= forecastDays;
      i++
    ) {
      // IMPORTANT:
      // Start tomorrow, not today.
      const date = new Date(now);

// Work entirely in UTC so the date does not shift
// when we convert it with toISOString().
date.setUTCHours(0, 0, 0, 0);

date.setUTCDate(
  date.getUTCDate() + i
);

      // Apply a small portion of the recent trend.
      const trendAdjustment =
        recentTrend *
        Math.min(i, 3) /
        3;

      const predicted =
        recentAverage +
        trendAdjustment;

      const predictedEvents =
        Math.max(
          0,
          Math.round(predicted)
        );

      // Use recent variability to create a reasonable
      // expected range around the prediction.
      const margin =
        Math.max(
          1,
          Math.round(
            standardDeviation
          )
        );

      forecast.push({
        date: date
          .toISOString()
          .split("T")[0],

        predictedEvents,

        lowerBound:
          Math.max(
            0,
            predictedEvents -
              margin
          ),

        upperBound:
          predictedEvents +
          margin,
      });
    }

    return res.json({
      success: true,
      data: {
        historical:
          historicalData,

        forecast,

        trend,

        averageDailyEvents:
          Number(
            recentAverage.toFixed(1)
          ),

        dailyTrend:
          Number(
            recentTrend.toFixed(2)
          ),

        forecastDays,
      },
    });
  } catch (error) {
    console.error(
      "Failed to generate analytics forecast:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate analytics forecast.",
    });
  }
}