const express = require("express");
const { store } = require("../data/store");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ── GET /api/incidents ───────────────────────────────────────────────────────
// Returns all incidents, sorted newest first.
router.get("/", authMiddleware, (req, res) => {
  const incidents = [...store.incidents].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json({
    success: true,
    incidents,
  });
});

// ── POST /api/incidents ──────────────────────────────────────────────────────
// Creates a new incident.
router.post("/", authMiddleware, (req, res) => {
  try {
    const { id, location, type, priority, time } = req.body;

    if (!location || !type || !priority) {
      return res.status(400).json({
        success: false,
        message: "Location, type, and priority are required.",
      });
    }

    const newIncident = {
      id: id || `INC-${Date.now()}`,
      location,
      type,
      priority,
      time: time || new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      createdAt: new Date().toISOString(),
    };

    // Add to beginning (newest first)
    store.incidents.unshift(newIncident);

    res.status(201).json({
      success: true,
      incident: newIncident,
    });
  } catch (error) {
    console.error("Save incident error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

module.exports = router;
