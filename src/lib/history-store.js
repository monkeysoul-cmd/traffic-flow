import { create } from "zustand";
import { produce } from "immer";
import { supabase } from "./supabase";

const initialLightControlHistory = [
  {
    id: 1,
    location: "MG Road & Brigade Road: Lane 1",
    user: "bitfusion-I",
    action: "Set to GREEN for 60s",
    timestamp: new Date(2024, 6, 26, 10, 46),
  },
];

const initialDispatchHistory = [
  {
    id: 1,
    unit: "police",
    incidentId: "INC-001",
    location: "MG Road & Brigade Road: Lane 1",
    user: "bitfusion-I",
    timestamp: new Date(2024, 6, 26, 10, 45),
  },
  {
    id: 2,
    unit: "ambulance",
    incidentId: "INC-001",
    location: "MG Road & Brigade Road: Lane 1",
    user: "bitfusion-I",
    timestamp: new Date(2024, 6, 26, 10, 45),
  },
];

const initialIncidents = [
  {
    id: "INC-001",
    location: "MG Road & Brigade Road: Lane 1",
    type: "Accident",
    priority: "High",
    time: "10:45 AM",
  },
  {
    id: "INC-002",
    location: "MG Road & Brigade Road: Lane 2",
    type: "Road Closure",
    priority: "Medium",
    time: "10:30 AM",
  },
];

export const useHistoryStore = create()((set, get) => ({
  lightControlHistory: initialLightControlHistory,
  dispatchHistory: initialDispatchHistory,
  incidents: initialIncidents,
  totalVehiclesBase: 0,
  sessionVehiclesScanned: 0,
  trafficLevel: "Medium",
  activeAlerts: 2,
  autoPilotMode: false,
  currentLiveCounts: {},
  isScanningActive: false,
  avgSpeed: 0,

  setScanningActive: (active) => set({ isScanningActive: active }),
  updateAvgSpeed: (speed) => set({ avgSpeed: speed }),
  addIncident: (incident) =>
    set(
      produce((state) => {
        state.incidents.unshift(incident);
      }),
    ),

  toggleAutoPilot: () =>
    set(
      produce((state) => {
        state.autoPilotMode = !state.autoPilotMode;
      }),
    ),

  updateLiveCount: (location, count) =>
    set(
      produce((state) => {
        state.currentLiveCounts[location] = count;
      }),
    ),

  fetchLogs: async () => {
    if (!supabase) return;
    try {
      const { data: lightLogs, error: lightError } = await supabase
        .from("light_control_logs")
        .select("*")
        .order("timestamp", { ascending: false });
        
      if (!lightError && lightLogs && lightLogs.length > 0) {
        set({
          lightControlHistory: lightLogs.map(l => ({
            id: l.id,
            location: l.location,
            action: l.action,
            user: l.user,
            timestamp: new Date(l.timestamp)
          }))
        });
      }

      const { data: dispatchLogs, error: dispatchError } = await supabase
        .from("dispatch_logs")
        .select("*")
        .order("timestamp", { ascending: false });

      if (!dispatchError && dispatchLogs && dispatchLogs.length > 0) {
        set({
          dispatchHistory: dispatchLogs.map(d => ({
            id: d.id,
            unit: d.unit,
            incidentId: d.incident_id,
            location: d.location,
            user: d.user,
            timestamp: new Date(d.timestamp)
          }))
        });
      }
    } catch (e) {
      console.warn("Failed to fetch logs from Supabase:", e);
    }
  },
  addLightControlLog: (log) => {
    // Update local state instantly
    set(
      produce((state) => {
        state.lightControlHistory.unshift({
          ...log,
          id: state.lightControlHistory.length + 1,
          timestamp: new Date(),
        });
      }),
    );

    // Sync with Supabase (fire and forget with local fallback)
    if (supabase) {
      supabase
        .from("light_control_logs")
        .insert([
          {
            location: log.location,
            action: log.action,
            user: log.user,
            timestamp: new Date().toISOString(),
          },
        ])
        .then(({ error }) => {
          if (error) {
            console.warn("Supabase light control insert warning:", error.message);
          }
        });
    }
  },
  addDispatchLog: (log) => {
    // Update local state instantly
    set(
      produce((state) => {
        state.dispatchHistory.unshift({
          ...log,
          id: state.dispatchHistory.length + 1,
          timestamp: new Date(),
        });
      }),
    );

    // Sync with Supabase (fire and forget with local fallback)
    if (supabase) {
      supabase
        .from("dispatch_logs")
        .insert([
          {
            unit: log.unit,
            incident_id: log.incidentId,
            location: log.location,
            user: log.user,
            timestamp: new Date().toISOString(),
          },
        ])
        .then(({ error }) => {
          if (error) {
            console.warn("Supabase dispatch insert warning:", error.message);
          }
        });
    }
  },
  updateScannedVehicles: (count) =>
    set(
      produce((state) => {
        state.sessionVehiclesScanned = count;
        if (count > 50) {
          state.trafficLevel = "High";
        } else if (count > 15) {
          state.trafficLevel = "Medium";
        } else {
          state.trafficLevel = "Low";
        }
      }),
    ),
  incrementAlerts: () =>
    set(
      produce((state) => {
        state.activeAlerts += 1;
      }),
    ),
  getDispatchedUnits: () => {
    const { dispatchHistory } = get();
    return dispatchHistory
      .map((log) => ({
        id: log.id,
        unit: log.unit,
        time: new Date(log.timestamp).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        }),
        incidentId: log.incidentId,
        location: log.location,
        timestamp: log.timestamp,
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  },
}));
