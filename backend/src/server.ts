// ============================================================
// PulseAnalytics API Server
// ============================================================
//
// Main Express server.
//
// Responsibilities:
// - Start the Express API
// - Register middleware
// - Register analytics routes
// - Register event routes
// - Register segment routes
// - Register realtime SSE endpoint
//
// ============================================================

import "dotenv/config";

import cors from "cors";
import express from "express";

// ============================================================
// Analytics Controllers
// ============================================================

import {
  getAnalyticsAnomalies,
  getAnalyticsForecast,
  getAnalyticsInsight,
  getAnalyticsOverview,
  getDeviceBreakdown,
  getEvents,
  getLocationBreakdown,
  getTopEvents,
  getTrafficData,
} from "./controllers/analytics.controller.js";

// ============================================================
// Realtime Controller
// ============================================================

import {
  connectRealtime,
} from "./controllers/realtime.controller.js";

// ============================================================
// Routes
// ============================================================

import eventRoutes from "./routes/event.routes.js";
import segmentRoutes from "./routes/segment.routes.js";

// ============================================================
// Express App
// ============================================================

const app = express();

const PORT =
  process.env.PORT || 5000;

// ============================================================
// Middleware
// ============================================================

// Allow requests from the frontend.
app.use(cors());

// Parse JSON request bodies.
app.use(express.json());

// ============================================================
// Health Check
// ============================================================

app.get(
  "/api/health",
  (_req, res) => {
    res.json({
      success: true,
      message:
        "PulseAnalytics API is running",
    });
  }
);

// ============================================================
// Event Routes
// ============================================================
//
// POST /api/events
// GET  /api/events
// GET  /api/events/types
//
// ============================================================

app.use(
  "/api/events",
  eventRoutes
);

// ============================================================
// Analytics Routes
// ============================================================

// Recent events
app.get(
  "/api/events",
  getEvents
);

// Overview metrics
app.get(
  "/api/analytics/overview",
  getAnalyticsOverview
);

// Traffic data
app.get(
  "/api/analytics/traffic",
  getTrafficData
);

// Top events
app.get(
  "/api/analytics/top-events",
  getTopEvents
);

// Device breakdown
app.get(
  "/api/analytics/devices",
  getDeviceBreakdown
);

// Location breakdown
app.get(
  "/api/analytics/locations",
  getLocationBreakdown
);

// Rule-based analytics insight
app.get(
  "/api/analytics/insights",
  getAnalyticsInsight
);

// Anomaly detection
app.get(
  "/api/analytics/anomalies",
  getAnalyticsAnomalies
);

// Forecasting
app.get(
  "/api/analytics/forecast",
  getAnalyticsForecast
);

// ============================================================
// Segment Routes
// ============================================================
//
// GET    /api/segments
// POST   /api/segments
// DELETE /api/segments/:id
//
// ============================================================

app.use(
  "/api/segments",
  segmentRoutes
);

// ============================================================
// Realtime SSE
// ============================================================
//
// GET /api/realtime?workspaceId=...
//
// Keeps a persistent connection open so the backend can
// push newly-created events to connected browsers.
//
// ============================================================

app.get(
  "/api/realtime",
  connectRealtime
);

// ============================================================
// Start Server
// ============================================================

app.listen(
  PORT,
  () => {
    console.log(
      `PulseAnalytics API running on http://localhost:${PORT}`
    );
  }
);