import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TikTokMetadata } from "./tiktok";

export interface HistoryItem extends TikTokMetadata {
  downloadedAt: number;
  localUri?: string;
}

interface HistoryState {
  history: HistoryItem[];
  downloadPath: string | null;
  addItem: (item: TikTokMetadata, localUri?: string) => void;
  removeItem: (id: string) => void;
  clearHistory: () => void;
  setDownloadPath: (path: string | null) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],
      downloadPath: null,
      addItem: (item, localUri) =>
        set((state) => {
          if (state.history.some((h) => h.id === item.id)) return state;
          return {
            history: [
              { ...item, downloadedAt: Date.now(), localUri },
              ...state.history,
            ],
          };
        }),
      removeItem: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        })),
      clearHistory: () => set({ history: [] }),
      setDownloadPath: (path) => set({ downloadPath: path }),
    }),
    {
      name: "video-history-storage",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
