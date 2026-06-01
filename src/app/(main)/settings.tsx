import React from "react";
import { View, Text, Pressable, Alert, Platform, Linking } from "react-native";
import PageWrap from "@/components/layout/PageWrap";
import { tw } from "@/lib/tw";
import { Color, useRouter } from "expo-router";
import { useHistoryStore } from "@/lib/history";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system/legacy";

const dyn = Color.android.dynamic;

export default function Settings() {
  const router = useRouter();
  const clearHistory = useHistoryStore((state) => state.clearHistory);
  const historyCount = useHistoryStore((state) => state.history.length);
  const downloadPath = useHistoryStore((state) => state.downloadPath);
  const setDownloadPath = useHistoryStore((state) => state.setDownloadPath);

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
          {/* TikTok Account Section — login flow disabled (needs dev build) */}

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
              <MaterialCommunityIcons
                name="folder"
                size={18}
                color={dyn.onPrimaryContainer as string}
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
              <MaterialCommunityIcons
                name="delete"
                size={16}
                color={dyn.onError as string}
              />
              <Text
                style={[tw`ml-2 text-sm font-bold`, { color: dyn.onError }]}
              >
                Clear All
              </Text>
            </Pressable>
          </View>

          {/* Contact Section */}
          <Pressable
            onPress={() => Linking.openURL("https://github.com/heisdezz/dl")}
            style={({ pressed }) => [
              tw`p-4 flex-row items-center justify-between border-b border-gray-100/10`,
              {
                backgroundColor: pressed
                  ? dyn.surfaceContainerHigh
                  : "transparent",
              },
            ]}
          >
            <View style={tw`flex-row items-center gap-3`}>
              <MaterialCommunityIcons
                name="github"
                size={20}
                color={dyn.onSurfaceVariant as string}
              />
              <Text
                style={[tw`text-base font-medium`, { color: dyn.onSurface }]}
              >
                GitHub
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={14}
              color={dyn.onSurfaceVariant as string}
            />
          </Pressable>

          <Pressable
            onPress={() => Linking.openURL("mailto:ilucide08@gmail.com")}
            style={({ pressed }) => [
              tw`p-4 flex-row items-center justify-between border-b border-gray-100/10`,
              {
                backgroundColor: pressed
                  ? dyn.surfaceContainerHigh
                  : "transparent",
              },
            ]}
          >
            <View style={tw`flex-row items-center gap-3`}>
              <MaterialCommunityIcons
                name="email-outline"
                size={20}
                color={dyn.onSurfaceVariant as string}
              />
              <Text
                style={[tw`text-base font-medium`, { color: dyn.onSurface }]}
              >
                Contact Support
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={14}
              color={dyn.onSurfaceVariant as string}
            />
          </Pressable>

          <Pressable
            onPress={() => router.push("/logs")}
            style={({ pressed }) => [
              tw`p-4 flex-row items-center justify-between border-b border-gray-100/10`,
              {
                backgroundColor: pressed
                  ? dyn.surfaceContainerHigh
                  : "transparent",
              },
            ]}
          >
            <View style={tw`flex-row items-center gap-3`}>
              <MaterialCommunityIcons
                name="clipboard-text"
                size={20}
                color={dyn.onSurfaceVariant as string}
              />
              <Text
                style={[tw`text-base font-medium`, { color: dyn.onSurface }]}
              >
                Logs
              </Text>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={14}
              color={dyn.onSurfaceVariant as string}
            />
          </Pressable>

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
