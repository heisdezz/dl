import { SymbolView } from "expo-symbols";
import { Color, Tabs } from "expo-router";
import { Pressable, Text, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tw } from "@/lib/tw";
import { NativeTabs } from "expo-router/unstable-native-tabs";

import { Platform } from "react-native";

const dyn = Color.android.dynamic;

const TABS = [
  {
    name: "index",
    label: "Home",
    icon: { sf: "house.fill", md: "home" },
  },
  {
    name: "videos",
    label: "Videos",
    icon: { sf: "video.fill", md: "video-library" },
  },
  {
    name: "settings",
    label: "Settings",
    icon: { sf: "gearshape.fill", md: "settings" },
  },
] as const;

function FloatingTabBar({ state, navigation }: any) {
  useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        tw`absolute left-6 right-6 items-center`,
        { bottom: insets.bottom + 16 },
      ]}
      pointerEvents="box-none"
    >
      <View
        style={[
          tw`flex-row rounded-full py-1.5 px-2 border opacity-90`,
          {
            backgroundColor: dyn.surfaceContainer,
            borderColor: dyn.outline,
          },
        ]}
      >
        {TABS.map((tab, index) => {
          const isFocused = state.index === index;

          return (
            <Pressable
              key={tab.name}
              onPress={() => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: state.routes[index]?.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(tab.name);
                }
              }}
              style={tw`items-center px-3.5`}
            >
              <View
                style={[
                  tw`w-[42px] h-[42px] rounded-[26px] items-center justify-center`,
                  isFocused && { backgroundColor: dyn.secondaryContainer },
                ]}
              >
                <SymbolView
                  name={Platform.OS === "ios" ? tab.icon.sf : tab.icon.md}
                  size={24}
                  tintColor={
                    isFocused
                      ? (dyn.onSecondaryContainer as string)
                      : (dyn.onSurfaceVariant as string)
                  }
                  type="hierarchical"
                />
              </View>
              <Text
                style={[
                  tw`text-[11px] font-medium mt-0.5 mb-1`,
                  {
                    color: isFocused
                      ? (dyn.onSurface as string)
                      : (dyn.onSurfaceVariant as string),
                  },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function Layout() {
  return (
    <NativeTabs blurEffect="systemMaterial">
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
          <NativeTabs.Trigger.Icon sf={tab.icon.sf} md={tab.icon.md} />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
