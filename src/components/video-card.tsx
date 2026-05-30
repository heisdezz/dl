import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Color } from "expo-router";
import { tw } from "@/lib/tw";
import { TikTokMetadata } from "@/lib/tiktok";
import { SymbolView } from "expo-symbols";
import { useHistoryStore } from "@/lib/history";
import { downloadVideo } from "@/lib/downloader";

const dyn = Color.android.dynamic;

interface VideoCardProps {
  metadata: TikTokMetadata;
  onDownload?: () => void;
}

export function VideoCard({ metadata, onDownload }: VideoCardProps) {
  const addItem = useHistoryStore((state) => state.addItem);
  const downloadPath = useHistoryStore((state) => state.downloadPath);

  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    if (!metadata.videoUrl) {
      Alert.alert(
        "Cannot Download",
        "Direct video URL is not available. Please ensure you have a valid session ID in Settings to fetch video URLs.",
      );
      return;
    }

    setDownloading(true);
    setProgress(0);

    try {
      const filename = `${metadata.author}_${metadata.id}.mp4`.replace(
        /[^a-zA-Z0-9_.]/g,
        "_",
      );
      await downloadVideo(metadata.videoUrl, filename, downloadPath, (p) =>
        setProgress(p.progress),
      );

      addItem(metadata);
      onDownload?.();
      Alert.alert("Success", "Video downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      Alert.alert(
        "Download Failed",
        "There was an error downloading the video.",
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <View
      style={[
        tw`p-4 rounded-3xl border mt-4 flex-row items-center`,
        {
          backgroundColor: dyn.surfaceContainerLow,
          borderColor: dyn.outlineVariant,
        },
      ]}
    >
      <Image
        source={{ uri: metadata.coverUrl }}
        style={tw`w-20 h-28 rounded-2xl bg-gray-200`}
        resizeMode="cover"
      />
      <View style={tw`ml-4 flex-1`}>
        <Text
          style={[tw`text-lg font-bold mb-1`, { color: dyn.onSurface }]}
          numberOfLines={1}
        >
          {metadata.author}
        </Text>
        <Text
          style={[tw`text-sm opacity-80 mb-3`, { color: dyn.onSurfaceVariant }]}
          numberOfLines={2}
        >
          {metadata.title}
        </Text>

        <Pressable
          onPress={handleDownload}
          disabled={downloading}
          style={({ pressed }) => [
            tw`flex-row items-center self-start px-4 py-2 rounded-full overflow-hidden`,
            {
              backgroundColor: pressed
                ? dyn.primaryContainer
                : dyn.secondaryContainer,
              opacity: downloading ? 0.8 : 1,
            },
          ]}
        >
          {downloading && (
            <View
              style={[
                tw`absolute left-0 top-0 bottom-0`,
                {
                  width: `${progress * 100}%`,
                  backgroundColor: dyn.primary,
                  opacity: 0.3,
                },
              ]}
            />
          )}

          {downloading ? (
            <ActivityIndicator
              size="small"
              color={dyn.onSecondaryContainer as string}
            />
          ) : (
            <SymbolView
              name="arrow.down.to.line.circle.fill"
              size={18}
              tintColor={dyn.onSecondaryContainer as string}
            />
          )}

          <Text
            style={[
              tw`ml-2 text-sm font-bold`,
              { color: dyn.onSecondaryContainer },
            ]}
          >
            {downloading
              ? progress > 0
                ? `${Math.round(progress * 100)}%`
                : "Downloading..."
              : "Download"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
