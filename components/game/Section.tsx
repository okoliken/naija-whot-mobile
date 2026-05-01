import { type ReactNode } from "react";
import { View } from "react-native";
import { BORDER } from "./theme";

type SectionProps = {
  children: ReactNode;
};

export function Section({ children }: SectionProps) {
  return (
    <View
      className="rounded-2xl border bg-zinc-950/90 px-4 py-3.5"
      style={{ borderColor: BORDER }}
    >
      {children}
    </View>
  );
}
