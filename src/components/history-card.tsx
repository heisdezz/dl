import React from "react";
import { View, Text, Image, Pressable, Share, Alert } from "react-native";
import { Color, useRouter } from "expo-router";
import { tw } from "@/lib/tw";
import { HistoryItem, useHistoryStore } from "@/lib/history";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import { Logger } from "@/lib/logger";

const dyn = Color.android.dynamic;

interface HistoryCardProps {
  item: HistoryItem;
}

export function HistoryCard({ item }: HistoryCardProps) {
  const removeItem = useHistoryStore((s) => s.removeItem);
  const deleteItem = useHistoryStore((s) => s.deleteItem);
  const router = useRouter();

  const handleShare = async () => {
    Logger.info("Share requested (HistoryCard)", {
      id: item.id,
      uri: item.localUri,
    });
    try {
      if (item.localUri && (await Sharing.isAvailableAsync())) {
        let uriToShare = item.localUri;
        if (uriToShare.startsWith("content://")) {
          Logger.info("Converting content URI to file URI for sharing");
          const tempFile =
            (FileSystem.cacheDirectory ?? "") + `share_${item.id}.mp4`;
          await FileSystem.copyAsync({ from: uriToShare, to: tempFile });
          uriToShare = tempFile;
        }
        await Sharing.shareAsync(uriToShare);
        Logger.info("Share completed");
      } else {
        const shareUrl =
          item.pageUrl ??
          `https://www.tiktok.com/@${item.author}/video/${item.id}`;
        await Share.share({
          url: shareUrl,
          message: `Check out this TikTok video by @${item.author}: ${shareUrl}`,
        });
        Logger.info("Link share completed");
      }
    } catch (error) {
      Logger.error("Share failed", { error: String(error) });
      Alert.alert("Share Failed", "Could not share the video.");
    }
  };

  return (
    <Pressable
      onPress={() => router.push(`/${item.id}`)}
      style={({ pressed }) => [
        tw`p-3 rounded-2xl border mb-3 flex-row items-center`,
        {
          backgroundColor: pressed
            ? dyn.surfaceContainerHigh
            : dyn.surfaceContainer,
          borderColor: dyn.outlineVariant,
        },
      ]}
    >
      <Image
        source={{ uri: item.coverUrl }}
        style={tw`w-16 h-20 rounded-xl bg-gray-200`}
        resizeMode="cover"
      />

      <View style={tw`ml-3 flex-1`}>
        <Text
          style={[tw`text-base font-bold`, { color: dyn.onSurface }]}
          numberOfLines={1}
        >
          {item.author}
        </Text>
        <Text
          style={[tw`text-xs opacity-70`, { color: dyn.onSurfaceVariant }]}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text
          style={[
            tw`text-[10px] mt-1 opacity-50`,
            { color: dyn.onSurfaceVariant },
          ]}
        >
          {new Date(item.downloadedAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={tw`flex-col gap-1`}>
        {/* Share */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          style={({ pressed }) => [
            tw`p-2 rounded-full`,
            {
              backgroundColor: pressed
                ? dyn.secondaryContainer
                : dyn.surfaceContainerHigh,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="share-variant"
            size={16}
            color={dyn.onSurfaceVariant as string}
          />
        </Pressable>

        {/* Remove from history only */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            removeItem(item.id);
          }}
          style={({ pressed }) => [
            tw`p-2 rounded-full`,
            {
              backgroundColor: pressed
                ? dyn.surfaceVariant
                : dyn.surfaceContainerHigh,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="minus-circle"
            size={16}
            color={dyn.onSurfaceVariant as string}
          />
        </Pressable>

        {/* Delete file + history */}
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            deleteItem(item.id);
          }}
          style={({ pressed }) => [
            tw`p-2 rounded-full`,
            {
              backgroundColor: pressed
                ? dyn.errorContainer
                : dyn.surfaceContainerHigh,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="delete"
            size={16}
            color={dyn.error as string}
          />
        </Pressable>
      </View>
    </Pressable>
  );
}
