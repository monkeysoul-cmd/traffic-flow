const express = require("express");
const { store, getNextDispatchId, getNextLightControlId } = require("../data/store");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ── GET /api/dispatch/logs ───────────────────────────────────────────────────
// Returns all dispatch logs, sorted newest first.
router.get("/logs", authMiddleware, (req, res) => {
  const logs = [...store.dispatchLogs].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
  res.json({
    success: true,
    logs,
  });
});

// ── POST /api/dispatch/logs ──────────────────────────────────────────────────
// Creates a new dispatch log entry.
router.post("/logs", authMiddleware, (req, res) => {
  try {
    const { unit, incidentId, location, user } = req.body;

    if (!unit || !incidentId || !location) {
      return res.status(400).json({
        success: false,
        message: "Unit, incidentId, and location are required.",
      });
    }

    const newLog = {
      id: getNextDispatchId(),
      unit,
      incidentId,
      location,
      user: user || req.user.fullName || "Unknown",
      timestamp: new Date().toISOString(),
    };

    store.dispatchLogs.unshift(newLog);

    res.status(201).json({
      success: true,
      log: newLog,
    });
  } catch (error) {
    console.error("Save dispatch log error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

// ── GET /api/dispatch/light-control ──────────────────────────────────────────
// Returns all light control logs, sorted newest first.
router.get("/light-control", authMiddleware, (req, res) => {
  const logs = [...store.lightControlLogs].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
  res.json({
    success: true,
    logs,
  });
});

// ── POST /api/dispatch/light-control ─────────────────────────────────────────
// Logs a light control action.
router.post("/light-control", authMiddleware, (req, res) => {
  try {
    const { location, action, user } = req.body;

    if (!location || !action) {
      return res.status(400).json({
        success: false,
        message: "Location and action are required.",
      });
    }

    const newLog = {
      id: getNextLightControlId(),
      location,
      action,
      user: user || req.user.fullName || "Unknown",
      timestamp: new Date().toISOString(),
    };

    store.lightControlLogs.unshift(newLog);

    res.status(201).json({
      success: true,
      log: newLog,
    });
  } catch (error) {
    console.error("Save light control log error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

module.exports = router;
