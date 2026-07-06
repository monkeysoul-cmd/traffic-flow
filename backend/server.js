require("dotenv").config();
const express = require("express");
const cors = require("cors");

// ── Import Routes ─────────────────────────────────────────────────────────────
const authRoutes = require("./routes/auth");
const trafficRoutes = require("./routes/traffic");
const dispatchRoutes = require("./routes/dispatch");
const incidentRoutes = require("./routes/incidents");
const aiRoutes = require("./routes/ai");

// ── App Setup ─────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: ["http://localhost:9002", "http://localhost:3000", "http://127.0.0.1:9002"],
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logger (Development) ──────────────────────────────────────────────
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/traffic", trafficRoutes);
app.use("/api/dispatch", dispatchRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/ai", aiRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "TrafficFlow Backend API is running.",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found.`,
  });
});

// ── Error Handler ─────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════════╗
  ║   🚦 TrafficFlow Backend API Server                 ║
  ║   ─────────────────────────────────────────────     ║
  ║   Running on: http://localhost:${PORT}                ║
  ║   Health:     http://localhost:${PORT}/api/health     ║
  ║   Mode:       ${process.env.NODE_ENV || "development"}                       ║
  ╚══════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
