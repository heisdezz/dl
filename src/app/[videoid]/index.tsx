import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, Color } from "expo-router";
import PageWrap from "@/components/layout/PageWrap";
import { tw } from "@/lib/tw";
import { useHistoryStore } from "@/lib/history";
import { SymbolView } from "expo-symbols";
import { useQuery } from "@tanstack/react-query";

const dyn = Color.android.dynamic;

export default function VideoDetail() {
  const { videoid } = useLocalSearchParams<{ videoid: string }>();
  const router = useRouter();
  const history = useHistoryStore((state) => state.history);

  const { data: item, isLoading } = useQuery({
    queryKey: ["video-detail", videoid],
    queryFn: () => {
      const found = history.find((h) => h.id === videoid);
      if (found) return found;
      return null;
    },
  });

  if (isLoading) {
    return (
      <PageWrap>
        <View style={tw`flex-1 items-center justify-center`}>
          <ActivityIndicator size="large" color={dyn.primary as string} />
        </View>
      </PageWrap>
    );
  }

  if (!item) {
    return (
      <PageWrap>
        <View style={tw`flex-1 items-center justify-center p-4`}>
          <Text style={[tw`text-lg mb-4`, { color: dyn.onSurface }]}>
            Video not found
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={tw`bg-blue-500 px-6 py-2 rounded-full`}
          >
            <Text style={tw`text-white font-bold`}>Go Back</Text>
          </Pressable>
        </View>
      </PageWrap>
    );
  }

  return (
    <PageWrap>
      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-10`}>
        {/* Header with Back Button */}
        <View style={tw`flex-row items-center p-4`}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              tw`w-10 h-10 rounded-full items-center justify-center`,
              {
                backgroundColor: pressed
                  ? dyn.surfaceVariant
                  : dyn.surfaceContainer,
              },
            ]}
          >
            <SymbolView
              name="chevron.left"
              size={24}
              tintColor={dyn.onSurface as string}
            />
          </Pressable>
          <Text style={[tw`ml-4 text-xl font-bold`, { color: dyn.onSurface }]}>
            Video Details
          </Text>
        </View>

        {/* Hero Cover Image */}
        <View style={tw`px-4 items-center`}>
          <Image
            source={{ uri: item.coverUrl }}
            style={[
              tw`w-52 rounded-[32px]`,
              {
                aspectRatio: 9 / 16,
                backgroundColor: dyn.surfaceContainerHigh,
              },
            ]}
            resizeMode="cover"
          />
        </View>

        {/* Metadata section */}
        <View style={tw`p-6`}>
          <Text
            style={[tw`text-2xl font-black mb-2`, { color: dyn.onSurface }]}
          >
            @{item.author}
          </Text>
          <Text
            style={[
              tw`text-lg opacity-80 leading-7`,
              { color: dyn.onSurfaceVariant },
            ]}
          >
            {item.title}
          </Text>

          <View
            style={[
              tw`mt-8 p-4 rounded-3xl flex-row items-center`,
              { backgroundColor: dyn.surfaceContainerLow },
            ]}
          >
            <SymbolView
              name="calendar"
              size={20}
              tintColor={dyn.onSurfaceVariant as string}
            />
            <Text
              style={[
                tw`ml-3 text-sm font-medium`,
                { color: dyn.onSurfaceVariant },
              ]}
            >
              Saved on {new Date(item.downloadedAt).toLocaleDateString()} at{" "}
              {new Date(item.downloadedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={tw`mt-8 gap-4`}>
            <Pressable
              onPress={() => {
                const tiktokUrl = `https://www.tiktok.com/@${item.author}/video/${item.id}`;
                Linking.openURL(tiktokUrl);
              }}
              style={({ pressed }) => [
                tw`flex-row items-center justify-center p-4 rounded-3xl`,
                {
                  backgroundColor: pressed ? dyn.primaryContainer : dyn.primary,
                },
              ]}
            >
              <SymbolView
                name="arrow.up.right.square.fill"
                size={20}
                tintColor={dyn.onPrimary as string}
              />
              <Text
                style={[tw`ml-3 text-lg font-bold`, { color: dyn.onPrimary }]}
              >
                View on TikTok
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </PageWrap>
  );
}
