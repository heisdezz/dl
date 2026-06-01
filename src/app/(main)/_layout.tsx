import { Color } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const TABS = [
  { name: "index", label: "Home", icon: "home" },
  { name: "videos", label: "Videos", icon: "video" },
  { name: "settings", label: "Settings", icon: "cog" },
] as const;

export default function Layout() {
  return (
    <NativeTabs>
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Icon
            src={
              <NativeTabs.Trigger.VectorIcon
                family={MaterialCommunityIcons}
                name={tab.icon as any}
              />
            }
          />
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
