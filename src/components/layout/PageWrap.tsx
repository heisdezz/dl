import React from "react";
import { Color } from "expo-router";
import { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const dyn = Color.android.dynamic;

export default function PageWrap({ children }: PropsWithChildren) {
  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: dyn.background }}
    >
      {children}
    </SafeAreaView>
  );
}
