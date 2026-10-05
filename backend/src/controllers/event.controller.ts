// ============================================================
// Event Controller
// ============================================================
//
// Handles HTTP requests related to analytics events.
//
// The controller is responsible for:
// 1. Validating incoming event data
// 2. Creating the event in PostgreSQL
// 3. Returning a useful API response
//
// ============================================================

import type { Request, Response } from "express";

import { prisma } from "../lib/prisma.js";

import {
  broadcastEvent,
} from "../lib/realtime.js";

// ============================================================
// Create Event
// ============================================================

export async function createEvent(
  req: Request,
  res: Response
) {
  try {
    const {
      workspaceId,
      userId,
      sessionId,
      name,
      properties,
      pageUrl,
      pageTitle,
      timestamp,
    } = req.body;

    // --------------------------------------------------------
    // Basic validation
    // --------------------------------------------------------

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: "workspaceId is required.",
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Event name is required.",
      });
    }

    // --------------------------------------------------------
    // Create event
    // --------------------------------------------------------

    const event = await prisma.event.create({
      data: {
        workspaceId,
        userId: userId || null,
        sessionId: sessionId || null,
        name,
        properties: properties ?? undefined,
        pageUrl: pageUrl || null,
        pageTitle: pageTitle || null,
        timestamp: timestamp
          ? new Date(timestamp)
          : new Date(),
      },
    });

    // --------------------------------------------------------
// Retrieve the event with user/session information.
//
// The realtime frontend uses this metadata to display
// the user, device, and location immediately.
// --------------------------------------------------------

const realtimeEvent =
  await prisma.event.findUnique({
    where: {
      id: event.id,
    },

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
// Push the new event to connected realtime clients.
//
// Only clients belonging to this workspace receive it.
// --------------------------------------------------------

if (realtimeEvent) {
  broadcastEvent(
    workspaceId,
    realtimeEvent
  );
}

    // --------------------------------------------------------
    // Return created event
    // --------------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Event created successfully.",
      data: event,
    });
  } catch (error) {
    console.error("Create event error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create event.",
    });
  }
}