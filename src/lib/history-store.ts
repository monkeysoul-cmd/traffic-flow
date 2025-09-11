import { create } from 'zustand';
import { produce } from 'immer';

export interface LightControlLog {
    id: number;
    location: string;
    action: string;
    user: string;
    timestamp: Date;
}

export interface DispatchLog {
    id: number;
    unit: string;
    incidentId: string;
    location: string;
    user: string;
    timestamp: Date;
}

export interface DispatchedUnit {
    id: number;
    unit: string;
    time: string;
    incidentId: string;
    location: string;
    timestamp: Date;
}

interface HistoryState {
    lightControlHistory: LightControlLog[];
    dispatchHistory: DispatchLog[];
    addLightControlLog: (log: Omit<LightControlLog, 'id' | 'timestamp'>) => void;
    addDispatchLog: (log: Omit<DispatchLog, 'id' | 'timestamp'>) => void;
    getDispatchedUnits: () => DispatchedUnit[];
}

const initialLightControlHistory: LightControlLog[] = [
    { id: 1, location: 'MG Road & Brigade Road', user: 'bitfusion', action: 'Set to GREEN for 60s', timestamp: new Date(2024, 6, 26, 10, 46) },
    { id: 2, location: 'Marine Drive', user: 'bitfusion', action: 'Set to RED for 30s', timestamp: new Date(2024, 6, 26, 9, 51) },
];

const initialDispatchHistory: DispatchLog[] = [
    { id: 1, unit: 'police', incidentId: 'INC-001', location: 'MG Road & Brigade Road', user: 'bitfusion', timestamp: new Date(2024, 6, 26, 10, 45) },
    { id: 2, unit: 'ambulance', incidentId: 'INC-001', location: 'MG Road & Brigade Road', user: 'bitfusion', timestamp: new Date(2024, 6, 26, 10, 45) },
    { id: 3, unit: 'ambulance', incidentId: 'INC-004', location: 'Marine Drive', user: 'bitfusion', timestamp: new Date(2024, 6, 26, 9, 50) },
];

export const useHistoryStore = create<HistoryState>()((set, get) => ({
    lightControlHistory: initialLightControlHistory,
    dispatchHistory: initialDispatchHistory,
    addLightControlLog: (log) =>
        set(produce((state: HistoryState) => {
            state.lightControlHistory.unshift({
                ...log,
                id: state.lightControlHistory.length + 1,
                timestamp: new Date(),
            });
        })),
    addDispatchLog: (log) =>
        set(produce((state: HistoryState) => {
            state.dispatchHistory.unshift({
                ...log,
                id: state.dispatchHistory.length + 1,
                timestamp: new Date(),
            });
        })),
    getDispatchedUnits: () => {
        const { dispatchHistory } = get();
        return dispatchHistory.map(log => ({
            id: log.id,
            unit: log.unit,
            time: new Date(log.timestamp).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
            }),
            incidentId: log.incidentId,
            location: log.location,
            timestamp: log.timestamp,
        })).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    },
}));

