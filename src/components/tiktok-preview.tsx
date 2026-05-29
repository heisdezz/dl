import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Color } from "expo-router";
import { tw } from "@/lib/tw";
import { TikTokMetadata } from "@/lib/tiktok";

const dyn = Color.android.dynamic;

interface TikTokPreviewProps {
  metadata: TikTokMetadata;
}

export function TikTokPreview({ metadata }: TikTokPreviewProps) {
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
          style={[tw`text-sm opacity-80`, { color: dyn.onSurfaceVariant }]}
          numberOfLines={3}
        >
          {metadata.title}
        </Text>
      </View>
    </View>
  );
}
