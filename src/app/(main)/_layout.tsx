import { SymbolView } from "expo-symbols";
import { Color, Tabs } from "expo-router";
import { Pressable, Text, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tw } from "@/lib/tw";

const dyn = Color.android.dynamic;

const TABS = [
  { name: "home", label: "Home", symbol: "house.fill" },
  { name: "videos", label: "videos", symbol: "video.fill" },
  { name: "settings", label: "Settings", symbol: "gearshape.fill" },
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
                  name={tab.symbol}
                  size={26}
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
    <Tabs
      screenOptions={{ headerShown: false, animation: "shift" }}
      tabBar={(props) => <FloatingTabBar {...props} />}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
    </Tabs>
  );
}
