// ============================================================
// Analytics Routes
// ============================================================
//
// Routes for retrieving analytics data.
//
// ============================================================
import { Router } from "express";
import { getAnalyticsOverview, getEvents, getTopEvents, getTrafficData, } from "../controllers/analytics.controller.js";
const router = Router();
// ============================================================
// Events
// ============================================================
router.get("/events", getEvents);
// ============================================================
// Analytics Overview
// ============================================================
router.get("/api/analytics/overview", getAnalyticsOverview);
// ============================================================
// Traffic
// ============================================================
router.get("/api/analytics/traffic", getTrafficData);
// ============================================================
// Top Events
// ============================================================
//
// GET /api/analytics/top-events?workspaceId=...&days=7
//
// ============================================================
router.get("/api/analytics/top-events", getTopEvents);
export default router;
