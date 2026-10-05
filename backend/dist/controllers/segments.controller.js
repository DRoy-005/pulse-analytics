// ============================================================
// PulseAnalytics Segment Controller
// ============================================================
//
// Handles:
// - Listing saved segments
// - Creating segments
// - Deleting segments
//
// Segment membership will be calculated from the saved rules.
// ============================================================
import { prisma } from "../lib/prisma.js";
// ------------------------------------------------------------
// GET /api/segments
// ------------------------------------------------------------
// Returns all segments belonging to a workspace.
// ------------------------------------------------------------
export async function getSegments(req, res) {
    try {
        const workspaceId = typeof req.query.workspaceId === "string"
            ? req.query.workspaceId.trim()
            : "";
        if (!workspaceId) {
            return res.status(400).json({
                success: false,
                message: "workspaceId is required.",
            });
        }
        const segments = await prisma.segment.findMany({
            where: {
                workspaceId,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                rules: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        });
        return res.json({
            success: true,
            data: segments,
        });
    }
    catch (error) {
        console.error("Failed to fetch segments:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch segments.",
        });
    }
}
// ------------------------------------------------------------
// POST /api/segments
// ------------------------------------------------------------
// Creates a segment and its rules in one transaction.
// ------------------------------------------------------------
export async function createSegment(req, res) {
    try {
        const { workspaceId, name, description, rules, } = req.body;
        if (typeof workspaceId !== "string" ||
            !workspaceId.trim()) {
            return res.status(400).json({
                success: false,
                message: "workspaceId is required.",
            });
        }
        if (typeof name !== "string" ||
            !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Segment name is required.",
            });
        }
        if (!Array.isArray(rules)) {
            return res.status(400).json({
                success: false,
                message: "rules must be an array.",
            });
        }
        // --------------------------------------------------------
        // Validate every rule before writing to the database.
        // --------------------------------------------------------
        for (const rule of rules) {
            if (typeof rule?.field !== "string" ||
                typeof rule?.operator !== "string" ||
                typeof rule?.value !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "Each rule requires field, operator and value.",
                });
            }
        }
        const segment = await prisma.segment.create({
            data: {
                workspaceId: workspaceId.trim(),
                name: name.trim(),
                description: typeof description === "string"
                    ? description.trim() || null
                    : null,
                rules: {
                    create: rules.map((rule) => ({
                        field: rule.field.trim(),
                        operator: rule.operator.trim(),
                        value: rule.value.trim(),
                    })),
                },
            },
            include: {
                rules: true,
            },
        });
        return res.status(201).json({
            success: true,
            message: "Segment created successfully.",
            data: segment,
        });
    }
    catch (error) {
        console.error("Failed to create segment:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create segment.",
        });
    }
}
// ------------------------------------------------------------
// DELETE /api/segments/:id
// ------------------------------------------------------------
export async function deleteSegment(req, res) {
    try {
        const segmentId = typeof req.params.id === "string"
            ? req.params.id.trim()
            : "";
        const workspaceId = typeof req.query.workspaceId === "string"
            ? req.query.workspaceId.trim()
            : "";
        if (!segmentId) {
            return res.status(400).json({
                success: false,
                message: "Segment id is required.",
            });
        }
        if (!workspaceId) {
            return res.status(400).json({
                success: false,
                message: "workspaceId is required.",
            });
        }
        const segment = await prisma.segment.findFirst({
            where: {
                id: segmentId,
                workspaceId,
            },
        });
        if (!segment) {
            return res.status(404).json({
                success: false,
                message: "Segment not found.",
            });
        }
        await prisma.segment.delete({
            where: {
                id: segmentId,
            },
        });
        return res.json({
            success: true,
            message: "Segment deleted successfully.",
        });
    }
    catch (error) {
        console.error("Failed to delete segment:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete segment.",
        });
    }
}
// ============================================================
// GET /api/segments/:id/audience
// ============================================================
//
// Calculates which users match the segment rules.
//
// Current supported fields:
// - country
// - deviceType
// - browser
// - operatingSystem
// - event
//
// Multiple rules are combined with AND logic.
// ============================================================
export async function getSegmentAudience(req, res) {
    try {
        const segmentId = typeof req.params.id === "string"
            ? req.params.id.trim()
            : "";
        const workspaceId = typeof req.query.workspaceId === "string"
            ? req.query.workspaceId.trim()
            : "";
        if (!segmentId) {
            return res.status(400).json({
                success: false,
                message: "Segment id is required.",
            });
        }
        if (!workspaceId) {
            return res.status(400).json({
                success: false,
                message: "workspaceId is required.",
            });
        }
        // --------------------------------------------------------
        // Load the segment and its rules.
        // --------------------------------------------------------
        const segment = await prisma.segment.findFirst({
            where: {
                id: segmentId,
                workspaceId,
            },
            include: {
                rules: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        });
        if (!segment) {
            return res.status(404).json({
                success: false,
                message: "Segment not found.",
            });
        }
        // --------------------------------------------------------
        // No rules means the segment contains all users.
        // --------------------------------------------------------
        if (segment.rules.length === 0) {
            const users = await prisma.user.findMany({
                where: {
                    workspaceId,
                },
                orderBy: {
                    lastSeenAt: "desc",
                },
                select: {
                    id: true,
                    externalId: true,
                    email: true,
                    firstSeenAt: true,
                    lastSeenAt: true,
                },
            });
            return res.json({
                success: true,
                data: {
                    segmentId: segment.id,
                    segmentName: segment.name,
                    userCount: users.length,
                    users,
                },
            });
        }
        // --------------------------------------------------------
        // Build user IDs matching every rule.
        //
        // We evaluate the rules one at a time and intersect the
        // matching user IDs.
        // --------------------------------------------------------
        let matchingUserIds = null;
        for (const rule of segment.rules) {
            let ruleUserIds = [];
            // ------------------------------------------------------
            // Country
            // ------------------------------------------------------
            if (rule.field === "country") {
                const sessions = await prisma.session.findMany({
                    where: {
                        workspaceId,
                        ...(rule.operator ===
                            "not_equals"
                            ? {
                                NOT: {
                                    country: rule.value,
                                },
                            }
                            : {
                                country: rule.value,
                            }),
                        userId: {
                            not: null,
                        },
                    },
                    select: {
                        userId: true,
                    },
                });
                ruleUserIds = sessions
                    .map((session) => session.userId)
                    .filter((userId) => userId !== null);
            }
            // ------------------------------------------------------
            // Device
            // ------------------------------------------------------
            else if (rule.field ===
                "deviceType") {
                const sessions = await prisma.session.findMany({
                    where: {
                        workspaceId,
                        ...(rule.operator ===
                            "not_equals"
                            ? {
                                NOT: {
                                    deviceType: rule.value,
                                },
                            }
                            : {
                                deviceType: rule.value,
                            }),
                        userId: {
                            not: null,
                        },
                    },
                    select: {
                        userId: true,
                    },
                });
                ruleUserIds = sessions
                    .map((session) => session.userId)
                    .filter((userId) => userId !== null);
            }
            // ------------------------------------------------------
            // Browser
            // ------------------------------------------------------
            else if (rule.field ===
                "browser") {
                const sessions = await prisma.session.findMany({
                    where: {
                        workspaceId,
                        ...(rule.operator ===
                            "not_equals"
                            ? {
                                NOT: {
                                    browser: rule.value,
                                },
                            }
                            : {
                                browser: rule.value,
                            }),
                        userId: {
                            not: null,
                        },
                    },
                    select: {
                        userId: true,
                    },
                });
                ruleUserIds = sessions
                    .map((session) => session.userId)
                    .filter((userId) => userId !== null);
            }
            // ------------------------------------------------------
            // Operating system
            // ------------------------------------------------------
            else if (rule.field ===
                "operatingSystem") {
                const sessions = await prisma.session.findMany({
                    where: {
                        workspaceId,
                        ...(rule.operator ===
                            "not_equals"
                            ? {
                                NOT: {
                                    operatingSystem: rule.value,
                                },
                            }
                            : {
                                operatingSystem: rule.value,
                            }),
                        userId: {
                            not: null,
                        },
                    },
                    select: {
                        userId: true,
                    },
                });
                ruleUserIds = sessions
                    .map((session) => session.userId)
                    .filter((userId) => userId !== null);
            }
            // ------------------------------------------------------
            // Event performed
            // ------------------------------------------------------
            else if (rule.field === "event") {
                const events = await prisma.event.findMany({
                    where: {
                        workspaceId,
                        ...(rule.operator ===
                            "not_equals"
                            ? {
                                NOT: {
                                    name: rule.value,
                                },
                            }
                            : {
                                name: rule.value,
                            }),
                        userId: {
                            not: null,
                        },
                    },
                    select: {
                        userId: true,
                    },
                });
                ruleUserIds = events
                    .map((event) => event.userId)
                    .filter((userId) => userId !== null);
            }
            // ------------------------------------------------------
            // Unknown field
            // ------------------------------------------------------
            else {
                return res.status(400).json({
                    success: false,
                    message: `Unsupported segment field: ${rule.field}`,
                });
            }
            // ------------------------------------------------------
            // Remove duplicates from this rule.
            // ------------------------------------------------------
            const currentRuleUsers = new Set(ruleUserIds);
            // ------------------------------------------------------
            // First rule establishes the initial audience.
            // ------------------------------------------------------
            if (matchingUserIds === null) {
                matchingUserIds =
                    currentRuleUsers;
                continue;
            }
            // ------------------------------------------------------
            // AND logic:
            // Keep only users who match both the existing rules
            // and the current rule.
            // ------------------------------------------------------
            matchingUserIds =
                new Set([...matchingUserIds].filter((userId) => currentRuleUsers.has(userId)));
        }
        const userIds = matchingUserIds
            ? [...matchingUserIds]
            : [];
        // --------------------------------------------------------
        // Fetch final matching users.
        // --------------------------------------------------------
        const users = userIds.length > 0
            ? await prisma.user.findMany({
                where: {
                    workspaceId,
                    id: {
                        in: userIds,
                    },
                },
                orderBy: {
                    lastSeenAt: "desc",
                },
                select: {
                    id: true,
                    externalId: true,
                    email: true,
                    firstSeenAt: true,
                    lastSeenAt: true,
                },
            })
            : [];
        return res.json({
            success: true,
            data: {
                segmentId: segment.id,
                segmentName: segment.name,
                userCount: users.length,
                users,
            },
        });
    }
    catch (error) {
        console.error("Failed to calculate segment audience:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to calculate segment audience.",
        });
    }
}
