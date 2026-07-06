---
name: yolo-simulation
description: >
  Documentation and instructions for the YOLO vehicle detection simulator.
  Use this skill to understand the capabilities, format, and behavior of the simulated YOLO engine.
---

# YOLO Vehicle Detection Simulator

This directory defines the specifications, behavior, and APIs for the YOLO Vehicle Detection Simulator. The simulator is designed to mimic a real edge-deployed YOLOv5 detector by generating frame-by-frame traffic statistics, vehicle bounding boxes, centroids, tracking IDs, speed estimations, and incident detections.

## Key Features

1.  **Multi-Class Detection:** Simulates 5 vehicle types: `car`, `truck`, `bus`, `motorcycle`, and `bicycle` with realistic sizes, speed profiles, and probabilities.
2.  **Centroid Tracking:** Assigns a persistent ID (e.g., `VEH-l3a9f-4318`) to each vehicle, tracking it across frames.
3.  **Speed Estimation:** Calculates displacement per frame and smooths it using jittered velocity to estimate speed in km/h.
4.  **Emergency Vehicles:** Simulates ambulances, fire trucks, and police units moving at higher speeds with corresponding priority flags.
5.  **Collision Detection:** Randomly simulates vehicle overlaps to trigger traffic accidents and safety overrides.
6.  **Congestion Classification:** Rates traffic density from `Low`, `Medium`, `High`, to `Critical`.

---

## APIs and Access Methods

The YOLO simulation can be invoked through two interfaces:

### 1. Next.js Genkit Flow (Server Action)

Located in [frontend/src/ai/flows/yolo-simulation.js](file:///d:/downloads/project%20(1)/frontend/src/ai/flows/yolo-simulation.js).

**Inputs:**
```json
{
  "action": "start" | "frame" | "stats" | "reset",
  "location": "MG Road & Brigade Road: Lane 1"
}
```

### 2. Express.js REST API

Located in [backend/routes/ai.js](file:///d:/downloads/project%20(1)/backend/routes/ai.js).

*   `POST /api/ai/yolo/start` - Initialize/reset simulation for a lane.
*   `GET /api/ai/yolo/frame?location=...` - Get next frame data.
*   `GET /api/ai/yolo/stats?location=...` - Get overall stats.
*   `POST /api/ai/yolo/reset` - Reset statistics for a lane.
*   `GET /api/ai/yolo/active` - List active simulations.

---

## Bounding Box Data Structure

Detection bounding boxes are represented as an array of 4 integers:
`[x, y, width, height]`

**Example Frame Output:**
```json
{
  "frame": 42,
  "timestamp": 2.8,
  "detections": [
    {
      "id": "VEH-l3jg2-8821",
      "class": "car",
      "bbox": [120, 280, 85, 62],
      "centroid": [162, 311],
      "confidence": 0.89,
      "speed": 47,
      "isEmergency": false,
      "emergencyType": null,
      "framesTracked": 12,
      "color": "#3b82f6"
    }
  ],
  "summary": {
    "activeVehicles": 1,
    "totalVehiclesSeen": 8,
    "congestionLevel": "Low",
    "averageSpeed": 47,
    "emergencyVehiclesActive": 0
  }
}
```
