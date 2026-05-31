import { hasSeenIntro, markIntroSeen } from "@/src/platform/storage/firstLaunch";
import { useGameStore } from "@/src/game/gameStore";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { CardFront } from "../components/game/cards/CardFront";
import { HowToPlayModal } from "../components/game/modals/HowToPlayModal";
import { Font } from "../components/theme/fonts";
import { BRAND, ON_BRAND, ON_BRAND_DIM } from "../components/theme/theme";
import { useAppTheme } from "../components/theme/ThemeContext";

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

    console.log("mode", theme);
    return () => {
      cancelled = true;
    };
  }, []);

  const handleIntroDismiss = () => {
    markIntroSeen();
  };

  const handlePlayCpu = () => {
    startGame();
    router.push("/game");
  };

  const handlePlayPvp = () => {
    router.push("/multiplayer");
  };

  const handleHowToPlay = () => {
    howToPlayRef.current?.present();
  };

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
          <View className="flex-row gap-0.5">
            <View
              style={{
                width: 110,
                height: 150,
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
                  textTransform: "uppercase",
                  color: ON_BRAND,
                }}
              >
                WHOT
              </Text>
            </View>
            <View
              style={{
                borderRadius: 12,
                transform: [{ rotate: "6deg" }],
                marginBottom: 28,
                ...theme.panelLift,
              }}
            >
              <CardFront card={{ id: "sample", shape: "star", value: 4 }} />
            </View>
          </View>
          <Text
            style={{
              fontFamily: Font.display.bold,
              fontSize: 40,
              lineHeight: 46,
              letterSpacing: 0.5,
              color: theme.textPrimary,
              textAlign: "center",
            }}
          >
            Naija Whot
          </Text>
          <Text
            style={{
              fontFamily: Font.ui.regular,
              marginTop: 10,
              fontSize: 13,
              color: theme.textMuted,
              textAlign: "center",
            }}
          >
            Single deck. No stress.
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
            className="border border-dashed border-white/45 p-1.5"
          >
            <Text
              style={{
                fontFamily: Font.ui.bold,
                fontSize: 14,
                letterSpacing: 2.8,
                textTransform: "uppercase",
                color: ON_BRAND,
              }}
            >
              PLAY VS CPU
            </Text>
            <Text
              style={{
                fontFamily: Font.ui.regular,
                marginTop: 6,
                fontSize: 12,
                color: ON_BRAND_DIM,
              }}
            >
              Solo · against the house
            </Text>
          </Pressable>

          <Pressable
            onPress={handlePlayPvp}
            style={({ pressed }) => ({
              alignItems: "center",
              borderRadius: 18,
              paddingVertical: 20,
              marginTop: 12,
              backgroundColor: theme.surfaceAlt,
              borderWidth: 1,
              borderColor: theme.border,
              opacity: pressed ? 0.7 : 1,
            })}
            className="border border-dashed border-white/45 p-1.5"
          >
            <Text
              style={{
                fontFamily: Font.ui.bold,
                fontSize: 14,
                letterSpacing: 2.8,
                textTransform: "uppercase",
                color: theme.textPrimary,
              }}
            >
              PLAY VS PLAYER
            </Text>
            <Text
              style={{
                fontFamily: Font.ui.regular,
                marginTop: 6,
                fontSize: 12,
                color: theme.textMuted,
              }}
            >
              Friend code · same room
            </Text>
          </Pressable>

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
                textTransform: "uppercase",
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
