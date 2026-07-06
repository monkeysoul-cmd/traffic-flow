/**
 * 🧠 Standalone YOLO Vehicle Detection Simulator
 * ─────────────────────────────────────────────────────────────────────────────
 * Part of the simulation/ directory containing AI and agent configurations.
 */

const VEHICLE_CLASSES = {
  car:        { weight: 0.50, minW: 60,  maxW: 120, minH: 50,  maxH: 90,  color: "#3b82f6", avgSpeed: 45 },
  truck:      { weight: 0.12, minW: 100, maxW: 180, minH: 70,  maxH: 120, color: "#f59e0b", avgSpeed: 35 },
  bus:        { weight: 0.10, minW: 120, maxW: 200, minH: 80,  maxH: 130, color: "#8b5cf6", avgSpeed: 30 },
  motorcycle: { weight: 0.18, minW: 30,  maxW: 60,  minH: 40,  maxH: 70,  color: "#10b981", avgSpeed: 50 },
  bicycle:    { weight: 0.10, minW: 20,  maxW: 45,  minH: 35,  maxH: 60,  color: "#06b6d4", avgSpeed: 15 },
};

const EMERGENCY_TYPES = ["ambulance", "fire_truck", "police"];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function pickWeighted(classes) {
  const entries = Object.entries(classes);
  const totalWeight = entries.reduce((sum, [, v]) => sum + v.weight, 0);
  let r = Math.random() * totalWeight;
  for (const [cls, meta] of entries) {
    r -= meta.weight;
    if (r <= 0) return cls;
  }
  return entries[0][0];
}

class TrackedVehicle {
  constructor({ id, vehicleClass, x, y, w, h, frameWidth, frameHeight, direction }) {
    this.id = id;
    this.vehicleClass = vehicleClass;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.direction = direction;
    this.baseSpeed = VEHICLE_CLASSES[vehicleClass]?.avgSpeed || 40;
    this.speed = this.baseSpeed + rand(-10, 10);
    this.pixelSpeed = this.speed / 4.5;
    this.framesAlive = 0;
    this.isEmergency = false;
    this.emergencyType = null;
    this.confidence = rand(0.72, 0.98);
    this.isActive = true;

    if ((vehicleClass === "truck" || vehicleClass === "bus") && Math.random() < 0.08) {
      this.isEmergency = true;
      this.emergencyType = EMERGENCY_TYPES[randInt(0, EMERGENCY_TYPES.length - 1)];
      this.speed = this.baseSpeed + 25;
      this.pixelSpeed = this.speed / 4.5;
    }
  }

  update() {
    this.framesAlive++;
    const speedJitter = rand(-0.5, 0.5);
    this.pixelSpeed = Math.max(1, Math.min(25, this.pixelSpeed + speedJitter));
    this.speed = this.pixelSpeed * 4.5;

    switch (this.direction) {
      case "right": this.x += this.pixelSpeed; break;
      case "left":  this.x -= this.pixelSpeed; break;
      case "down":  this.y += this.pixelSpeed * 0.6; break;
      case "up":    this.y -= this.pixelSpeed * 0.6; break;
    }

    if (this.direction === "left" || this.direction === "right") {
      this.y += rand(-0.3, 0.3);
    } else {
      this.x += rand(-0.3, 0.3);
    }

    if (this.x + this.w < -50 || this.x > this.frameWidth + 50 ||
        this.y + this.h < -50 || this.y > this.frameHeight + 50) {
      this.isActive = false;
    }

    return this.isActive;
  }

  toDetection() {
    return {
      id: this.id,
      class: this.vehicleClass,
      bbox: [Math.round(this.x), Math.round(this.y), Math.round(this.w), Math.round(this.h)],
      centroid: [Math.round(this.x + this.w / 2), Math.round(this.y + this.h / 2)],
      confidence: parseFloat(this.confidence.toFixed(3)),
      speed: Math.round(this.speed),
      isEmergency: this.isEmergency,
      emergencyType: this.emergencyType,
      framesTracked: this.framesAlive,
      color: VEHICLE_CLASSES[this.vehicleClass]?.color || "#ffffff",
    };
  }
}

class YoloSimulation {
  constructor(options = {}) {
    this.width = options.width || 1280;
    this.height = options.height || 720;
    this.fps = options.fps || 15;
    this.maxVehicles = options.maxVehicles || 30;
    this.spawnRate = options.spawnRate || 0.4;
    this.location = options.location || "MG Road & Brigade Road: Lane 1";
    this.enableAccidents = options.enableAccidents !== false;

    this.vehicles = [];
    this.frameCount = 0;
    this.totalVehiclesSeen = 0;
    this.emergencyEvents = [];
    this.accidents = [];
    this.startTime = Date.now();

    this.lanes = [
      { y: this.height * 0.25, direction: "right" },
      { y: this.height * 0.40, direction: "right" },
      { y: this.height * 0.60, direction: "left" },
      { y: this.height * 0.75, direction: "left" },
    ];
  }

  spawnVehicle() {
    if (this.vehicles.length >= this.maxVehicles) return null;

    const lane = this.lanes[randInt(0, this.lanes.length - 1)];
    const vehicleClass = pickWeighted(VEHICLE_CLASSES);
    const meta = VEHICLE_CLASSES[vehicleClass];

    const w = randInt(meta.minW, meta.maxW);
    const h = randInt(meta.minH, meta.maxH);
    const y = lane.y + rand(-20, 20);
    const x = lane.direction === "right" ? -w : this.width + 10;

    const vehicle = new TrackedVehicle({
      id: `VEH-${Date.now().toString(36)}-${randInt(1000, 9999)}`,
      vehicleClass,
      x, y, w, h,
      frameWidth: this.width,
      frameHeight: this.height,
      direction: lane.direction,
    });

    this.vehicles.push(vehicle);
    this.totalVehiclesSeen++;

    if (vehicle.isEmergency) {
      this.emergencyEvents.push({
        vehicleId: vehicle.id,
        type: vehicle.emergencyType,
        detectedAt: new Date().toISOString(),
        frame: this.frameCount,
        location: this.location,
      });
    }

    return vehicle;
  }

  checkCollisions() {
    if (!this.enableAccidents) return [];
    const newAccidents = [];

    for (let i = 0; i < this.vehicles.length; i++) {
      for (let j = i + 1; j < this.vehicles.length; j++) {
        const a = this.vehicles[i];
        const b = this.vehicles[j];

        const overlap = !(a.x + a.w < b.x || b.x + b.w < a.x ||
                         a.y + a.h < b.y || b.y + b.h < a.y);

        if (overlap && Math.random() < 0.002) {
          const accident = {
            id: `ACC-${Date.now().toString(36)}`,
            vehicles: [a.id, b.id],
            location: this.location,
            frame: this.frameCount,
            position: {
              x: Math.round((a.x + b.x) / 2),
              y: Math.round((a.y + b.y) / 2),
            },
            severity: Math.random() > 0.7 ? "High" : "Medium",
            detectedAt: new Date().toISOString(),
          };
          newAccidents.push(accident);
          this.accidents.push(accident);
        }
      }
    }

    return newAccidents;
  }

  getCongestionLevel(count) {
    if (count >= 25) return "Critical";
    if (count >= 15) return "High";
    if (count >= 8) return "Medium";
    return "Low";
  }

  getAverageSpeed() {
    if (this.vehicles.length === 0) return 0;
    const total = this.vehicles.reduce((sum, v) => sum + v.speed, 0);
    return Math.round(total / this.vehicles.length);
  }

  getClassBreakdown() {
    const counts = {};
    for (const v of this.vehicles) {
      counts[v.vehicleClass] = (counts[v.vehicleClass] || 0) + 1;
    }
    return counts;
  }

  nextFrame() {
    this.frameCount++;
    const timestamp = (this.frameCount / this.fps).toFixed(2);

    if (Math.random() < this.spawnRate) {
      this.spawnVehicle();
    }

    if (this.frameCount % 150 === 0 && Math.random() < 0.3) {
      const burstCount = randInt(3, 6);
      for (let i = 0; i < burstCount; i++) {
        this.spawnVehicle();
      }
    }

    this.vehicles = this.vehicles.filter((v) => v.update());
    const newAccidents = this.checkCollisions();
    const detections = this.vehicles.map((v) => v.toDetection());
    const activeCount = detections.length;

    return {
      frame: this.frameCount,
      timestamp: parseFloat(timestamp),
      elapsed: ((Date.now() - this.startTime) / 1000).toFixed(1),
      location: this.location,
      detections,
      summary: {
        activeVehicles: activeCount,
        totalVehiclesSeen: this.totalVehiclesSeen,
        congestionLevel: this.getCongestionLevel(activeCount),
        averageSpeed: this.getAverageSpeed(),
        classBreakdown: this.getClassBreakdown(),
        emergencyVehiclesActive: detections.filter((d) => d.isEmergency).length,
      },
      events: {
        accidents: newAccidents,
        emergencies: this.emergencyEvents.filter((e) => e.frame === this.frameCount),
      },
      meta: {
        frameWidth: this.width,
        frameHeight: this.height,
        fps: this.fps,
        modelVersion: "YOLOv5-sim-1.0",
        simulatedAt: new Date().toISOString(),
      },
    };
  }

  getStats() {
    return {
      totalFrames: this.frameCount,
      totalVehiclesSeen: this.totalVehiclesSeen,
      currentActiveVehicles: this.vehicles.length,
      congestionLevel: this.getCongestionLevel(this.vehicles.length),
      averageSpeed: this.getAverageSpeed(),
      classBreakdown: this.getClassBreakdown(),
      totalEmergencyEvents: this.emergencyEvents.length,
      totalAccidents: this.accidents.length,
      accidents: this.accidents,
      emergencyEvents: this.emergencyEvents,
      uptime: ((Date.now() - this.startTime) / 1000).toFixed(1) + "s",
      location: this.location,
    };
  }

  reset() {
    this.vehicles = [];
    this.frameCount = 0;
    this.totalVehiclesSeen = 0;
    this.emergencyEvents = [];
    this.accidents = [];
    this.startTime = Date.now();
  }
}

module.exports = { YoloSimulation, VEHICLE_CLASSES, EMERGENCY_TYPES };
