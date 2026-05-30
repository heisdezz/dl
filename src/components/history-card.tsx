import React from "react";
import { View, Text, Image, Pressable, Alert } from "react-native";
import { Color, useRouter } from "expo-router";
import { deleteAsync } from "expo-file-system/legacy";
import { tw } from "@/lib/tw";
import { HistoryItem, useHistoryStore } from "@/lib/history";
import { SymbolView } from "expo-symbols";

const dyn = Color.android.dynamic;

interface HistoryCardProps {
  item: HistoryItem;
}

export function HistoryCard({ item }: HistoryCardProps) {
  const removeItem = useHistoryStore((state) => state.removeItem);
  const router = useRouter();

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

      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          Alert.alert(
            "Delete Video",
            item.localUri
              ? "Remove from history and delete the downloaded file?"
              : "Remove from history?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                  if (item.localUri) {
                    await deleteAsync(item.localUri, { idempotent: true }).catch(
                      () => {},
                    );
                  }
                  removeItem(item.id);
                },
              },
            ],
          );
        }}
        style={({ pressed }) => [
          tw`p-2 rounded-full`,
          { backgroundColor: pressed ? dyn.errorContainer : "transparent" },
        ]}
      >
        <SymbolView
          name="trash.fill"
          size={20}
          tintColor={dyn.error as string}
        />
      </Pressable>
    </Pressable>
  );
}
