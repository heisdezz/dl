import { Host } from "@expo/ui";
import { ExperimentalStack, Stack } from "expo-router";
import { View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { useHistoryStore } from "@/lib/history";
import { registerBackgroundTask } from "@/lib/background";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Monitor Zustand hydration
    const unsub = useHistoryStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    // Check if it's already hydrated
    if (useHistoryStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return () => unsub();
  }, []);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts or other assets here
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Register background task
        await registerBackgroundTask();
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady && isHydrated) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady, isHydrated]);

  if (!appIsReady || !isHydrated) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
        {/*<ExperimentalStack
          screenOptions={{
            headerShown: false,
          }}
        />*/}
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

import { GestureHandlerRootView } from "react-native-gesture-handler";
