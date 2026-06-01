import React, { useRef, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter, Color } from "expo-router";
import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { tw } from "@/lib/tw";
import { useSessionStore } from "@/lib/session";
import { Logger } from "@/lib/logger";

const dyn = Color.android.dynamic;

const LOGIN_URL = "https://www.tiktok.com/login/phone-or-email/email";

const SESSION_KEYS = ["sessionid", "sessionid_ss", "sid_tt", "uid_tt"];

const INJECT_COOKIES = `
(function() {
  var pairs = document.cookie.split(';');
  var cookies = {};
  pairs.forEach(function(p) {
    var idx = p.indexOf('=');
    if (idx > -1) {
      cookies[p.slice(0, idx).trim()] = p.slice(idx + 1).trim();
    }
  });
  window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'cookies', data: cookies }));
})();
true;
`;

export default function TikTokLogin() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setTiktokSessionId = useSessionStore((s) => s.setTiktokSessionId);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const tryCapture = (url: string) => {
    if (capturing) return;
    const isLoggedIn =
      /tiktok\.com\/(foryou|following|explore|@|$)/.test(url) &&
      !url.includes("/login");
    if (!isLoggedIn) return;

    setCapturing(true);
    Logger.info("login detected, injecting cookie extractor", { url });
    webViewRef.current?.injectJavaScript(INJECT_COOKIES);
  };

  const onMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type !== "cookies") return;
      const cookies: Record<string, string> = msg.data ?? {};
      Logger.info("cookies received", { keys: Object.keys(cookies) });
      for (const key of SESSION_KEYS) {
        if (cookies[key]) {
          setTiktokSessionId(cookies[key]);
          Logger.info("session stored", { key });
          router.back();
          return;
        }
      }
      Logger.warn("sessionid not in document.cookie — likely HttpOnly");
      setCapturing(false);
    } catch {
      setCapturing(false);
    }
  };

  return (
    <View style={[tw`flex-1`, { backgroundColor: dyn.background }]}>
      {/* Header */}
      <View
        style={[
          tw`flex-row items-center px-4 gap-3`,
          {
            paddingTop: insets.top + 8,
            paddingBottom: 12,
            backgroundColor: dyn.surface,
          },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            tw`w-10 h-10 rounded-full items-center justify-center`,
            {
              backgroundColor: pressed
                ? dyn.surfaceVariant
                : dyn.surfaceContainerHigh,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="close"
            size={16}
            color={dyn.onSurface as string}
          />
        </Pressable>

        <View style={tw`flex-1`}>
          <Text style={[tw`text-base font-bold`, { color: dyn.onSurface }]}>
            Sign in to TikTok
          </Text>
          <Text style={[tw`text-xs`, { color: dyn.onSurfaceVariant }]}>
            Use email & password only — phone/Google won't work
          </Text>
        </View>

        {(loading || capturing) && (
          <ActivityIndicator size="small" color={dyn.primary as string} />
        )}
      </View>

      {capturing && (
        <View
          style={[
            tw`py-2 px-4 flex-row items-center gap-2`,
            { backgroundColor: dyn.primaryContainer },
          ]}
        >
          <ActivityIndicator
            size="small"
            color={dyn.onPrimaryContainer as string}
          />
          <Text
            style={[tw`text-sm font-medium`, { color: dyn.onPrimaryContainer }]}
          >
            Capturing session…
          </Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: LOGIN_URL }}
        style={{ flex: 1 }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(nav) => {
          if (nav.url) tryCapture(nav.url);
        }}
        onMessage={onMessage}
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        javaScriptEnabled
        domStorageEnabled
        userAgent="Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
      />
    </View>
  );
}
