import React from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
} from "react-native";
import { useRouter, Color } from "expo-router";
import { SymbolView } from "expo-symbols";
import { tw } from "@/lib/tw";
import { useLogStore, LogEntry, LogLevel } from "@/lib/logger";
import PageWrap from "@/components/layout/PageWrap";

const dyn = Color.android.dynamic;

import type { SFSymbol } from "expo-symbols";

const LEVEL_CONFIG: Record<
  LogLevel,
  { label: string; symbol: SFSymbol; bg: string; text: string }
> = {
  info: { label: "INFO", symbol: "info.circle.fill", bg: "#1a6fff22", text: "#1a6fff" },
  warn: { label: "WARN", symbol: "exclamationmark.triangle.fill", bg: "#f5a62322", text: "#f5a623" },
  error: { label: "ERROR", symbol: "xmark.circle.fill", bg: "#e53e3e22", text: "#e53e3e" },
  crash: { label: "CRASH", symbol: "bolt.fill", bg: "#9b2c2c33", text: "#fc4c4c" },
};

function LogRow({ entry }: { entry: LogEntry }) {
  const cfg = LEVEL_CONFIG[entry.level];
  const time = new Date(entry.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const handleCopy = () => {
    const text = [
      `[${entry.level.toUpperCase()}] ${time}`,
      entry.message,
      entry.data ?? "",
    ]
      .filter(Boolean)
      .join("\n");
    Share.share({ message: text });
  };

  return (
    <View
      style={[
        styles.row,
        { backgroundColor: dyn.surfaceContainerLow, borderColor: dyn.outlineVariant },
      ]}
    >
      <View style={styles.rowTop}>
        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
          <SymbolView name={cfg.symbol} size={11} tintColor={cfg.text} />
          <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
        </View>
        <Text style={[styles.time, { color: dyn.onSurfaceVariant }]}>{time}</Text>
        <Pressable
          onPress={handleCopy}
          style={({ pressed }) => [
            styles.copyBtn,
            { backgroundColor: pressed ? dyn.surfaceContainerHigh : "transparent" },
          ]}
          hitSlop={8}
        >
          <SymbolView
            name="doc.on.doc"
            size={14}
            tintColor={dyn.onSurfaceVariant as string}
          />
        </Pressable>
      </View>
      <Text style={[styles.message, { color: dyn.onSurface }]}>{entry.message}</Text>
      {entry.data ? (
        <Text style={[styles.data, { color: dyn.onSurfaceVariant }]}>{entry.data}</Text>
      ) : null}
    </View>
  );
}

export default function LogsScreen() {
  const router = useRouter();
  const entries = useLogStore((s) => s.entries);
  const clear = useLogStore((s) => s.clear);

  return (
    <PageWrap>
      <View style={tw`flex-row items-center px-4 pt-2 pb-3`}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            tw`w-10 h-10 rounded-full items-center justify-center mr-3`,
            { backgroundColor: pressed ? dyn.surfaceVariant : dyn.surfaceContainer },
          ]}
        >
          <SymbolView name="chevron.left" size={18} tintColor={dyn.onSurface as string} />
        </Pressable>
        <Text style={[tw`flex-1 text-xl font-bold`, { color: dyn.onSurface }]}>
          Logs
        </Text>
        {entries.length > 0 && (
          <Pressable
            onPress={clear}
            style={({ pressed }) => [
              tw`px-3 py-1.5 rounded-full`,
              { backgroundColor: pressed ? dyn.errorContainer : dyn.surfaceContainerHigh },
            ]}
          >
            <Text style={[tw`text-xs font-bold`, { color: dyn.error }]}>Clear</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={entries}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => <LogRow entry={item} />}
        contentContainerStyle={tw`px-4 pb-10`}
        ListEmptyComponent={
          <View style={tw`flex-1 items-center justify-center pt-20`}>
            <SymbolView name="list.bullet.clipboard" size={40} tintColor={dyn.onSurfaceVariant as string} />
            <Text style={[tw`mt-3 text-sm`, { color: dyn.onSurfaceVariant }]}>
              No logs for this session
            </Text>
          </View>
        }
      />
    </PageWrap>
  );
}

const styles = StyleSheet.create({
  row: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  time: {
    flex: 1,
    fontSize: 11,
    opacity: 0.6,
  },
  copyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    fontSize: 13,
    fontWeight: "500",
  },
  data: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: "monospace",
    opacity: 0.75,
  },
});
