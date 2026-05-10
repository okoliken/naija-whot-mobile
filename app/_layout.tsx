import { Stack } from "expo-router";
import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import {
  Cinzel_400Regular,
  Cinzel_700Bold,
} from "@expo-google-fonts/cinzel";
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_700Bold,
  CormorantGaramond_700Bold_Italic,
} from "@expo-google-fonts/cormorant-garamond";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import {
  ThemeProvider,
  useAppTheme,
  useThemeMode,
} from "../components/theme/ThemeContext";

import "../global.css";

function ThemedRoot({ children }: { children: ReactNode }) {
  const t = useAppTheme();
  const { mode } = useThemeMode();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: t.appBg }}>
      <StatusBar style={mode === "light" ? "dark" : "light"} />
      {children}
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Cinzel_400Regular,
    Cinzel_700Bold,
    CormorantGaramond_400Regular,
    CormorantGaramond_700Bold,
    CormorantGaramond_700Bold_Italic,
  });

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <ThemedRoot>
        <BottomSheetModalProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </BottomSheetModalProvider>
      </ThemedRoot>
    </ThemeProvider>
  );
}
