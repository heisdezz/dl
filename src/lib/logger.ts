import { create } from "zustand";

export type LogLevel = "info" | "warn" | "error" | "crash";

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  data?: string;
  timestamp: number;
}

interface LogState {
  entries: LogEntry[];
  addEntry: (entry: LogEntry) => void;
  clear: () => void;
}

export const useLogStore = create<LogState>()((set) => ({
  entries: [],
  addEntry: (entry) =>
    set((state) => ({ entries: [entry, ...state.entries] })),
  clear: () => set({ entries: [] }),
}));

let _seq = 0;

function log(level: LogLevel, message: string, data?: unknown) {
  const entry: LogEntry = {
    id: `${Date.now()}-${_seq++}`,
    level,
    message,
    data: data !== undefined ? JSON.stringify(data, null, 2) : undefined,
    timestamp: Date.now(),
  };
  useLogStore.getState().addEntry(entry);
  if (level === "error" || level === "crash") {
    console.error(`[${level.toUpperCase()}] ${message}`, data ?? "");
  } else if (level === "warn") {
    console.warn(`[WARN] ${message}`, data ?? "");
  } else {
    console.log(`[INFO] ${message}`, data ?? "");
  }
}

export const Logger = {
  info: (message: string, data?: unknown) => log("info", message, data),
  warn: (message: string, data?: unknown) => log("warn", message, data),
  error: (message: string, data?: unknown) => log("error", message, data),
  crash: (message: string, data?: unknown) => log("crash", message, data),
};
