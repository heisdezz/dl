import { Host } from "@expo/ui";
import { ExperimentalStack, Stack } from "expo-router";
import { View } from "react-native";

export default function Name(props: any) {
  return (
    <ExperimentalStack
      screenOptions={{
        headerShown: false,
        // presentation: "fullScreenModal",
        // animation: "slide_from_right",
      }}
    />
  );
}
