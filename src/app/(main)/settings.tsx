import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import PageWrap from "@/components/layout/PageWrap";
import { tw } from "@/lib/tw";
import { Color } from "expo-router";
import { useHistoryStore } from "@/lib/history";
import { useSessionStore } from "@/lib/session";
import { SymbolView } from "expo-symbols";
import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system/legacy";

const dyn = Color.android.dynamic;

export default function Settings() {
  const clearHistory = useHistoryStore((state) => state.clearHistory);
  const historyCount = useHistoryStore((state) => state.history.length);
  const downloadPath = useHistoryStore((state) => state.downloadPath);
  const setDownloadPath = useHistoryStore((state) => state.setDownloadPath);

  const tiktokSessionId = useSessionStore((state) => state.tiktokSessionId);
  const setTiktokSessionId = useSessionStore(
    (state) => state.setTiktokSessionId,
  );

  const [sessionIdInput, setSessionIdInput] = useState(tiktokSessionId || "");

  const handleSaveSessionId = () => {
    setTiktokSessionId(sessionIdInput);
    Alert.alert("Success", "Session ID saved.");
  };

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

  const handlePickFolder = async () => {
    try {
      if (Platform.OS === "android") {
        const permissions =
          await StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          setDownloadPath(permissions.directoryUri);
        }
      } else {
        Alert.alert(
          "Notice",
          "Folder selection is currently optimized for Android.",
        );
      }
    } catch (error) {
      console.error("Failed to pick folder:", error);
      Alert.alert("Error", "Could not select folder.");
    }
  };

  return (
    <PageWrap>
      <View style={tw`p-4 flex-1`}>
        <Text style={[tw`text-2xl font-bold mb-6`, { color: dyn.onSurface }]}>
          Settings
        </Text>

        <View
          style={[
            tw`rounded-3xl border overflow-hidden mb-4`,
            {
              backgroundColor: dyn.surfaceContainer,
              borderColor: dyn.outlineVariant,
            },
          ]}
        >
          {/* TikTok API Section */}
          <View style={tw`p-4 border-b border-gray-100/10`}>
            <Text
              style={[tw`text-base font-bold mb-1`, { color: dyn.onSurface }]}
            >
              TikTok API
            </Text>
            <Text
              style={[
                tw`text-sm opacity-60 mb-3`,
                { color: dyn.onSurfaceVariant },
              ]}
            >
              Enter your sessionid cookie for profile downloads
            </Text>
            <View style={tw`flex-row items-center gap-2`}>
              <TextInput
                value={sessionIdInput}
                onChangeText={setSessionIdInput}
                placeholder="sessionid..."
                placeholderTextColor={dyn.onSurfaceVariant}
                style={[
                  tw`flex-1 h-12 px-4 rounded-2xl border`,
                  {
                    backgroundColor: dyn.surfaceContainerLow,
                    borderColor: dyn.outlineVariant,
                    color: dyn.onSurface,
                  },
                ]}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
              />
              <Pressable
                onPress={handleSaveSessionId}
                style={({ pressed }) => [
                  tw`h-12 px-6 rounded-2xl items-center justify-center`,
                  {
                    backgroundColor: pressed
                      ? dyn.primaryContainer
                      : dyn.primary,
                  },
                ]}
              >
                <Text style={{ color: dyn.onPrimary, fontWeight: "bold" }}>
                  Save
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Downloads Section */}
          <View style={tw`p-4 border-b border-gray-100/10`}>
            <Text
              style={[tw`text-base font-bold mb-1`, { color: dyn.onSurface }]}
            >
              Downloads
            </Text>
            <Text
              style={[
                tw`text-sm opacity-60 mb-4`,
                { color: dyn.onSurfaceVariant },
              ]}
              numberOfLines={1}
            >
              {downloadPath
                ? decodeURIComponent(downloadPath)
                : "No folder selected"}
            </Text>

            <Pressable
              onPress={handlePickFolder}
              style={({ pressed }) => [
                tw`px-6 py-3 rounded-2xl flex-row items-center justify-center`,
                {
                  backgroundColor: pressed
                    ? dyn.secondaryContainer
                    : dyn.primaryContainer,
                },
              ]}
            >
              <SymbolView
                name="folder.fill"
                size={18}
                tintColor={dyn.onPrimaryContainer as string}
              />
              <Text
                style={[
                  tw`ml-2 text-sm font-bold`,
                  { color: dyn.onPrimaryContainer },
                ]}
              >
                Change Download Folder
              </Text>
            </Pressable>
          </View>

          {/* Storage Section */}
          <View
            style={tw`p-4 flex-row items-center justify-between border-b border-gray-100/10`}
          >
            <View>
              <Text style={[tw`text-base font-bold`, { color: dyn.onSurface }]}>
                History
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
