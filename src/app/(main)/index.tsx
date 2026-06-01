import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  ActivityIndicator,
  Pressable,
} from "react-native";
import PageWrap from "@/components/layout/PageWrap";
import { tw } from "@/lib/tw";
import { Color } from "expo-router";
import { getTikTokMetadata, fetchVideoViaTikDown } from "@/lib/tiktok";
import { VideoCard } from "@/components/video-card";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useSessionStore } from "@/lib/session";

const dyn = Color.android.dynamic;

export default function Index() {
  const [url, setUrl] = useState("");
  const [submittedUrl, setSubmittedUrl] = useState("");
  const tiktokSessionId = useSessionStore((state) => state.tiktokSessionId);

  const {
    data: metadata,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tiktok-metadata", submittedUrl, tiktokSessionId],
    queryFn: () => fetchVideoViaTikDown(submittedUrl, tiktokSessionId),
    enabled: !!submittedUrl,
    retry: false,
  });

  const handleFetch = () => {
    if (!url) return;
    setSubmittedUrl(url);
  };

  return (
    <PageWrap>
      <View style={tw`p-4 flex-1`}>
        <Text style={[tw`text-2xl font-bold mb-6`, { color: dyn.onSurface }]}>
          TikTok Downloader
        </Text>

        {/* URL Input Bar */}
        <View
          style={[
            tw`flex-row items-center rounded-3xl px-4 py-2 border`,
            {
              backgroundColor: dyn.surfaceContainer,
              borderColor: dyn.outlineVariant,
            },
          ]}
        >
          <TextInput
            placeholder="Paste TikTok link here..."
            placeholderTextColor={dyn.onSurfaceVariant}
            style={[tw`flex-1 h-12 text-base`, { color: dyn.onSurface }]}
            value={url}
            onChangeText={setUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            onPress={handleFetch}
            disabled={isLoading || !url}
            style={({ pressed }) => [
              tw`w-10 h-10 rounded-full items-center justify-center ml-2`,
              {
                backgroundColor: pressed
                  ? dyn.secondaryContainer
                  : dyn.primaryContainer,
                opacity: !url || isLoading ? 0.5 : 1,
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={dyn.onPrimaryContainer} />
            ) : (
              <MaterialCommunityIcons
                name="download-circle"
                size={24}
                color={dyn.onPrimaryContainer as string}
              />
            )}
          </Pressable>
        </View>

        {isError && (
          <Text style={[tw`mt-4 px-2 text-sm`, { color: dyn.error }]}>
            Could not find video. Check the URL.
          </Text>
        )}

        {/* Preview Component */}
        {metadata && (
          <VideoCard
            metadata={metadata}
            onDownload={() => {
              setUrl("");
              setSubmittedUrl("");
            }}
          />
        )}
      </View>
    </PageWrap>
  );
}
