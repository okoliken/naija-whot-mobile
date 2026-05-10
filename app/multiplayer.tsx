import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Font } from "../components/theme/fonts";
import { BRAND } from "../components/theme/theme";
import { useAppTheme } from "../components/theme/ThemeContext";
import { useRoom } from "@/src/lib/useRoom";
import type { RoomState } from "@/src/lib/roomTypes";

type Step = "pick" | "create" | "join";

const CODE_LENGTH = 4;
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

export default function MultiplayerScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>("pick");
  const [hostCode, setHostCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [submittedJoinCode, setSubmittedJoinCode] = useState<string | null>(
    null,
  );

  const handleBack = useCallback(() => {
    if (step === "pick") {
      router.back();
    } else {
      setStep("pick");
      setHostCode("");
      setJoinCode("");
      setSubmittedJoinCode(null);
    }
  }, [step]);

  const handleCreate = useCallback(() => {
    setHostCode(generateCode());
    setStep("create");
  }, []);

  const handleJoin = useCallback(() => {
    setJoinCode("");
    setSubmittedJoinCode(null);
    setStep("join");
  }, []);

  const handleJoinSubmit = useCallback(() => {
    if (joinCode.length === CODE_LENGTH) setSubmittedJoinCode(joinCode);
  }, [joinCode]);

  const handleResetJoin = useCallback(() => {
    setSubmittedJoinCode(null);
    setJoinCode("");
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
          paddingTop: 8,
          paddingBottom: insets.bottom + 24,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Feather name="arrow-left" size={22} color={theme.iconGlyph} />
          </Pressable>
          <Text
            style={{
              fontFamily: Font.ui.semi,
              fontSize: 11,
              letterSpacing: 2.4,
              color: theme.textMuted,
            }}
          >
            MULTIPLAYER
          </Text>
          <View style={{ width: 22 }} />
        </View>

        {step === "pick" ? (
          <PickStep onCreate={handleCreate} onJoin={handleJoin} />
        ) : null}
        {step === "create" ? <CreateStep code={hostCode} /> : null}
        {step === "join" ? (
          <JoinStep
            code={joinCode}
            onChange={setJoinCode}
            submittedCode={submittedJoinCode}
            onSubmit={handleJoinSubmit}
            onReset={handleResetJoin}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function PickStep({
  onCreate,
  onJoin,
}: {
  onCreate: () => void;
  onJoin: () => void;
}) {
  const theme = useAppTheme();
  return (
    <View style={{ flex: 1, justifyContent: "space-between" }}>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text
          style={{
            fontFamily: Font.display.bold,
            fontSize: 34,
            lineHeight: 40,
            letterSpacing: 0.6,
            color: theme.textPrimary,
            textAlign: "center",
          }}
        >
          Play with a{"\n"}friend
        </Text>
        <Text
          style={{
            fontFamily: Font.ui.regular,
            marginTop: 14,
            fontSize: 14,
            lineHeight: 20,
            color: theme.textMuted,
            textAlign: "center",
            paddingHorizontal: 16,
          }}
        >
          One device hosts a room. Share the code, your friend joins, you play.
        </Text>
      </View>

      <View style={{ gap: 12 }}>
        <Pressable
          onPress={onCreate}
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
            CREATE ROOM
          </Text>
          <Text
            style={{
              fontFamily: Font.ui.regular,
              marginTop: 6,
              fontSize: 12,
              color: "rgba(250,250,250,0.7)",
            }}
          >
            Get a code · share it
          </Text>
        </Pressable>

        <Pressable
          onPress={onJoin}
          style={({ pressed }) => ({
            alignItems: "center",
            borderRadius: 18,
            paddingVertical: 20,
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
            JOIN ROOM
          </Text>
          <Text
            style={{
              fontFamily: Font.ui.regular,
              marginTop: 6,
              fontSize: 12,
              color: theme.textMuted,
            }}
          >
            Enter your friend's code
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function CreateStep({ code }: { code: string }) {
  const theme = useAppTheme();
  const room = useRoom({ mode: "create", code: code || null });

  return (
    <View style={{ flex: 1, justifyContent: "space-between" }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text
          style={{
            fontFamily: Font.ui.semi,
            fontSize: 11,
            letterSpacing: 2.4,
            color: theme.textMuted,
            marginBottom: 18,
          }}
        >
          ROOM CODE
        </Text>

        <CodeTiles code={code} />

        <View style={{ height: 24 }} />

        <RoomStatusLine state={room} flow="create" />
      </View>

      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => ({
          alignItems: "center",
          borderRadius: 18,
          paddingVertical: 18,
          backgroundColor: theme.surfaceAlt,
          borderWidth: 1,
          borderColor: theme.border,
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text
          style={{
            fontFamily: Font.ui.semi,
            fontSize: 13,
            letterSpacing: 2.4,
            color: theme.textSecondary,
          }}
        >
          {room.kind === "ready" ? "LEAVE" : "CANCEL"}
        </Text>
      </Pressable>
    </View>
  );
}

function JoinStep({
  code,
  onChange,
  submittedCode,
  onSubmit,
  onReset,
}: {
  code: string;
  onChange: (next: string) => void;
  submittedCode: string | null;
  onSubmit: () => void;
  onReset: () => void;
}) {
  const theme = useAppTheme();
  const inputRef = useRef<TextInput>(null);
  const room = useRoom({ mode: "join", code: submittedCode });

  useEffect(() => {
    if (submittedCode) return;
    const t = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(t);
  }, [submittedCode]);

  const handleChange = useCallback(
    (next: string) => {
      const cleaned = next
        .toUpperCase()
        .replace(/[^A-Z2-9]/g, "")
        .slice(0, CODE_LENGTH);
      onChange(cleaned);
    },
    [onChange],
  );

  const handleKey = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      if (e.nativeEvent.key === "Enter" && code.length === CODE_LENGTH) {
        onSubmit();
      }
    },
    [code.length, onSubmit],
  );

  const ready = code.length === CODE_LENGTH;

  if (submittedCode) {
    const showRetry =
      room.kind === "full" || room.kind === "error" || room.kind === "left";
    return (
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              fontFamily: Font.ui.semi,
              fontSize: 11,
              letterSpacing: 2.4,
              color: theme.textMuted,
              marginBottom: 18,
            }}
          >
            ROOM CODE
          </Text>

          <CodeTiles code={submittedCode} dim />

          <View style={{ height: 24 }} />

          <RoomStatusLine state={room} flow="join" />
        </View>

        <Pressable
          onPress={showRetry ? onReset : () => router.back()}
          style={({ pressed }) => ({
            alignItems: "center",
            borderRadius: 18,
            paddingVertical: 18,
            backgroundColor: theme.surfaceAlt,
            borderWidth: 1,
            borderColor: theme.border,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            style={{
              fontFamily: Font.ui.semi,
              fontSize: 13,
              letterSpacing: 2.4,
              color: theme.textSecondary,
            }}
          >
            {showRetry ? "TRY ANOTHER CODE" : room.kind === "ready" ? "LEAVE" : "CANCEL"}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "space-between" }}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text
          style={{
            fontFamily: Font.ui.semi,
            fontSize: 11,
            letterSpacing: 2.4,
            color: theme.textMuted,
            marginBottom: 18,
          }}
        >
          ENTER CODE
        </Text>

        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}
        >
          {Array.from({ length: CODE_LENGTH }).map((_, i) => {
            const ch = code[i] ?? "";
            const isCursor = i === code.length;
            return (
              <View
                key={i}
                style={{
                  width: 56,
                  height: 76,
                  borderRadius: 12,
                  backgroundColor: theme.surface,
                  borderWidth: 1.5,
                  borderColor: isCursor ? BRAND : theme.border,
                  alignItems: "center",
                  justifyContent: "center",
                  ...theme.panelLiftSubtle,
                }}
              >
                <Text
                  style={{
                    fontFamily: Font.display.bold,
                    fontSize: 36,
                    lineHeight: 40,
                    color: theme.textPrimary,
                    letterSpacing: 0.4,
                  }}
                >
                  {ch}
                </Text>
              </View>
            );
          })}
        </Pressable>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleChange}
          onKeyPress={handleKey}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          maxLength={CODE_LENGTH}
          style={{
            position: "absolute",
            opacity: 0,
            height: 1,
            width: 1,
          }}
        />

        <Text
          style={{
            fontFamily: Font.ui.regular,
            fontSize: 13,
            color: theme.textMuted,
            textAlign: "center",
            paddingHorizontal: 32,
            lineHeight: 19,
          }}
        >
          Ask your friend for the 4-character code on their screen.
        </Text>
      </View>

      <Pressable
        onPress={onSubmit}
        disabled={!ready}
        style={({ pressed }) => ({
          alignItems: "center",
          borderRadius: 18,
          paddingVertical: 20,
          backgroundColor: ready ? BRAND : theme.surfaceAlt,
          borderWidth: ready ? 0 : 1,
          borderColor: theme.border,
          opacity: ready ? (pressed ? 0.9 : 1) : 0.55,
          ...(ready ? theme.panelLift : null),
        })}
      >
        <Text
          style={{
            fontFamily: Font.ui.bold,
            fontSize: 14,
            letterSpacing: 2.8,
            color: ready ? "#fafafa" : theme.textMuted,
          }}
        >
          JOIN GAME
        </Text>
      </Pressable>
    </View>
  );
}

function CodeTiles({ code, dim = false }: { code: string; dim?: boolean }) {
  const theme = useAppTheme();
  return (
    <View style={{ flexDirection: "row", gap: 10 }}>
      {code.split("").map((ch, i) => (
        <View
          key={i}
          style={{
            width: 56,
            height: 76,
            borderRadius: 12,
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.border,
            alignItems: "center",
            justifyContent: "center",
            opacity: dim ? 0.55 : 1,
            ...theme.panelLiftSubtle,
          }}
        >
          <Text
            style={{
              fontFamily: Font.display.bold,
              fontSize: 36,
              lineHeight: 40,
              color: theme.textPrimary,
              letterSpacing: 0.4,
            }}
          >
            {ch}
          </Text>
        </View>
      ))}
    </View>
  );
}

function RoomStatusLine({
  state,
  flow,
}: {
  state: RoomState;
  flow: "create" | "join";
}) {
  const theme = useAppTheme();

  const dot = useSharedValue(0);
  useEffect(() => {
    dot.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [dot]);
  const dotStyle = useAnimatedStyle(() => ({ opacity: 0.3 + dot.value * 0.7 }));

  const { label, tone, hint } = describe(state, flow);

  const color =
    tone === "success"
      ? "#34d399"
      : tone === "error"
        ? "#f87171"
        : theme.textMuted;

  return (
    <View style={{ alignItems: "center", gap: 6 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          paddingVertical: 6,
        }}
      >
        {tone === "pending" ? (
          <Animated.View
            style={[
              dotStyle,
              {
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: theme.textMuted,
              },
            ]}
          />
        ) : (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              backgroundColor: color,
            }}
          />
        )}
        <Text style={{ fontFamily: Font.ui.semi, fontSize: 14, color }}>
          {label}
        </Text>
      </View>
      {hint ? (
        <Text
          style={{
            fontFamily: Font.ui.regular,
            fontSize: 12,
            color: theme.textMuted,
            textAlign: "center",
            paddingHorizontal: 32,
            lineHeight: 18,
          }}
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

function describe(
  state: RoomState,
  flow: "create" | "join",
): { label: string; tone: "pending" | "success" | "error"; hint: string | null } {
  switch (state.kind) {
    case "idle":
      return { label: "Idle", tone: "pending", hint: null };
    case "connecting":
      return {
        label: flow === "create" ? "Opening room" : "Joining room",
        tone: "pending",
        hint: null,
      };
    case "waiting":
      return {
        label: flow === "create" ? "Waiting for opponent" : "Waiting for host",
        tone: "pending",
        hint:
          flow === "create"
            ? "Send the code above to your friend."
            : "Ask your friend to keep their screen open.",
      };
    case "ready":
      return {
        label: "Connected — opponent joined",
        tone: "success",
        hint: "Game sync coming next. For now, both phones are linked.",
      };
    case "full":
      return {
        label: "Room is full",
        tone: "error",
        hint: "Two players are already in this room.",
      };
    case "error":
      return {
        label: "Couldn't connect",
        tone: "error",
        hint: state.hint ?? "Check your connection and the room code.",
      };
    case "left":
      return {
        label: "Disconnected",
        tone: "error",
        hint: "Lost the connection. Try again.",
      };
  }
}
