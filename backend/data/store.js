const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

// ─── In-Memory Data Store ────────────────────────────────────────────────────
// Pre-seeded with demo data matching the frontend's initial Zustand state.
// Replace with a real database (PostgreSQL, MongoDB, etc.) for production.

const store = {
  // ── Users ──────────────────────────────────────────────────────────────────
  users: [
    {
      id: uuidv4(),
      fullName: "Bitfusion-I Admin",
      email: "admin@trafficflow.com",
      password: bcrypt.hashSync("password", 10),
      governmentId: "GOV-ADMIN-001",
      department: "Traffic Police",
      location: "Bangalore City",
      createdAt: new Date("2024-07-26T10:00:00Z").toISOString(),
    },
  ],

  // ── Traffic Scans ─────────────────────────────────────────────────────────
  trafficScans: [
    {
      id: uuidv4(),
      location: "MG Road & Brigade Road: Lane 1",
      vehicleCount: 42,
      trafficLevel: "Medium",
      potentialIncidents: null,
      model: "yolo",
      timestamp: new Date("2024-07-26T10:30:00Z").toISOString(),
    },
  ],

  // ── Dispatch Logs ─────────────────────────────────────────────────────────
  dispatchLogs: [
    {
      id: 1,
      unit: "police",
      incidentId: "INC-001",
      location: "MG Road & Brigade Road: Lane 1",
      user: "bitfusion-I",
      timestamp: new Date("2024-07-26T10:45:00Z").toISOString(),
    },
    {
      id: 2,
      unit: "ambulance",
      incidentId: "INC-001",
      location: "MG Road & Brigade Road: Lane 1",
      user: "bitfusion-I",
      timestamp: new Date("2024-07-26T10:45:00Z").toISOString(),
    },
  ],

  // ── Light Control Logs ────────────────────────────────────────────────────
  lightControlLogs: [
    {
      id: 1,
      location: "MG Road & Brigade Road: Lane 1",
      action: "Set to GREEN for 60s",
      user: "bitfusion-I",
      timestamp: new Date("2024-07-26T10:46:00Z").toISOString(),
    },
  ],

  // ── Incidents ─────────────────────────────────────────────────────────────
  incidents: [
    {
      id: "INC-001",
      location: "MG Road & Brigade Road: Lane 1",
      type: "Accident",
      priority: "High",
      time: "10:45 AM",
      createdAt: new Date("2024-07-26T10:45:00Z").toISOString(),
    },
    {
      id: "INC-002",
      location: "MG Road & Brigade Road: Lane 2",
      type: "Road Closure",
      priority: "Medium",
      time: "10:30 AM",
      createdAt: new Date("2024-07-26T10:30:00Z").toISOString(),
    },
  ],

  // ── Counters ──────────────────────────────────────────────────────────────
  _nextDispatchId: 3,
  _nextLightControlId: 2,
};

// ── Helper Functions ──────────────────────────────────────────────────────────

function getNextDispatchId() {
  return store._nextDispatchId++;
}

function getNextLightControlId() {
  return store._nextLightControlId++;
}

module.exports = {
  store,
  getNextDispatchId,
  getNextLightControlId,
};
