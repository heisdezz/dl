import { useMemo } from "react";
import { create } from "zustand";
import { deleteAsync } from "expo-file-system/legacy";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TikTokMetadata } from "./tiktok";

export interface HistoryItem extends TikTokMetadata {
  downloadedAt: number;
  localUri?: string;
}

export type SortOrder = "newest" | "oldest" | "author";

export interface HistoryFilter {
  query: string;
  localOnly: boolean;
  sort: SortOrder;
}

const DEFAULT_FILTER: HistoryFilter = { query: "", localOnly: false, sort: "newest" };

interface HistoryState {
  history: HistoryItem[];
  downloadPath: string | null;
  filter: HistoryFilter;
  addItem: (item: TikTokMetadata, localUri?: string) => void;
  removeItem: (id: string) => void;
  deleteItem: (id: string) => Promise<void>;
  clearHistory: () => void;
  setDownloadPath: (path: string | null) => void;
  setFilter: (patch: Partial<HistoryFilter>) => void;
  resetFilter: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],
      downloadPath: null,
      filter: DEFAULT_FILTER,
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
      deleteItem: async (id) => {
        const item = useHistoryStore.getState().history.find((h) => h.id === id);
        if (item?.localUri) {
          await deleteAsync(item.localUri, { idempotent: true }).catch(() => {});
        }
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
        }));
      },
      clearHistory: () => set({ history: [] }),
      setDownloadPath: (path) => set({ downloadPath: path }),
      setFilter: (patch) =>
        set((state) => ({ filter: { ...state.filter, ...patch } })),
      resetFilter: () => set({ filter: DEFAULT_FILTER }),
    }),
    {
      name: "video-history-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // don't persist transient filter state
      partialize: (state) => ({
        history: state.history,
        downloadPath: state.downloadPath,
      }),
    },
  ),
);

export function useFilteredHistory(): HistoryItem[] {
  const history = useHistoryStore((s) => s.history);
  const filter = useHistoryStore((s) => s.filter);

  return useMemo(() => {
    const q = filter.query.trim().toLowerCase();
    const filtered = history.filter((item) => {
      if (filter.localOnly && !item.localUri) return false;
      if (!q) return true;
      return (
        item.author.toLowerCase().includes(q) ||
        (item.title?.toLowerCase().includes(q) ?? false)
      );
    });
    return [...filtered].sort((a, b) => {
      switch (filter.sort) {
        case "oldest":
          return a.downloadedAt - b.downloadedAt;
        case "author":
          return a.author.localeCompare(b.author);
        case "newest":
        default:
          return b.downloadedAt - a.downloadedAt;
      }
    });
  }, [history, filter]);
}
