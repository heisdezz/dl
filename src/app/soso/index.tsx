import PageWrap from "@/components/layout/PageWrap";
import { Button, Host } from "@expo/ui";
import { router } from "expo-router";

export default function index(props: any) {
  return (
    <PageWrap>
      <Button
        label="The world"
        onPress={() => router.push("/settings")}
      ></Button>
    </PageWrap>
  );
}
