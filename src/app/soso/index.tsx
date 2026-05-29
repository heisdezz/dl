import { Button, Host } from "@expo/ui";

export default function index(props: any) {
  return (
    <Host style={{ flex: 1 }}>
      <Button label="The world"></Button>
    </Host>
  );
}
