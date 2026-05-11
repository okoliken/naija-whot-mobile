import { hasSeenIntro, markIntroSeen } from "@/src/lib/firstLaunch";
import { useGameStore } from "@/src/store/gameStore";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { CardFront } from "../components/game/cards/CardFront";
import { HowToPlayModal } from "../components/HowToPlayModal";
import { Font } from "../components/theme/fonts";
import { BRAND } from "../components/theme/theme";
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
      className="flex-1"
      style={{ backgroundColor: theme.appBg }}
    >
      <View
        className="flex-1 justify-between px-6 pt-6"
        style={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Brand */}
        <View className="flex-1 items-center justify-center">
          <View className="flex-row gap-0.5">
            <View
              className="mb-7 h-[150px] w-[110px] items-center justify-center rounded-xl"
              style={{
                backgroundColor: BRAND,
                transform: [{ rotate: "-6deg" }],
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
            <View
              className="mb-7 rounded-xl"
              style={{
                transform: [{ rotate: "6deg" }],
                ...theme.panelLift,
              }}
            >
              <CardFront card={{ id: "sample", shape: "star", value: 4 }} />
            </View>
          </View>
          <Text
            className="text-center"
            style={{
              fontFamily: Font.display.bold,
              fontSize: 40,
              lineHeight: 46,
              letterSpacing: 2,
              color: theme.textPrimary,
            }}
          >
            Naija Whot
          </Text>
          <Text
            className="mt-2.5 text-center"
            style={{
              fontFamily: Font.ui.regular,
              fontSize: 13,
              color: theme.textMuted,
            }}
          >
            Single deck. No stress.
          </Text>
        </View>

        {/* CTAs */}
        <View>
          <Pressable
            onPress={handlePlayCpu}
            className="items-center rounded-[18px] border border-dashed border-white/45 p-1.5 py-5"
            style={({ pressed }) => ({
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
              className="mt-1.5"
              style={{
                fontFamily: Font.ui.regular,
                fontSize: 12,
                color: "rgba(250,250,250,0.7)",
              }}
            >
              Solo · against the house
            </Text>
          </Pressable>

          <Pressable
            onPress={handlePlayPvp}
            className="mt-3 items-center rounded-[18px] border border-dashed border-white/45 p-1.5 py-5"
            style={({ pressed }) => ({
              backgroundColor: theme.surfaceAlt,
              borderWidth: 1,
              borderColor: theme.border,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                fontFamily: Font.ui.bold,
                fontSize: 14,
                letterSpacing: 2.8,
                color: theme.textPrimary,
              }}
            >
              PLAY VS PLAYER
            </Text>
            <Text
              className="mt-1.5"
              style={{
                fontFamily: Font.ui.regular,
                fontSize: 12,
                color: theme.textMuted,
              }}
            >
              Friend code · same room
            </Text>
          </Pressable>

          <Pressable
            onPress={handleHowToPlay}
            className="mt-3 items-center py-4"
            style={({ pressed }) => ({
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
