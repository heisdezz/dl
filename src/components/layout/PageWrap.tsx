import dyn from "@/lib/colors";
import { Host } from "@expo/ui";
import { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PageWrap(props: PropsWithChildren) {
  return (
    <SafeAreaView
      edges={["top"]}
      style={{ flex: 1, backgroundColor: dyn.background }}
    >
      <Host style={{ flex: 1 }}>{props.children}</Host>
    </SafeAreaView>
  );
}
