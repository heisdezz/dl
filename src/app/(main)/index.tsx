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
import { getTikTokMetadata, TikTokMetadata } from "@/lib/tiktok";
import { TikTokPreview } from "@/components/tiktok-preview";
import { SymbolView } from "expo-symbols";

const dyn = Color.android.dynamic;

export default function Index() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<TikTokMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setMetadata(null);

    try {
      const data = await getTikTokMetadata(url);
      if (data) {
        setMetadata(data);
      } else {
        setError("Could not find video. Check the URL.");
      }
    } catch (err) {
      setError("An error occurred while fetching metadata.");
    } finally {
      setLoading(false);
    }
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
            disabled={loading || !url}
            style={({ pressed }) => [
              tw`w-10 h-10 rounded-full items-center justify-center ml-2`,
              {
                backgroundColor: pressed
                  ? dyn.secondaryContainer
                  : dyn.primaryContainer,
                opacity: !url || loading ? 0.5 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={dyn.onPrimaryContainer} />
            ) : (
              <SymbolView
                name="arrow.down.circle.fill"
                size={24}
                tintColor={dyn.onPrimaryContainer as string}
              />
            )}
          </Pressable>
        </View>

        {error && (
          <Text style={[tw`mt-4 px-2 text-sm`, { color: dyn.error }]}>
            {error}
          </Text>
        )}

        {/* Preview Component */}
        {metadata && <TikTokPreview metadata={metadata} />}
      </View>
    </PageWrap>
  );
}
