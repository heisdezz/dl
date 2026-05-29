import dyn from "@/lib/colors";
import { PropsWithChildren } from "react";
import { Text as RNText, StyleSheet } from "react-native";

const GlobalText = ({ children, style, ...props }: PropsWithChildren<any>) => {
  return (
    <RNText style={[styles.defaultText, style]} {...props}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    color: dyn.onBackground,
    fontSize: 16,
    fontFamily: "System",
  },
});

export default GlobalText;
