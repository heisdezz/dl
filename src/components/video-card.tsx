import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { Color } from "expo-router";
import { tw } from "@/lib/tw";
import { TikTokMetadata } from "@/lib/tiktok";
import { SymbolView } from "expo-symbols";
import { useHistoryStore } from "@/lib/history";

const dyn = Color.android.dynamic;

interface VideoCardProps {
  metadata: TikTokMetadata;
  onDownload?: () => void;
}

export function VideoCard({ metadata, onDownload }: VideoCardProps) {
  const addItem = useHistoryStore((state) => state.addItem);

  const handleDownload = () => {
    addItem(metadata);
    onDownload?.();
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
          style={({ pressed }) => [
            tw`flex-row items-center self-start px-4 py-2 rounded-full`,
            {
              backgroundColor: pressed
                ? dyn.primaryContainer
                : dyn.secondaryContainer,
            },
          ]}
        >
          <SymbolView
            name="arrow.down.to.line.circle.fill"
            size={18}
            tintColor={dyn.onSecondaryContainer as string}
          />
          <Text
            style={[
              tw`ml-2 text-sm font-bold`,
              { color: dyn.onSecondaryContainer },
            ]}
          >
            Download
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
