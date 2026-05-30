import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Linking,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter, Color } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import PageWrap from "@/components/layout/PageWrap";
import { tw } from "@/lib/tw";
import { useHistoryStore } from "@/lib/history";
import { SymbolView } from "expo-symbols";
import { resolveDownloadUrl } from "@/lib/tiktok";

const dyn = Color.android.dynamic;

export default function VideoDetail() {
  const { videoid } = useLocalSearchParams<{ videoid: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const item = useHistoryStore((state) =>
    state.history.find((h) => h.id === videoid),
  );

  const [resolving, setResolving] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(
    item?.localUri ?? null,
  );
  const [showPlayer, setShowPlayer] = useState(false);

  const player = useVideoPlayer(streamUrl ?? "", (p) => {
    if (streamUrl) p.play();
  });

  const handlePlay = async () => {
    if (streamUrl) {
      setShowPlayer(true);
      return;
    }
    const url = item?.pageUrl ?? item?.videoUrl;
    if (!url) return;
    setResolving(true);
    try {
      const resolved = await resolveDownloadUrl(url);
      setStreamUrl(resolved);
      setShowPlayer(true);
    } catch {
      Linking.openURL(
        `https://www.tiktok.com/@${item?.author}/video/${videoid}`,
      );
    } finally {
      setResolving(false);
    }
  };

  if (!item) {
    return (
      <PageWrap>
        <View style={tw`flex-1  items-center justify-center p-4`}>
          <Text style={[tw`text-lg mb-4`, { color: dyn.onSurface }]}>
            Video not found
          </Text>
          <Pressable
            onPress={() => router.back()}
            style={[
              tw`px-6 py-2 rounded-full`,
              { backgroundColor: dyn.primary },
            ]}
          >
            <Text style={[tw`font-bold`, { color: dyn.onPrimary }]}>
              Go Back
            </Text>
          </Pressable>
        </View>
      </PageWrap>
    );
  }

  const videoWidth = width - 32;
  const videoHeight = videoWidth * (16 / 9);

  return (
    <PageWrap>
      <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-10`}>
        {/* Header */}
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
              size={20}
              tintColor={dyn.onSurface as string}
            />
          </Pressable>
          <Text style={[tw`ml-3 text-xl font-bold`, { color: dyn.onSurface }]}>
            Video
          </Text>
        </View>

        {/* Video player / thumbnail */}
        <View
          style={[
            tw`mx-4 rounded-3xl overflow-hidden`,
            { backgroundColor: dyn.surfaceContainerLow },
          ]}
        >
          {showPlayer && streamUrl ? (
            <VideoView
              player={player}
              style={{ width: videoWidth, height: videoHeight }}
              nativeControls
              allowsPictureInPicture
            />
          ) : (
            <View>
              <Image
                source={{ uri: item.coverUrl }}
                style={{ width: videoWidth, height: videoHeight }}
                resizeMode="cover"
              />
              {/* Play overlay */}
              <Pressable
                onPress={handlePlay}
                disabled={resolving}
                style={tw`absolute inset-0 items-center justify-center`}
              >
                <View
                  style={[
                    tw`w-16 h-16 rounded-full items-center justify-center`,
                    { backgroundColor: "rgba(0,0,0,0.55)" },
                  ]}
                >
                  {resolving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <SymbolView name="play.fill" size={28} tintColor="#fff" />
                  )}
                </View>
              </Pressable>
            </View>
          )}
        </View>

        {/* Metadata */}
        <View style={tw`px-4 pt-5`}>
          <Text style={[tw`text-xl font-black`, { color: dyn.onSurface }]}>
            @{item.author}
          </Text>
          <Text
            style={[
              tw`text-base mt-1 leading-6`,
              { color: dyn.onSurfaceVariant },
            ]}
          >
            {item.title}
          </Text>

          <View
            style={[
              tw`mt-5 p-4 rounded-2xl flex-row items-center`,
              { backgroundColor: dyn.surfaceContainerLow },
            ]}
          >
            <SymbolView
              name="calendar"
              size={18}
              tintColor={dyn.onSurfaceVariant as string}
            />
            <Text style={[tw`ml-3 text-sm`, { color: dyn.onSurfaceVariant }]}>
              Saved {new Date(item.downloadedAt).toLocaleDateString()} at{" "}
              {new Date(item.downloadedAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>

          {/* Actions */}
          <View style={tw`mt-5 gap-3`}>
            {!showPlayer && (
              <Pressable
                onPress={handlePlay}
                disabled={resolving}
                style={({ pressed }) => [
                  tw`flex-row items-center justify-center p-4 rounded-2xl`,
                  {
                    backgroundColor: pressed
                      ? dyn.secondaryContainer
                      : dyn.primary,
                  },
                ]}
              >
                {resolving ? (
                  <ActivityIndicator
                    size="small"
                    color={dyn.onPrimary as string}
                  />
                ) : (
                  <SymbolView
                    name="play.fill"
                    size={18}
                    tintColor={dyn.onPrimary as string}
                  />
                )}
                <Text
                  style={[
                    tw`ml-2 text-base font-bold`,
                    { color: dyn.onPrimary },
                  ]}
                >
                  {resolving ? "Loading..." : "Play Video"}
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={() =>
                Linking.openURL(
                  `https://www.tiktok.com/@${item.author}/video/${item.id}`,
                )
              }
              style={({ pressed }) => [
                tw`flex-row items-center justify-center p-4 rounded-2xl`,
                {
                  backgroundColor: pressed
                    ? dyn.surfaceContainerHigh
                    : dyn.surfaceContainer,
                },
              ]}
            >
              <SymbolView
                name="arrow.up.right.square"
                size={18}
                tintColor={dyn.onSurface as string}
              />
              <Text
                style={[
                  tw`ml-2 text-base font-medium`,
                  { color: dyn.onSurface },
                ]}
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
