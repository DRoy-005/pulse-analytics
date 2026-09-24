"use strict";
// ============================================================
// PulseAnalytics Backend Server
// ============================================================
//
// Main entry point for the backend.
//
// Responsibilities:
// 1. Create the Express application
// 2. Configure middleware
// 3. Register API routes
// 4. Start the HTTP server
//
// Database integration will be added in the next stage.
//
// ============================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// ============================================================
// Application Setup
// ============================================================
const app = (0, express_1.default)();
// Backend port.
//
// Using an environment variable allows deployment platforms
// such as Render/Railway to provide their own port.
//
// The local development fallback is 5000.
const PORT = process.env.PORT || 5000;
// ============================================================
// Middleware
// ============================================================
// Allow requests from our frontend.
//
// We will make this more restrictive when we deploy.
app.use((0, cors_1.default)());
// Parse incoming JSON request bodies.
app.use(express_1.default.json());
// ============================================================
// Health Check
// ============================================================
//
// This endpoint lets us quickly verify that the backend
// server is running.
//
// Example:
// GET http://localhost:5000/api/health
//
app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        message: "PulseAnalytics API is running",
    });
});
// ============================================================
// Start Server
// ============================================================
app.listen(PORT, () => {
    console.log(`PulseAnalytics API running on http://localhost:${PORT}`);
});
