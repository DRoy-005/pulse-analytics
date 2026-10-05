// ============================================================
// Event Routes
// ============================================================
//
// Routes related to analytics events.
//
// ============================================================
import { Router } from "express";
import { createEvent } from "../controllers/event.controller.js";
import { getEventTypes, } from "../controllers/analytics.controller.js";
const router = Router();
// ============================================================
// Create Event
// ============================================================
//
// POST /api/events
//
// ============================================================
router.post("/", createEvent);
// ============================================================
// Get Event Types
// ============================================================
//
// GET /api/events/types?workspaceId=...
//
// ============================================================
router.get("/types", getEventTypes);
export default router;
