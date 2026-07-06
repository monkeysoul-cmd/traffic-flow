# 🧪 TrafficFlow Simulation Engine

This directory contains standalone simulation modules, AI configurations, and developer agent custom skill settings.

## 📁 Contents

- **`.agents/`**: Workspace-scoped customization skills (e.g., YOLO Simulation Specifications).
- **`yolo-simulation.js`**: Standalone vehicle tracking, detection, and collision simulation logic.

## 🚀 Standalone Run Spec

The simulation matches exactly the structure expected by:
- The Express backend route at `/api/ai/yolo/*`
- The Next.js Genkit Flow Action at `yoloSimulationFlow`

For specifications and exact frame formats, refer to the custom skill file:
[SKILL.md](file:///d:/downloads/project%20(1)/simulation/.agents/skills/yolo-simulation/SKILL.md)
