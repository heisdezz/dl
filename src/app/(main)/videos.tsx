import React from "react";
import { View, Text, FlatList, Pressable, Alert } from "react-native";
import PageWrap from "@/components/layout/PageWrap";
import { tw } from "@/lib/tw";
import { Color } from "expo-router";
import { deleteAsync } from "expo-file-system/legacy";
import { useHistoryStore } from "@/lib/history";
import { HistoryCard } from "@/components/history-card";
import { SymbolView } from "expo-symbols";

const dyn = Color.android.dynamic;

export default function Videos() {
  const history = useHistoryStore((state) => state.history);
  const clearHistory = useHistoryStore((state) => state.clearHistory);

  const handleClearAll = () => {
    Alert.alert("Clear All", "Delete all videos and remove from history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete All",
        style: "destructive",
        onPress: async () => {
          await Promise.allSettled(
            history
              .filter((h) => h.localUri)
              .map((h) => deleteAsync(h.localUri!, { idempotent: true })),
          );
          clearHistory();
        },
      },
    ]);
  };

  return (
    <PageWrap>
      <View style={tw`flex-1`}>
        {/* Header */}
        <View style={tw`flex-row items-center justify-between px-4 pt-4 pb-2`}>
          <View>
            <Text style={[tw`text-2xl font-bold`, { color: dyn.onSurface }]}>
              Downloads
            </Text>
            {history.length > 0 && (
              <Text style={[tw`text-sm mt-0.5`, { color: dyn.onSurfaceVariant }]}>
                {history.length} video{history.length !== 1 ? "s" : ""}
              </Text>
            )}
          </View>

          {history.length > 0 && (
            <Pressable
              onPress={handleClearAll}
              style={({ pressed }) => [
                tw`p-2 rounded-full`,
                { backgroundColor: pressed ? dyn.errorContainer : "transparent" },
              ]}
            >
              <SymbolView
                name="trash"
                size={20}
                tintColor={dyn.error as string}
              />
            </Pressable>
          )}
        </View>

        {history.length === 0 ? (
          <View style={tw`flex-1 items-center justify-center gap-3`}>
            <SymbolView
              name="arrow.down.to.line.circle"
              size={48}
              tintColor={dyn.onSurfaceVariant as string}
            />
            <Text style={[tw`text-base`, { color: dyn.onSurfaceVariant }]}>
              No downloads yet
            </Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <HistoryCard item={item} />}
            contentContainerStyle={tw`px-4 pb-28 pt-2`}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </PageWrap>
  );
}
