import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface SessionState {
  tiktokSessionId: string | null;
  setTiktokSessionId: (id: string | null) => void;
  isLoggedIn: () => boolean;
  logout: () => void;
}

const storage = createJSONStorage(() => {
  try {
    return AsyncStorage;
  } catch (e) {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    } as any;
  }
});

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      tiktokSessionId: null,
      setTiktokSessionId: (id) => set({ tiktokSessionId: id }),
      isLoggedIn: () => !!get().tiktokSessionId,
      logout: () => set({ tiktokSessionId: null }),
    }),
    {
      name: "session-storage",
      storage,
    },
  ),
);
