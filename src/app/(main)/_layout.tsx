import { Color } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";

const TABS = [
  { name: "index", label: "Home", sf: "house.fill", md: "home" },
  { name: "videos", label: "Videos", sf: "video.fill", md: "video_library" },
  { name: "settings", label: "Settings", sf: "gearshape.fill", md: "settings" },
] as const;

export default function Layout() {
  return (
    <NativeTabs>
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Icon sf={tab.sf} md={tab.md} />
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
