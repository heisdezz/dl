import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Share,
  Linking,
  StyleSheet,
} from "react-native";
import { useRouter, Color } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BottomSheet, Button, Column } from "@expo/ui";
import { tw } from "@/lib/tw";
import { useLogStore, LogEntry, LogLevel } from "@/lib/logger";
import PageWrap from "@/components/layout/PageWrap";

const dyn = Color.android.dynamic;

const LEVEL_CONFIG: Record<
  LogLevel,
  {
    label: string;
    symbol: keyof typeof MaterialCommunityIcons.glyphMap;
    bg: string;
    text: string;
  }
> = {
  info: {
    label: "INFO",
    symbol: "information",
    bg: "#1a6fff22",
    text: "#1a6fff",
  },
  warn: {
    label: "WARN",
    symbol: "alert",
    bg: "#f5a62322",
    text: "#f5a623",
  },
  error: {
    label: "ERROR",
    symbol: "close-circle",
    bg: "#e53e3e22",
    text: "#e53e3e",
  },
  crash: {
    label: "CRASH",
    symbol: "flash",
    bg: "#9b2c2c33",
    text: "#fc4c4c",
  },
};

function formatEntry(entry: LogEntry): string {
  const time = new Date(entry.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return [
    `[${entry.level.toUpperCase()}] ${time}  ${entry.message}`,
    entry.data ? `  ${entry.data.replace(/\n/g, "\n  ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatAllEntries(entries: LogEntry[]): string {
  return entries.map(formatEntry).join("\n\n");
}

function openEmail(subject: string, body: string) {
  Linking.openURL(
    `mailto:ilucide08@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  );
}

function openGithubIssue(body: string) {
  const title = encodeURIComponent("Bug Report");
  const bodyText = encodeURIComponent(
    `## Description\n\n<!-- Describe what happened -->\n\n## Logs\n\n\`\`\`\n${body}\n\`\`\``,
  );
  Linking.openURL(
    `https://github.com/heisdezz/dl/issues/new?title=${title}&body=${bodyText}`,
  );
}

// ─── log row ──────────────────────────────────────────────────────────────────

function LogRow({
  entry,
  onOpenSheet,
}: {
  entry: LogEntry;
  onOpenSheet: (entry: LogEntry) => void;
}) {
  const cfg = LEVEL_CONFIG[entry.level];
  const text = formatEntry(entry);
  const time = new Date(entry.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <View
      style={[
        styles.row,
        {
          backgroundColor: dyn.surfaceContainerLow,
          borderColor: dyn.outlineVariant,
        },
      ]}
    >
      <View style={styles.rowTop}>
        <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
          <MaterialCommunityIcons
            name={cfg.symbol}
            size={11}
            color={cfg.text}
          />
          <Text style={[styles.badgeText, { color: cfg.text }]}>
            {cfg.label}
          </Text>
        </View>
        <Text style={[styles.time, { color: dyn.onSurfaceVariant }]}>
          {time}
        </Text>

        {/* copy — direct Share.share */}
        <Pressable
          onPress={() => Share.share({ message: text })}
          style={({ pressed }) => [
            styles.iconBtn,
            {
              backgroundColor: pressed
                ? dyn.surfaceContainerHigh
                : "transparent",
            },
          ]}
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name="content-copy"
            size={14}
            color={dyn.onSurfaceVariant as string}
          />
        </Pressable>

        {/* share — opens sheet with email / github */}
        <Pressable
          onPress={() => onOpenSheet(entry)}
          style={({ pressed }) => [
            styles.iconBtn,
            {
              backgroundColor: pressed
                ? dyn.surfaceContainerHigh
                : "transparent",
            },
          ]}
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name="share-variant"
            size={14}
            color={dyn.onSurfaceVariant as string}
          />
        </Pressable>
      </View>

      <Text style={[styles.message, { color: dyn.onSurface }]}>
        {entry.message}
      </Text>
      {entry.data ? (
        <Text style={[styles.data, { color: dyn.onSurfaceVariant }]}>
          {entry.data}
        </Text>
      ) : null}
    </View>
  );
}

// ─── screen ───────────────────────────────────────────────────────────────────

export default function LogsScreen() {
  const router = useRouter();
  const entries = useLogStore((s) => s.entries);
  const clear = useLogStore((s) => s.clear);

  // null = closed, 'all' = all-logs sheet, LogEntry = single-entry sheet
  const [sheet, setSheet] = useState<null | "all" | LogEntry>(null);

  const closeSheet = () => setSheet(null);

  const allBody = formatAllEntries(entries);
  const entryBody = sheet && sheet !== "all" ? formatEntry(sheet) : "";

  return (
    <>
      <PageWrap>
        <View style={tw`flex-row items-center px-4 pt-2 pb-3  `}>
          <Pressable
            onPress={() => {
              console.log("back");
              router.back();
            }}
            style={({ pressed }) => [
              tw`w-10 h-10 rounded-full items-center justify-center mr-3`,
              {
                backgroundColor: pressed
                  ? dyn.surfaceVariant
                  : dyn.surfaceContainer,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={18}
              color={dyn.onSurface as string}
            />
          </Pressable>

          <Text
            style={[tw`flex-1 text-xl font-bold`, { color: dyn.onSurface }]}
          >
            Logs
          </Text>

          {entries.length > 0 && (
            <>
              <Pressable
                onPress={() => setSheet("all")}
                style={({ pressed }) => [
                  tw`w-9 h-9 rounded-full items-center justify-center mr-2`,
                  {
                    backgroundColor: pressed
                      ? dyn.surfaceContainerHigh
                      : dyn.surfaceContainer,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="share-variant"
                  size={16}
                  color={dyn.onSurface as string}
                />
              </Pressable>
              <Pressable
                onPress={clear}
                style={({ pressed }) => [
                  tw`px-3 py-1.5 rounded-full`,
                  {
                    backgroundColor: pressed
                      ? dyn.errorContainer
                      : dyn.surfaceContainerHigh,
                  },
                ]}
              >
                <Text style={[tw`text-xs font-bold`, { color: dyn.error }]}>
                  Clear
                </Text>
              </Pressable>
            </>
          )}
        </View>

        <FlatList
          data={entries}
          keyExtractor={(e) => e.id}
          renderItem={({ item }) => (
            <LogRow entry={item} onOpenSheet={(e) => setSheet(e)} />
          )}
          contentContainerStyle={tw`px-4 pb-10`}
          ListEmptyComponent={
            <View style={tw`flex-1 items-center justify-center pt-20`}>
              <MaterialCommunityIcons
                name="clipboard-text-outline"
                size={40}
                color={dyn.onSurfaceVariant as string}
              />
              <Text style={[tw`mt-3 text-sm`, { color: dyn.onSurfaceVariant }]}>
                No logs for this session
              </Text>
            </View>
          }
        />
      </PageWrap>

      {/* All-logs sheet — outside PageWrap/Host */}
      <BottomSheet
        isPresented={sheet === "all"}
        onDismiss={closeSheet}
        snapPoints={["half"]}
      >
        <Column spacing={12}>
          <Button
            label="Send via Email"
            variant="outlined"
            onPress={() => {
              closeSheet();
              openEmail("App Logs", allBody);
            }}
          />
          <Button
            label="Open GitHub Issue"
            variant="outlined"
            onPress={() => {
              closeSheet();
              openGithubIssue(allBody);
            }}
          />
          <Button
            label="Share…"
            onPress={() => {
              closeSheet();
              Share.share({ message: allBody });
            }}
          />
        </Column>
      </BottomSheet>

      {/* Single-entry sheet — outside PageWrap/Host */}
      <BottomSheet
        isPresented={!!sheet && sheet !== "all"}
        onDismiss={closeSheet}
        snapPoints={["half"]}
      >
        <Column spacing={12}>
          <Button
            label="Send via Email"
            variant="outlined"
            onPress={() => {
              closeSheet();
              openEmail("Log Entry", entryBody);
            }}
          />
          <Button
            label="Open GitHub Issue"
            variant="outlined"
            onPress={() => {
              closeSheet();
              openGithubIssue(entryBody);
            }}
          />
          <Button
            label="Share…"
            onPress={() => {
              closeSheet();
              Share.share({ message: entryBody });
            }}
          />
        </Column>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  row: { borderRadius: 16, borderWidth: 1, padding: 12, marginBottom: 8 },
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
  badgeText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  time: { flex: 1, fontSize: 11, opacity: 0.6 },
  iconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  message: { fontSize: 13, fontWeight: "500" },
  data: { fontSize: 11, marginTop: 4, fontFamily: "monospace", opacity: 0.75 },
});
