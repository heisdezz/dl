import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import PageWrap from "@/components/layout/PageWrap";
import { tw } from "@/lib/tw";
import { Color } from "expo-router";
import { deleteAsync } from "expo-file-system/legacy";
import {
  useHistoryStore,
  useFilteredHistory,
  SortOrder,
} from "@/lib/history";
import { HistoryCard } from "@/components/history-card";
import { SymbolView } from "expo-symbols";

const dyn = Color.android.dynamic;

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "author", label: "A–Z" },
];

export default function Videos() {
  const allHistory = useHistoryStore((s) => s.history);
  const clearHistory = useHistoryStore((s) => s.clearHistory);
  const filter = useHistoryStore((s) => s.filter);
  const setFilter = useHistoryStore((s) => s.setFilter);
  const resetFilter = useHistoryStore((s) => s.resetFilter);
  const filtered = useFilteredHistory();

  const handleClearAll = () => {
    Alert.alert("Clear All", "Delete all videos and remove from history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete All",
        style: "destructive",
        onPress: async () => {
          await Promise.allSettled(
            allHistory
              .filter((h) => h.localUri)
              .map((h) => deleteAsync(h.localUri!, { idempotent: true })),
          );
          clearHistory();
        },
      },
    ]);
  };

  const isFiltered =
    filter.query.trim() !== "" ||
    filter.localOnly ||
    filter.sort !== "newest";

  return (
    <PageWrap>
      <View style={tw`flex-1`}>
        {/* Header */}
        <View style={tw`flex-row items-center justify-between px-4 pt-4 pb-3`}>
          <View>
            <Text style={[tw`text-2xl font-bold`, { color: dyn.onSurface }]}>
              Downloads
            </Text>
            <Text style={[tw`text-sm mt-0.5`, { color: dyn.onSurfaceVariant }]}>
              {filtered.length !== allHistory.length
                ? `${filtered.length} of ${allHistory.length}`
                : `${allHistory.length} video${allHistory.length !== 1 ? "s" : ""}`}
            </Text>
          </View>

          <View style={tw`flex-row gap-2`}>
            {isFiltered && (
              <Pressable
                onPress={resetFilter}
                style={({ pressed }) => [
                  tw`p-2 rounded-full`,
                  { backgroundColor: pressed ? dyn.secondaryContainer : dyn.surfaceContainerHigh },
                ]}
              >
                <SymbolView name="xmark" size={16} tintColor={dyn.onSurface as string} />
              </Pressable>
            )}
            {allHistory.length > 0 && (
              <Pressable
                onPress={handleClearAll}
                style={({ pressed }) => [
                  tw`p-2 rounded-full`,
                  { backgroundColor: pressed ? dyn.errorContainer : "transparent" },
                ]}
              >
                <SymbolView name="trash" size={20} tintColor={dyn.error as string} />
              </Pressable>
            )}
          </View>
        </View>

        {allHistory.length > 0 && (
          <View style={tw`px-4 gap-3 pb-3`}>
            {/* Search bar */}
            <View
              style={[
                tw`flex-row items-center gap-2 px-3 h-11 rounded-2xl`,
                { backgroundColor: dyn.surfaceContainerHigh },
              ]}
            >
              <SymbolView
                name="magnifyingglass"
                size={16}
                tintColor={dyn.onSurfaceVariant as string}
              />
              <TextInput
                value={filter.query}
                onChangeText={(q) => setFilter({ query: q })}
                placeholder="Search by author or title…"
                placeholderTextColor={dyn.onSurfaceVariant as string}
                style={[tw`flex-1 text-sm`, { color: dyn.onSurface }]}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="search"
              />
              {filter.query.length > 0 && (
                <Pressable onPress={() => setFilter({ query: "" })} hitSlop={8}>
                  <SymbolView
                    name="xmark.circle.fill"
                    size={16}
                    tintColor={dyn.onSurfaceVariant as string}
                  />
                </Pressable>
              )}
            </View>

            {/* Sort chips + local-only toggle */}
            <View style={tw`flex-row gap-2 flex-wrap`}>
              {SORT_OPTIONS.map((opt) => {
                const active = filter.sort === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setFilter({ sort: opt.value })}
                    style={[
                      tw`px-3 py-1.5 rounded-full`,
                      {
                        backgroundColor: active
                          ? dyn.secondaryContainer
                          : dyn.surfaceContainerHigh,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        tw`text-xs font-semibold`,
                        {
                          color: active
                            ? dyn.onSecondaryContainer
                            : dyn.onSurfaceVariant,
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}

              <Pressable
                onPress={() => setFilter({ localOnly: !filter.localOnly })}
                style={[
                  tw`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full`,
                  {
                    backgroundColor: filter.localOnly
                      ? dyn.primaryContainer
                      : dyn.surfaceContainerHigh,
                  },
                ]}
              >
                <SymbolView
                  name="arrow.down.circle.fill"
                  size={12}
                  tintColor={
                    (filter.localOnly
                      ? dyn.onPrimaryContainer
                      : dyn.onSurfaceVariant) as string
                  }
                />
                <Text
                  style={[
                    tw`text-xs font-semibold`,
                    {
                      color: filter.localOnly
                        ? dyn.onPrimaryContainer
                        : dyn.onSurfaceVariant,
                    },
                  ]}
                >
                  Downloaded
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {filtered.length === 0 ? (
          <View style={tw`flex-1 items-center justify-center gap-3`}>
            <SymbolView
              name={allHistory.length === 0 ? "arrow.down.circle" : "magnifyingglass"}
              size={48}
              tintColor={dyn.onSurfaceVariant as string}
            />
            <Text style={[tw`text-base`, { color: dyn.onSurfaceVariant }]}>
              {allHistory.length === 0 ? "No downloads yet" : "No results"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <HistoryCard item={item} />}
            contentContainerStyle={tw`px-4 pb-28 pt-1`}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </PageWrap>
  );
}
