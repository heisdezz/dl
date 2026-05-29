import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import PageWrap from "@/components/layout/PageWrap";
import { tw } from "@/lib/tw";
import { Color } from "expo-router";
import { useHistoryStore } from "@/lib/history";
import { SymbolView } from "expo-symbols";

const dyn = Color.android.dynamic;

export default function Settings() {
  const clearHistory = useHistoryStore((state) => state.clearHistory);
  const historyCount = useHistoryStore((state) => state.history.length);

  const handleClear = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to delete all downloaded videos from your history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: clearHistory,
        },
      ],
    );
  };

  return (
    <PageWrap>
      <View style={tw`p-4 flex-1`}>
        <Text style={[tw`text-2xl font-bold mb-6`, { color: dyn.onSurface }]}>
          Settings
        </Text>

        <View
          style={[
            tw`rounded-3xl border overflow-hidden`,
            {
              backgroundColor: dyn.surfaceContainer,
              borderColor: dyn.outlineVariant,
            },
          ]}
        >
          <View
            style={tw`p-4 flex-row items-center justify-between border-b border-gray-100/10`}
          >
            <View>
              <Text style={[tw`text-base font-bold`, { color: dyn.onSurface }]}>
                Storage
              </Text>
              <Text
                style={[
                  tw`text-sm opacity-60`,
                  { color: dyn.onSurfaceVariant },
                ]}
              >
                {historyCount} items in history
              </Text>
            </View>
            <Pressable
              onPress={handleClear}
              disabled={historyCount === 0}
              style={({ pressed }) => [
                tw`px-4 py-2 rounded-full flex-row items-center`,
                {
                  backgroundColor: pressed ? dyn.errorContainer : dyn.error,
                  opacity: historyCount === 0 ? 0.5 : 1,
                },
              ]}
            >
              <SymbolView
                name="trash.fill"
                size={16}
                tintColor={dyn.onError as string}
              />
              <Text
                style={[tw`ml-2 text-sm font-bold`, { color: dyn.onError }]}
              >
                Clear All
              </Text>
            </Pressable>
          </View>

          <View style={tw`p-4`}>
            <Text
              style={[
                tw`text-xs opacity-40 uppercase tracking-widest`,
                { color: dyn.onSurfaceVariant },
              ]}
            >
              About
            </Text>
            <Text style={[tw`mt-2 text-sm`, { color: dyn.onSurfaceVariant }]}>
              TikTok Downloader v1.0.0
            </Text>
          </View>
        </View>
      </View>
    </PageWrap>
  );
}
