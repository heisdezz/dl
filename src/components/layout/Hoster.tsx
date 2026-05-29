import { Host } from "@expo/ui/swift-ui";
import { PropsWithChildren } from "react";

export default function Hoster(props: PropsWithChildren) {
  return <Host matchContents>{props.children}</Host>;
}
