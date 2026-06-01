import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Linking,
  Share,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter, Color } from "expo-router";
import { useVideoPlayer, VideoView, VideoPlayer } from "expo-video";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { tw } from "@/lib/tw";
import { useHistoryStore } from "@/lib/history";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Sharing from "expo-sharing";

const dyn = Color.android.dynamic;

function fmt(secs: number) {
  const s = Math.floor(secs);
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

function VideoControls({ player }: { player: VideoPlayer }) {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(1);
  const [visible, setVisible] = useState(true);
  const [dragProgress, setDragProgress] = useState<number | null>(null);
  const isDragging = useRef(false);
  const wasPlayingBeforeDrag = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const barRef = useRef<View>(null);
  const barWidth = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      if (!isDragging.current) {
        setPlaying(player.playing);
        setCurrent(player.currentTime ?? 0);
        setDuration(player.duration > 0 ? player.duration : 1);
      }
    }, 250);
    return () => clearInterval(id);
  }, [player]);

  const resetHideTimer = useCallback(() => {
    setVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setVisible(false), 3000);
  }, []);

  useEffect(() => {
    resetHideTimer();
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  const togglePlay = () => {
    player.playing ? player.pause() : player.play();
    resetHideTimer();
  };

  const onDragStart = (x: number) => {
    isDragging.current = true;
    wasPlayingBeforeDrag.current = player.playing;
    if (player.playing) player.pause();
    setDragProgress(Math.max(0, Math.min(1, x / barWidth.current)));
    resetHideTimer();
  };

  const onDragMove = (x: number) => {
    setDragProgress(Math.max(0, Math.min(1, x / barWidth.current)));
  };

  const onDragEnd = (x: number) => {
    const ratio = Math.max(0, Math.min(1, x / barWidth.current));
    player.currentTime = ratio * (player.duration ?? 0);
    if (wasPlayingBeforeDrag.current) player.play();
    isDragging.current = false;
    setDragProgress(null);
    resetHideTimer();
  };

  const progress = dragProgress ?? Math.min(current / duration, 1);

  return (
    <Pressable style={StyleSheet.absoluteFill} onPress={resetHideTimer}>
      {visible && (
        <View style={styles.controlsWrapper}>
          <Pressable onPress={togglePlay} style={styles.centreBtn}>
            <MaterialCommunityIcons
              name={playing ? "pause" : "play"}
              size={40}
              color="#fff"
            />
          </Pressable>

          <View style={styles.bottomBar}>
            <Pressable onPress={togglePlay} hitSlop={8}>
              <MaterialCommunityIcons
                name={playing ? "pause" : "play"}
                size={18}
                color="#fff"
              />
            </Pressable>

            <Text style={styles.timeText}>{fmt(current)}</Text>

            <View
              ref={barRef}
              onLayout={(e) => (barWidth.current = e.nativeEvent.layout.width)}
              style={styles.seekTrack}
              onStartShouldSetResponder={() => true}
              onResponderGrant={(e) => onDragStart(e.nativeEvent.locationX)}
              onResponderMove={(e) => onDragMove(e.nativeEvent.locationX)}
              onResponderRelease={(e) => onDragEnd(e.nativeEvent.locationX)}
              onResponderTerminate={(e) => onDragEnd(e.nativeEvent.locationX)}
            >
              <View
                style={[styles.seekFill, { width: `${progress * 100}%` }]}
              />
              <View
                style={[styles.seekThumb, { left: `${progress * 100}%` }]}
              />
            </View>

            <Text style={styles.timeText}>{fmt(duration)}</Text>

            <Pressable
              onPress={() => {
                player.currentTime = 0;
                player.play();
                resetHideTimer();
              }}
              hitSlop={8}
            >
              <MaterialCommunityIcons name="refresh" size={16} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export default function VideoDetail() {
  const { videoid } = useLocalSearchParams<{ videoid: string }>();
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const item = useHistoryStore((s) => s.history.find((h) => h.id === videoid));
  const removeItem = useHistoryStore((s) => s.removeItem);
  const deleteItem = useHistoryStore((s) => s.deleteItem);
  const [showPlayer, setShowPlayer] = useState(false);

  const player = useVideoPlayer(item?.localUri ?? "");

  const handlePlay = () => {
    setShowPlayer(true);
    player.play();
  };

  if (!item) {
    return (
      <View
        style={[
          tw`flex-1 items-center justify-center gap-4`,
          { backgroundColor: dyn.background, paddingTop: insets.top },
        ]}
      >
        <MaterialCommunityIcons
          name="alert-circle"
          size={48}
          color={dyn.onSurfaceVariant as string}
        />
        <Text style={[tw`text-base`, { color: dyn.onSurfaceVariant }]}>
          Video not found
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={[tw`px-6 py-3 rounded-full`, { backgroundColor: dyn.primary }]}
        >
          <Text style={[tw`font-semibold`, { color: dyn.onPrimary }]}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const videoWidth = width;
  const videoHeight = Math.round(height / 2);

  const savedDate = new Date(item.downloadedAt);
  const dateStr = savedDate.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const timeStr = savedDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

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
    <View style={[tw`flex-1`, { backgroundColor: dyn.background }]}>
      <ScrollView
        style={tw`flex-1`}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
        bounces={false}
      >
        {/* Hero */}
        <View
          style={{
            width: videoWidth,
            height: videoHeight,
            backgroundColor: "#000",
          }}
        >
          {showPlayer && item.localUri ? (
            <>
              <VideoView
                player={player}
                style={{ width: videoWidth, height: videoHeight }}
                nativeControls={false}
                contentFit="contain"
                allowsPictureInPicture
              />
              <VideoControls player={player} />
            </>
          ) : (
            <>
              <Image
                source={{ uri: item.coverUrl }}
                style={{ width: videoWidth, height: videoHeight }}
                contentFit="cover"
              />
              {item.localUri && (
                <Pressable
                  onPress={handlePlay}
                  style={tw`absolute inset-0 items-center justify-center`}
                >
                  <View
                    style={[
                      tw`w-20 h-20 rounded-full items-center justify-center`,
                      { backgroundColor: "rgba(0,0,0,0.45)" },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="play"
                      size={36}
                      color="#fff"
                    />
                  </View>
                </Pressable>
              )}
            </>
          )}

          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              tw`absolute left-4 w-10 h-10 rounded-full items-center justify-center`,
              {
                top: insets.top + 8,
                backgroundColor: pressed
                  ? "rgba(0,0,0,0.55)"
                  : "rgba(0,0,0,0.35)",
              },
            ]}
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={20}
              color="#fff"
            />
          </Pressable>
        </View>

        {/* Content */}
        <View style={tw`px-4 pt-5 gap-4`}>
          <View style={tw`gap-1`}>
            <Text
              style={[tw`text-xl font-black`, { color: dyn.onSurface }]}
              numberOfLines={1}
            >
              @{item.author}
            </Text>
            <Text
              style={[tw`text-sm leading-5`, { color: dyn.onSurfaceVariant }]}
            >
              {item.title}
            </Text>
          </View>

          <View style={tw`flex-row flex-wrap gap-2`}>
            <View
              style={[
                tw`flex-row items-center gap-2 px-3 py-1.5 rounded-full`,
                { backgroundColor: dyn.surfaceContainerLow },
              ]}
            >
              <MaterialCommunityIcons
                name="calendar"
                size={12}
                color={dyn.onSurfaceVariant as string}
              />
              <Text style={[tw`text-xs`, { color: dyn.onSurfaceVariant }]}>
                {dateStr} · {timeStr}
              </Text>
            </View>
            {item.localUri && (
              <View
                style={[
                  tw`flex-row items-center gap-2 px-3 py-1.5 rounded-full`,
                  { backgroundColor: dyn.secondaryContainer },
                ]}
              >
                <MaterialCommunityIcons
                  name="check-circle"
                  size={12}
                  color={dyn.onSecondaryContainer as string}
                />
                <Text
                  style={[
                    tw`text-xs font-medium`,
                    { color: dyn.onSecondaryContainer },
                  ]}
                >
                  Downloaded
                </Text>
              </View>
            )}
          </View>

          <View style={tw`gap-2`}>
            {!showPlayer && item.localUri && (
              <Pressable
                onPress={handlePlay}
                style={({ pressed }) => [
                  tw`flex-row items-center justify-center gap-2 p-4 rounded-2xl`,
                  {
                    backgroundColor: pressed
                      ? dyn.primaryContainer
                      : dyn.primary,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="play"
                  size={16}
                  color={dyn.onPrimary as string}
                />
                <Text
                  style={[tw`text-base font-bold`, { color: dyn.onPrimary }]}
                >
                  Play Video
                </Text>
              </Pressable>
            )}

            {showPlayer && (
              <Pressable
                onPress={() => {
                  player.pause();
                  setShowPlayer(false);
                }}
                style={({ pressed }) => [
                  tw`flex-row items-center justify-center gap-2 p-4 rounded-2xl`,
                  {
                    backgroundColor: pressed
                      ? dyn.surfaceContainerHigh
                      : dyn.surfaceContainer,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="image"
                  size={16}
                  color={dyn.onSurface as string}
                />
                <Text
                  style={[tw`text-base font-medium`, { color: dyn.onSurface }]}
                >
                  Show Thumbnail
                </Text>
              </Pressable>
            )}

            <View style={tw`flex-row gap-2`}>
              <Pressable
                onPress={handleShare}
                style={({ pressed }) => [
                  tw`flex-1 flex-row items-center justify-center gap-2 p-4 rounded-2xl`,
                  {
                    backgroundColor: pressed
                      ? dyn.surfaceContainerHigh
                      : dyn.surfaceContainer,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="share-variant"
                  size={16}
                  color={dyn.onSurface as string}
                />
                <Text
                  style={[tw`text-base font-medium`, { color: dyn.onSurface }]}
                >
                  Share
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  Linking.openURL(
                    `https://www.tiktok.com/@${item.author}/video/${item.id}`,
                  )
                }
                style={({ pressed }) => [
                  tw`flex-1 flex-row items-center justify-center gap-2 p-4 rounded-2xl`,
                  {
                    backgroundColor: pressed
                      ? dyn.surfaceContainerHigh
                      : dyn.surfaceContainer,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="open-in-new"
                  size={16}
                  color={dyn.onSurface as string}
                />
                <Text
                  style={[tw`text-base font-medium`, { color: dyn.onSurface }]}
                >
                  TikTok
                </Text>
              </Pressable>
            </View>

            <View style={tw`flex-row gap-2`}>
              <Pressable
                onPress={() => {
                  removeItem(item.id);
                  router.back();
                }}
                style={({ pressed }) => [
                  tw`flex-1 flex-row items-center justify-center gap-2 p-4 rounded-2xl`,
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
                <Text
                  style={[
                    tw`text-sm font-medium`,
                    { color: dyn.onSurfaceVariant },
                  ]}
                >
                  Remove
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  player.pause();
                  deleteItem(item.id);
                  router.back();
                }}
                style={({ pressed }) => [
                  tw`flex-1 flex-row items-center justify-center gap-2 p-4 rounded-2xl`,
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
                <Text style={[tw`text-sm font-medium`, { color: dyn.error }]}>
                  Delete File
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  controlsWrapper: {
    ...StyleSheet.absoluteFill,
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  centreBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 8,
    gap: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  timeText: {
    color: "#fff",
    fontSize: 12,
    fontVariant: ["tabular-nums"],
    minWidth: 36,
  },
  seekTrack: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    justifyContent: "center",
  },
  seekFill: {
    height: 3,
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  seekThumb: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#fff",
    marginLeft: -7,
    top: -5.5,
  },
});
