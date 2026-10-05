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
export async function getEvents(req, res) {
    try {
        const workspaceId = req.query.workspaceId;
        const requestedPage = Number(req.query.page ?? 1);
        const requestedLimit = Number(req.query.limit ?? 10);
        const search = typeof req.query.search === "string"
            ? req.query.search.trim()
            : "";
        const eventName = typeof req.query.eventName === "string"
            ? req.query.eventName.trim()
            : "";
        const deviceType = typeof req.query.deviceType === "string"
            ? req.query.deviceType.trim()
            : "";
        const country = typeof req.query.country === "string"
            ? req.query.country.trim()
            : "";
        const startDate = typeof req.query.startDate === "string"
            ? req.query.startDate
            : "";
        const endDate = typeof req.query.endDate === "string"
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
        const page = Math.max(requestedPage || 1, 1);
        const limit = Math.min(Math.max(requestedLimit || 10, 1), 100);
        const skip = (page - 1) * limit;
        // --------------------------------------------------------
        // Search conditions
        // --------------------------------------------------------
        const searchConditions = search
            ? [
                {
                    name: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    pageTitle: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    pageUrl: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    user: {
                        email: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                },
                {
                    user: {
                        externalId: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                },
            ]
            : undefined;
        // --------------------------------------------------------
        // Date filter
        // --------------------------------------------------------
        let timestampFilter;
        if (startDate || endDate) {
            timestampFilter = {};
            if (startDate) {
                const start = new Date(`${startDate}T00:00:00`);
                if (!Number.isNaN(start.getTime())) {
                    timestampFilter.gte = start;
                }
            }
            if (endDate) {
                const end = new Date(`${endDate}T00:00:00`);
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
        const events = await prisma.event.findMany({
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
        const total = await prisma.event.count({
            where,
        });
        // --------------------------------------------------------
        // Pagination metadata
        // --------------------------------------------------------
        const totalPages = Math.max(1, Math.ceil(total / limit));
        return res.json({
            success: true,
            data: events,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        });
    }
    catch (error) {
        console.error("Get events error:", error);
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
export async function getTopEvents(req, res) {
    try {
        const workspaceId = req.query.workspaceId;
        const requestedDays = Number(req.query.days ?? 7);
        const requestedLimit = Number(req.query.limit ?? 5);
        const days = Math.min(Math.max(requestedDays || 7, 1), 90);
        const limit = Math.min(Math.max(requestedLimit || 5, 1), 20);
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
        startDate.setDate(startDate.getDate() - days);
        // --------------------------------------------------------
        // Group events by event name
        // --------------------------------------------------------
        const groupedEvents = await prisma.event.groupBy({
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
        const highestCount = groupedEvents.length > 0
            ? groupedEvents[0]._count.name
            : 0;
        const data = groupedEvents.map((event) => ({
            name: event.name,
            count: event._count.name,
            percentage: highestCount > 0
                ? Math.round((event._count.name /
                    highestCount) *
                    100)
                : 0,
        }));
        return res.json({
            success: true,
            data,
            period: {
                days,
                startDate,
                endDate: new Date(),
            },
        });
    }
    catch (error) {
        console.error("Get top events error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve top events.",
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
export async function getDeviceBreakdown(req, res) {
    try {
        const workspaceId = req.query.workspaceId;
        const requestedDays = Number(req.query.days ?? 7);
        const days = Math.min(Math.max(requestedDays || 7, 1), 90);
        if (!workspaceId) {
            return res.status(400).json({
                success: false,
                message: "workspaceId is required.",
            });
        }
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const sessions = await prisma.session.findMany({
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
        const counts = new Map();
        for (const session of sessions) {
            const device = session.deviceType?.trim() ||
                "Unknown";
            counts.set(device, (counts.get(device) ?? 0) + 1);
        }
        const totalSessions = sessions.length;
        const data = Array.from(counts.entries())
            .map(([name, count]) => ({
            name,
            count,
            percentage: totalSessions > 0
                ? Math.round((count / totalSessions) * 100)
                : 0,
        }))
            .sort((a, b) => b.count - a.count);
        return res.json({
            success: true,
            data,
            period: {
                days,
                startDate,
                endDate: new Date(),
            },
        });
    }
    catch (error) {
        console.error("Get device breakdown error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve device breakdown.",
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
export async function getLocationBreakdown(req, res) {
    try {
        const workspaceId = req.query.workspaceId;
        const requestedDays = Number(req.query.days ?? 7);
        const requestedLimit = Number(req.query.limit ?? 5);
        const days = Math.min(Math.max(requestedDays || 7, 1), 90);
        const limit = Math.min(Math.max(requestedLimit || 5, 1), 20);
        if (!workspaceId) {
            return res.status(400).json({
                success: false,
                message: "workspaceId is required.",
            });
        }
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const sessions = await prisma.session.findMany({
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
        const counts = new Map();
        for (const session of sessions) {
            const city = session.city?.trim() ||
                "Unknown";
            const country = session.country?.trim() ||
                "Unknown";
            const key = `${city}|${country}`;
            const existing = counts.get(key);
            if (existing) {
                existing.count += 1;
            }
            else {
                counts.set(key, {
                    city,
                    country,
                    count: 1,
                });
            }
        }
        const data = Array.from(counts.values())
            .sort((a, b) => b.count - a.count)
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
    }
    catch (error) {
        console.error("Get location breakdown error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve location breakdown.",
        });
    }
}
export async function getEventTypes(req, res) {
    try {
        const workspaceId = req.query.workspaceId;
        if (!workspaceId) {
            return res.status(400).json({
                success: false,
                message: "workspaceId is required.",
            });
        }
        const events = await prisma.event.findMany({
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
            data: events.map((event) => event.name),
        });
    }
    catch (error) {
        console.error("Get event types error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve event types.",
        });
    }
}
// ============================================================
// Get Analytics Overview
// ============================================================
export async function getAnalyticsOverview(req, res) {
    try {
        const workspaceId = req.query.workspaceId;
        const requestedDays = Number(req.query.days ?? 7);
        const days = Math.min(Math.max(requestedDays || 7, 1), 90);
        if (!workspaceId) {
            return res.status(400).json({
                success: false,
                message: "workspaceId is required.",
            });
        }
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const totalEvents = await prisma.event.count({
            where: {
                workspaceId,
                timestamp: {
                    gte: startDate,
                },
            },
        });
        const users = await prisma.event.findMany({
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
        const activeSessions = await prisma.session.count({
            where: {
                workspaceId,
                startedAt: {
                    gte: startDate,
                },
            },
        });
        const convertedUsers = await prisma.event.findMany({
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
        const conversionRate = totalUsers > 0
            ? Number(((convertedUsers.length /
                totalUsers) *
                100).toFixed(2))
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
    }
    catch (error) {
        console.error("Get analytics overview error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to calculate analytics overview.",
        });
    }
}
// ============================================================
// Get Daily Event Traffic
// ============================================================
export async function getTrafficData(req, res) {
    try {
        const workspaceId = req.query.workspaceId;
        const requestedDays = Number(req.query.days ?? 7);
        const days = Math.min(Math.max(requestedDays || 7, 1), 90);
        if (!workspaceId) {
            return res.status(400).json({
                success: false,
                message: "workspaceId is required.",
            });
        }
        const startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        startDate.setDate(startDate.getDate() - (days - 1));
        const events = await prisma.event.findMany({
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
        const trafficMap = new Map();
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const key = date
                .toISOString()
                .split("T")[0];
            trafficMap.set(key, 0);
        }
        for (const event of events) {
            const key = event.timestamp
                .toISOString()
                .split("T")[0];
            trafficMap.set(key, (trafficMap.get(key) ?? 0) + 1);
        }
        const traffic = Array.from(trafficMap.entries()).map(([date, events]) => ({
            date,
            events,
        }));
        return res.json({
            success: true,
            data: traffic,
        });
    }
    catch (error) {
        console.error("Get traffic data error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve traffic data.",
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
export async function getAnalyticsInsight(req, res) {
    try {
        const workspaceId = req.query.workspaceId;
        const requestedDays = Number(req.query.days ?? 7);
        const days = Math.min(Math.max(requestedDays || 7, 1), 90);
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
        const currentStart = new Date(currentEnd);
        currentStart.setDate(currentStart.getDate() - days);
        // --------------------------------------------------------
        // Previous equivalent period
        // --------------------------------------------------------
        const previousEnd = new Date(currentStart);
        const previousStart = new Date(previousEnd);
        previousStart.setDate(previousStart.getDate() - days);
        // --------------------------------------------------------
        // Fetch current and previous events
        // --------------------------------------------------------
        const [currentEvents, previousEvents,] = await Promise.all([
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
        const currentCount = currentEvents.length;
        const previousCount = previousEvents.length;
        let activityChange = 0;
        if (previousCount > 0) {
            activityChange = Number((((currentCount -
                previousCount) /
                previousCount) *
                100).toFixed(1));
        }
        // --------------------------------------------------------
        // Count current event types
        // --------------------------------------------------------
        const eventCounts = new Map();
        for (const event of currentEvents) {
            eventCounts.set(event.name, (eventCounts.get(event.name) ?? 0) +
                1);
        }
        // --------------------------------------------------------
        // Find the most frequent event
        // --------------------------------------------------------
        let topEvent = "No events yet";
        let topEventCount = 0;
        for (const [eventName, count,] of eventCounts.entries()) {
            if (count > topEventCount) {
                topEvent = eventName;
                topEventCount = count;
            }
        }
        // --------------------------------------------------------
        // Generate insight text
        // --------------------------------------------------------
        let title;
        let description;
        if (currentCount === 0 &&
            previousCount === 0) {
            title =
                "Waiting for product activity";
            description =
                "There is not enough event data yet to generate an analytics insight.";
        }
        else if (previousCount === 0 &&
            currentCount > 0) {
            title =
                "Your product is starting to generate activity";
            description =
                `${currentCount.toLocaleString("en-IN")} events were recorded during the selected period. ${topEvent} was the most frequently triggered event.`;
        }
        else if (activityChange > 0) {
            title =
                "User activity is trending upward";
            description =
                `Event activity increased by ${activityChange}% compared with the previous period. ${topEvent} was the most frequently triggered event with ${topEventCount.toLocaleString("en-IN")} occurrences.`;
        }
        else if (activityChange < 0) {
            title =
                "User activity has decreased";
            description =
                `Event activity decreased by ${Math.abs(activityChange)}% compared with the previous period. ${topEvent} remained the most frequently triggered event with ${topEventCount.toLocaleString("en-IN")} occurrences.`;
        }
        else {
            title =
                "User activity is holding steady";
            description =
                `Event activity remained unchanged compared with the previous period. ${topEvent} was the most frequently triggered event with ${topEventCount.toLocaleString("en-IN")} occurrences.`;
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
    }
    catch (error) {
        console.error("Get analytics insight error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate analytics insight.",
        });
    }
}
