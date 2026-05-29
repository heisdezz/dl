import { Host } from "@expo/ui";
import { ExperimentalStack, Stack } from "expo-router";

export default function Name(props: any) {
  return (
    <Host style={{ flex: 1 }}>
      <ExperimentalStack
        screenOptions={{
          headerShown: false,
          // presentation: "fullScreenModal",
          // animation: "slide_from_right",
        }}
      />
    </Host>
  );
}
