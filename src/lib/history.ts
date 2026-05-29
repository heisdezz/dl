import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TikTokMetadata } from "./tiktok";

export interface HistoryItem extends TikTokMetadata {
  downloadedAt: number;
}

interface HistoryState {
  history: HistoryItem[];
  downloadPath: string | null;
  addItem: (item: TikTokMetadata) => void;
  removeItem: (id: string) => void;
  clearHistory: () => void;
  setDownloadPath: (path: string | null) => void;
}

// Easy to swap AsyncStorage with MMKV here later
const storage = createJSONStorage(() => {
  try {
    return AsyncStorage;
  } catch (e) {
    console.warn("AsyncStorage not available, falling back to dummy storage");
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    } as any;
  }
});

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],
      downloadPath: null,
      addItem: (item) =>
        set((state) => {
          const exists = state.history.find((h) => h.id === item.id);
          if (exists) return state;
          return {
            history: [{ ...item, downloadedAt: Date.now() }, ...state.history],
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
      storage,
    },
  ),
);
