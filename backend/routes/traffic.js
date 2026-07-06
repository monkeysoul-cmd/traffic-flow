const express = require("express");
const { v4: uuidv4 } = require("uuid");
const { store } = require("../data/store");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ── GET /api/traffic/scans ───────────────────────────────────────────────────
// Returns all traffic scan records, sorted newest first.
router.get("/scans", authMiddleware, (req, res) => {
  const scans = [...store.trafficScans].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
  res.json({
    success: true,
    scans,
  });
});

// ── POST /api/traffic/scans ──────────────────────────────────────────────────
// Saves a new traffic scan result.
router.post("/scans", authMiddleware, (req, res) => {
  try {
    const { location, vehicleCount, trafficLevel, potentialIncidents, model } = req.body;

    if (!location || vehicleCount === undefined || !trafficLevel) {
      return res.status(400).json({
        success: false,
        message: "Location, vehicleCount, and trafficLevel are required.",
      });
    }

    const newScan = {
      id: uuidv4(),
      location,
      vehicleCount: Number(vehicleCount),
      trafficLevel,
      potentialIncidents: potentialIncidents || null,
      model: model || "unknown",
      timestamp: new Date().toISOString(),
    };

    store.trafficScans.push(newScan);

    res.status(201).json({
      success: true,
      scan: newScan,
    });
  } catch (error) {
    console.error("Save traffic scan error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

// ── GET /api/traffic/stats ───────────────────────────────────────────────────
// Returns aggregated traffic statistics.
router.get("/stats", authMiddleware, (req, res) => {
  const scans = store.trafficScans;
  const totalScans = scans.length;
  const totalVehicles = scans.reduce((sum, s) => sum + s.vehicleCount, 0);
  const avgVehiclesPerScan = totalScans > 0 ? Math.round(totalVehicles / totalScans) : 0;

  // Count traffic levels
  const levelCounts = { Low: 0, Medium: 0, High: 0 };
  scans.forEach((s) => {
    if (levelCounts[s.trafficLevel] !== undefined) {
      levelCounts[s.trafficLevel]++;
    }
  });

  // Determine dominant traffic level
  const dominantLevel = Object.entries(levelCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || "Medium";

  res.json({
    success: true,
    stats: {
      totalScans,
      totalVehicles,
      avgVehiclesPerScan,
      levelCounts,
      dominantLevel,
    },
  });
});

module.exports = router;
