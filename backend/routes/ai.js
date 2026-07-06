const express = require("express");
const { YoloSimulation, VEHICLE_CLASSES } = require("../../simulation/yolo-simulation");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// ── Persistent simulation instances per location ──────────────────────────────
const simulations = new Map();

function getOrCreateSimulation(location, options = {}) {
  if (!simulations.has(location)) {
    simulations.set(
      location,
      new YoloSimulation({ location, ...options })
    );
  }
  return simulations.get(location);
}

// ── GET /api/ai/models ───────────────────────────────────────────────────────
// Returns available AI model info.
router.get("/models", (req, res) => {
  res.json({
    success: true,
    models: [
      {
        id: "yolov5-sim",
        name: "YOLOv5 Simulation",
        version: "1.0",
        type: "vehicle-detection",
        description:
          "Simulated YOLOv5 vehicle detection engine for traffic analysis demos. Generates realistic multi-class detections with tracking, speed estimation, and emergency vehicle identification.",
        classes: Object.keys(VEHICLE_CLASSES),
        capabilities: [
          "multi-class-detection",
          "centroid-tracking",
          "speed-estimation",
          "emergency-detection",
          "collision-detection",
          "congestion-classification",
        ],
      },
    ],
  });
});

// ── POST /api/ai/yolo/start ──────────────────────────────────────────────────
// Starts or resets a YOLO simulation for a location.
router.post("/yolo/start", authMiddleware, (req, res) => {
  const {
    location = "MG Road & Brigade Road: Lane 1",
    width = 1280,
    height = 720,
    fps = 15,
    maxVehicles = 30,
    spawnRate = 0.4,
    enableAccidents = true,
  } = req.body;

  // Reset if already exists
  if (simulations.has(location)) {
    simulations.get(location).reset();
  }

  const sim = getOrCreateSimulation(location, {
    width,
    height,
    fps,
    maxVehicles,
    spawnRate,
    enableAccidents,
  });

  // Force fresh simulation
  sim.reset();

  res.status(201).json({
    success: true,
    message: `YOLO simulation started for "${location}".`,
    config: { location, width, height, fps, maxVehicles, spawnRate, enableAccidents },
  });
});

// ── GET /api/ai/yolo/frame ───────────────────────────────────────────────────
// Returns the next detection frame from the simulation.
router.get("/yolo/frame", authMiddleware, (req, res) => {
  const location = req.query.location || "MG Road & Brigade Road: Lane 1";
  const sim = getOrCreateSimulation(location);
  const frame = sim.nextFrame();

  res.json({
    success: true,
    ...frame,
  });
});

// ── GET /api/ai/yolo/batch ───────────────────────────────────────────────────
// Returns multiple frames at once (for batch processing / charts).
router.get("/yolo/batch", authMiddleware, (req, res) => {
  const location = req.query.location || "MG Road & Brigade Road: Lane 1";
  const count = Math.min(parseInt(req.query.count) || 30, 300);
  const sim = getOrCreateSimulation(location);
  const frames = sim.runFrames(count);

  res.json({
    success: true,
    location,
    frameCount: frames.length,
    frames,
  });
});

// ── GET /api/ai/yolo/stats ───────────────────────────────────────────────────
// Returns current simulation statistics.
router.get("/yolo/stats", authMiddleware, (req, res) => {
  const location = req.query.location || "MG Road & Brigade Road: Lane 1";
  const sim = getOrCreateSimulation(location);
  const stats = sim.getStats();

  res.json({
    success: true,
    stats,
  });
});

// ── POST /api/ai/yolo/reset ─────────────────────────────────────────────────
// Resets a simulation for a location.
router.post("/yolo/reset", authMiddleware, (req, res) => {
  const location = req.body.location || "MG Road & Brigade Road: Lane 1";

  if (simulations.has(location)) {
    simulations.get(location).reset();
    res.json({
      success: true,
      message: `Simulation reset for "${location}".`,
    });
  } else {
    res.status(404).json({
      success: false,
      message: `No active simulation found for "${location}".`,
    });
  }
});

// ── GET /api/ai/yolo/active ──────────────────────────────────────────────────
// Lists all active simulation instances.
router.get("/yolo/active", authMiddleware, (req, res) => {
  const active = [];
  for (const [location, sim] of simulations) {
    active.push({
      location,
      totalFrames: sim.frameCount,
      activeVehicles: sim.vehicles.length,
      totalVehiclesSeen: sim.totalVehiclesSeen,
      congestionLevel: sim.getCongestionLevel(sim.vehicles.length),
      uptime: ((Date.now() - sim.startTime) / 1000).toFixed(1) + "s",
    });
  }

  res.json({
    success: true,
    simulations: active,
  });
});

module.exports = router;
