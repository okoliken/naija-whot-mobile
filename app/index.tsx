import { useGameStore } from "@/src/store/gameStore";
import { hasSeenIntro, markIntroSeen } from "@/src/lib/firstLaunch";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { Font } from "../components/game/fonts";
import { HowToPlayModal } from "../components/game/HowToPlayModal";
import { BRAND } from "../components/game/theme";
import { useAppTheme } from "../components/game/ThemeContext";

export default function HomeScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const startGame = useGameStore((s) => s.startGame);
  const howToPlayRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    let cancelled = false;
    hasSeenIntro().then((seen) => {
      if (cancelled || seen) return;
      howToPlayRef.current?.present();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleIntroDismiss = useCallback(() => {
    markIntroSeen();
  }, []);

  const handlePlayCpu = useCallback(() => {
    startGame();
    router.push("/game");
  }, [startGame]);

  const handleHowToPlay = useCallback(() => {
    howToPlayRef.current?.present();
  }, []);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: theme.appBg }}
    >
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 24,
          paddingBottom: insets.bottom + 24,
          justifyContent: "space-between",
        }}
      >
        {/* Brand */}
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <View
            style={{
              width: 96,
              height: 132,
              borderRadius: 12,
              backgroundColor: BRAND,
              alignItems: "center",
              justifyContent: "center",
              transform: [{ rotate: "-6deg" }],
              marginBottom: 28,
              ...theme.panelLift,
            }}
          >
            <Text
              style={{
                fontFamily: Font.display.bold,
                fontSize: 22,
                letterSpacing: 1.6,
                color: "#fafafa",
              }}
            >
              WHOT
            </Text>
          </View>
          <Text
            style={{
              fontFamily: Font.display.bold,
              fontSize: 40,
              lineHeight: 46,
              letterSpacing: 2,
              color: theme.textPrimary,
              textAlign: "center",
            }}
          >
            Naija Whot
          </Text>
          <Text
            style={{
              fontFamily: Font.ui.regular,
              marginTop: 12,
              fontSize: 11,
              letterSpacing: 2.8,
              color: theme.textMuted,
              textAlign: "center",
            }}
          >
            CLASSIC TABLETOP · ONE DECK
          </Text>
        </View>

        {/* CTAs */}
        <View>
          <Pressable
            onPress={handlePlayCpu}
            style={({ pressed }) => ({
              alignItems: "center",
              borderRadius: 18,
              paddingVertical: 20,
              backgroundColor: BRAND,
              opacity: pressed ? 0.9 : 1,
              ...theme.panelLift,
            })}
          >
            <Text
              style={{
                fontFamily: Font.ui.bold,
                fontSize: 14,
                letterSpacing: 2.8,
                color: "#fafafa",
              }}
            >
              PLAY VS CPU
            </Text>
            <Text
              style={{
                fontFamily: Font.ui.regular,
                marginTop: 6,
                fontSize: 11,
                letterSpacing: 1.2,
                color: "rgba(250,250,250,0.72)",
              }}
            >
              Single player · 1 vs AI
            </Text>
          </Pressable>

          <View
            style={{
              alignItems: "center",
              borderRadius: 18,
              paddingVertical: 20,
              marginTop: 12,
              backgroundColor: theme.surfaceAlt,
              borderWidth: 1,
              borderColor: theme.border,
              opacity: 0.65,
            }}
          >
            <Text
              style={{
                fontFamily: Font.ui.bold,
                fontSize: 14,
                letterSpacing: 2.8,
                color: theme.textSecondary,
              }}
            >
              PLAY VS PLAYER
            </Text>
            <Text
              style={{
                fontFamily: Font.ui.regular,
                marginTop: 6,
                fontSize: 10,
                letterSpacing: 1.8,
                color: theme.textMuted,
              }}
            >
              COMING SOON
            </Text>
          </View>

          <Pressable
            onPress={handleHowToPlay}
            style={({ pressed }) => ({
              alignItems: "center",
              paddingVertical: 16,
              marginTop: 12,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text
              style={{
                fontFamily: Font.ui.semi,
                fontSize: 12,
                letterSpacing: 2.4,
                color: theme.textSecondary,
              }}
            >
              HOW TO PLAY
            </Text>
          </Pressable>
        </View>
      </View>

      <HowToPlayModal ref={howToPlayRef} onDismiss={handleIntroDismiss} />
    </SafeAreaView>
  );
}
