import React from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import PageWrap from "@/components/layout/PageWrap";
import { tw } from "@/lib/tw";
import { Color, useRouter } from "expo-router";
import { useHistoryStore } from "@/lib/history";
import { useSessionStore } from "@/lib/session";
import { SymbolView } from "expo-symbols";
import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system/legacy";

const dyn = Color.android.dynamic;

export default function Settings() {
  const router = useRouter();
  const clearHistory = useHistoryStore((state) => state.clearHistory);
  const historyCount = useHistoryStore((state) => state.history.length);
  const downloadPath = useHistoryStore((state) => state.downloadPath);
  const setDownloadPath = useHistoryStore((state) => state.setDownloadPath);

  const tiktokSessionId = useSessionStore((s) => s.tiktokSessionId);
  const logout = useSessionStore((s) => s.logout);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Remove your TikTok session?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
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
          {/* TikTok Account Section */}
          <View style={tw`p-4 border-b border-gray-100/10`}>
            <Text style={[tw`text-base font-bold mb-1`, { color: dyn.onSurface }]}>
              TikTok Account
            </Text>

            {tiktokSessionId ? (
              <View style={tw`gap-3`}>
                <View
                  style={[
                    tw`flex-row items-center gap-2 px-3 py-2 rounded-2xl self-start`,
                    { backgroundColor: dyn.secondaryContainer },
                  ]}
                >
                  <SymbolView
                    name="checkmark.circle.fill"
                    size={14}
                    tintColor={dyn.onSecondaryContainer as string}
                  />
                  <Text style={[tw`text-sm font-semibold`, { color: dyn.onSecondaryContainer }]}>
                    Session active
                  </Text>
                </View>
                <Text style={[tw`text-xs`, { color: dyn.onSurfaceVariant }]}>
                  Session ID: {tiktokSessionId.slice(0, 8)}•••
                </Text>
                <Pressable
                  onPress={handleLogout}
                  style={({ pressed }) => [
                    tw`flex-row items-center gap-2 px-4 py-2.5 rounded-2xl self-start`,
                    { backgroundColor: pressed ? dyn.errorContainer : dyn.surfaceContainerHigh },
                  ]}
                >
                  <SymbolView name="rectangle.portrait.and.arrow.right" size={15} tintColor={dyn.error as string} />
                  <Text style={[tw`text-sm font-semibold`, { color: dyn.error }]}>Sign Out</Text>
                </Pressable>
              </View>
            ) : (
              <View style={tw`gap-3`}>
                <Text style={[tw`text-sm`, { color: dyn.onSurfaceVariant }]}>
                  Sign in to enable private video downloads and profile sync.
                </Text>
                <View
                  style={[
                    tw`flex-row items-start gap-2 p-3 rounded-2xl`,
                    { backgroundColor: dyn.tertiaryContainer ?? dyn.surfaceContainerHigh },
                  ]}
                >
                  <SymbolView
                    name="info.circle.fill"
                    size={14}
                    tintColor={dyn.onTertiaryContainer as string ?? dyn.onSurfaceVariant as string}
                  />
                  <Text style={[tw`text-xs flex-1 leading-4`, { color: dyn.onSurfaceVariant }]}>
                    Only email & password login works — phone number and Google/Apple sign-in cannot be captured.
                  </Text>
                </View>
                <Pressable
                  onPress={() => router.push("/tiktok-login")}
                  style={({ pressed }) => [
                    tw`flex-row items-center justify-center gap-2 py-3 rounded-2xl`,
                    { backgroundColor: pressed ? dyn.primaryContainer : dyn.primary },
                  ]}
                >
                  <SymbolView name="person.crop.circle.badge.plus" size={18} tintColor={dyn.onPrimary as string} />
                  <Text style={[tw`text-sm font-bold`, { color: dyn.onPrimary }]}>
                    Sign in with TikTok
                  </Text>
                </Pressable>
              </View>
            )}
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

          <Pressable
            onPress={() => router.push("/logs")}
            style={({ pressed }) => [
              tw`p-4 flex-row items-center justify-between border-b border-gray-100/10`,
              { backgroundColor: pressed ? dyn.surfaceContainerHigh : "transparent" },
            ]}
          >
            <View style={tw`flex-row items-center gap-3`}>
              <SymbolView
                name="list.bullet.clipboard.fill"
                size={20}
                tintColor={dyn.onSurfaceVariant as string}
              />
              <Text style={[tw`text-base font-medium`, { color: dyn.onSurface }]}>
                Logs
              </Text>
            </View>
            <SymbolView
              name="chevron.right"
              size={14}
              tintColor={dyn.onSurfaceVariant as string}
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
