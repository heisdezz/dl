import Hoster from "@/components/layout/Hoster";
import GlobalText from "@/components/ui/RText";
import dyn from "@/lib/colors";
import { Button, Host, ScrollView, Text } from "@expo/ui";
import { useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function index(props: any) {
  const scheme = useColorScheme();
  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: dyn.background }}>
        <Host useViewportSizeMeasurement style={{ flex: 1 }}>
          <ScrollView>
            <GlobalText>ss</GlobalText>
            <Button
              onPress={() => console.log("pressed")}
              label="Press me"
            ></Button>
          </ScrollView>
        </Host>
      </SafeAreaView>
    </>
  );
}
