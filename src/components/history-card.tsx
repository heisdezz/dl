import React from "react";
import { View, Text, Image, Pressable, Share } from "react-native";
import { Color, useRouter } from "expo-router";
import { tw } from "@/lib/tw";
import { HistoryItem, useHistoryStore } from "@/lib/history";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";

const dyn = Color.android.dynamic;

interface HistoryCardProps {
  item: HistoryItem;
}

export function HistoryCard({ item }: HistoryCardProps) {
  const removeItem = useHistoryStore((s) => s.removeItem);
  const deleteItem = useHistoryStore((s) => s.deleteItem);
  const router = useRouter();

  const handleShare = async () => {
    if (item.localUri && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(item.localUri);
    } else {
      const shareUrl =
        item.pageUrl ??
        `https://www.tiktok.com/@${item.author}/video/${item.id}`;
      Share.share({
        url: shareUrl,
        message: `Check out this TikTok video by @${item.author}: ${shareUrl}`,
      });
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
