// ============================================================
// PulseAnalytics Realtime Controller
// ============================================================
//
// Handles Server-Sent Events connections.
//
// GET /api/realtime?workspaceId=...
//
// The browser keeps this HTTP connection open and receives
// new events from the backend as they happen.
//
// ============================================================

import type {
  Request,
  Response,
} from "express";

import {
  addRealtimeClient,
  getRealtimeClientCount,
  removeRealtimeClient,
  broadcastEvent,
} from "../lib/realtime.js";

// ============================================================
// SSE Connection
// ============================================================

export function connectRealtime(
  req: Request,
  res: Response
) {
  try {
    const workspaceId =
      typeof req.query.workspaceId ===
      "string"
        ? req.query.workspaceId.trim()
        : "";

    // --------------------------------------------------------
    // Validate workspace
    // --------------------------------------------------------

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message:
          "workspaceId is required.",
      });
    }

    // --------------------------------------------------------
    // SSE headers
    // --------------------------------------------------------

    res.setHeader(
      "Content-Type",
      "text/event-stream"
    );

    res.setHeader(
      "Cache-Control",
      "no-cache, no-transform"
    );

    res.setHeader(
      "Connection",
      "keep-alive"
    );

    res.setHeader(
      "X-Accel-Buffering",
      "no"
    );

    // --------------------------------------------------------
    // Flush headers immediately.
    // --------------------------------------------------------

    res.flushHeaders();

    // --------------------------------------------------------
    // Generate a unique client ID.
    // --------------------------------------------------------

    const clientId =
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

    // --------------------------------------------------------
    // Register this browser as an SSE client.
    // --------------------------------------------------------

    addRealtimeClient(
      clientId,
      workspaceId,
      res
    );

    // --------------------------------------------------------
    // Send initial connection event.
    // --------------------------------------------------------

    res.write(
      `event: connected\n` +
        `data: ${JSON.stringify({
          success: true,
          message:
            "Realtime connection established.",
          clients:
            getRealtimeClientCount(),
        })}\n\n`
    );

    // --------------------------------------------------------
    // Remove the client when the browser disconnects.
    // --------------------------------------------------------

    req.on("close", () => {
      removeRealtimeClient(clientId);
    });
  } catch (error) {
    console.error(
      "Realtime connection error:",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message:
          "Failed to establish realtime connection.",
      });
    }

    res.end();
  }
}