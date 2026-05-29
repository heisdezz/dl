import { tw } from "@/lib/tw";
import { Button, Host } from "@expo/ui";
import { Color, router } from "expo-router";
import { Text } from "react-native";

export default function index(props: any) {
  const dynamo = Color.android.dynamic;
  return (
    <Host style={{ flex: 1 }}>
      <Text style={tw`bg-red-500 p-12`}>sshomess</Text>
      <Button
        label="Go to Soso"
        onPress={() => {
          router.push("/soso");
        }}
      />
    </Host>
  );
}
