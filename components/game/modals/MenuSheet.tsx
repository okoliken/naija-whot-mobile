import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetTextInput,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Pressable, Share, Text, View, type TextInput } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { hapticsImpactLight } from "@/src/platform/haptics";
import {
  clearLastRoom,
  getLastRoom,
  type LastRoom,
} from "@/src/platform/storage/lastRoom";
import { roomExists } from "@/src/room/connection";
import { useRoom } from "@/src/room/useRoom";
import type { RoomState, Seat } from "@/src/room/types";
import { Font, FontStyle } from "../../theme/fonts";
import { BRAND, ON_BRAND, ON_BRAND_DIM } from "../../theme/theme";
import { useAppTheme } from "../../theme/ThemeContext";
import { IconButton } from "../../ui/IconButton";

const CODE_LENGTH = 4;
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

type Step = "menu" | "pvp" | "create" | "join";

type Props = {
  /** Dismisses the sheet and carries on with the CPU game behind it. */
  onPlayCpu: () => void;
  /** Room is live — the parent swaps the table to the networked game. */
  onStartMultiplayer: (code: string, seat: Seat) => void;
  onHowToPlay: () => void;
  ref?: RefObject<BottomSheetModal | null>;
};

/**
 * The game's front door: the table is already dealt behind it, and this
 * sheet is the only way in — the backdrop doesn't dismiss, and the whole
 * multiplayer flow (create/join a room) happens inside the sheet so the
 * player never leaves the table.
 */
export function MenuSheet({
  onPlayCpu,
  onStartMultiplayer,
  onHowToPlay,
  ref,
}: Props) {
  const theme = useAppTheme();
  const internalRef = useRef<BottomSheetModal>(null);
  const sheetRef = ref ?? internalRef;
  const [step, setStep] = useState<Step>("menu");
  const [hostCode, setHostCode] = useState("");

  const renderBackdrop = (
    props: React.ComponentProps<typeof BottomSheetBackdrop>,
  ) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.6}
      pressBehavior="none"
    />
  );

  const choose = (action: () => void) => {
    hapticsImpactLight();
    sheetRef.current?.dismiss();
    action();
  };

  /** Room is live — close the sheet and hand the table to the net game. */
  const launch = (code: string, seat: Seat) => {
    sheetRef.current?.dismiss();
    onStartMultiplayer(code, seat);
  };

  return (
    <BottomSheetModal
      ref={sheetRef}
      enablePanDownToClose={false}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: theme.surface }}
      handleIndicatorStyle={{
        backgroundColor: theme.border,
        width: 36,
        height: 3,
      }}
      onDismiss={() => {
        setStep("menu");
        setHostCode("");
      }}
    >
      <BottomSheetView
        style={{
          paddingHorizontal: 24,
          paddingBottom: 48,
          paddingTop: 8,
          // Only the join step runs taller — it needs the extra room for
          // code entry; the other steps hug their content.
          minHeight: step === "join" ? 460 : undefined,
        }}
      >
        {step === "menu" ? (
          <MenuStep
            onPlayCpu={() => choose(onPlayCpu)}
            onPlayPvp={() => setStep("pvp")}
            onHowToPlay={() => choose(onHowToPlay)}
          />
        ) : null}
        {step === "pvp" ? (
          <PvpStep
            onCreate={() => {
              setHostCode(generateCode());
              setStep("create");
            }}
            onJoin={() => setStep("join")}
            onRejoin={launch}
            onBack={() => setStep("menu")}
          />
        ) : null}
        {step === "create" ? (
          <CreateStep
            code={hostCode}
            onLaunch={launch}
            onCancel={() => setStep("pvp")}
          />
        ) : null}
        {step === "join" ? (
          <JoinStep onLaunch={launch} onCancel={() => setStep("pvp")} />
        ) : null}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

/* ---------- Step: main menu ---------- */

function MenuStep({
  onPlayCpu,
  onPlayPvp,
  onHowToPlay,
}: {
  onPlayCpu: () => void;
  onPlayPvp: () => void;
  onHowToPlay: () => void;
}) {
  const theme = useAppTheme();
  return (
    <>
      <Text
        style={[
          FontStyle.display.bold,
          {
            textAlign: "center",
            fontSize: 26,
            lineHeight: 32,
            letterSpacing: 1.2,
            color: theme.textPrimary,
          },
        ]}
      >
        Naija Whot
      </Text>
      <Text
        style={[
          FontStyle.ui.regular,
          {
            marginTop: 6,
            marginBottom: 24,
            textAlign: "center",
            fontSize: 13,
            color: theme.textMuted,
          },
        ]}
      >
        Single deck. No stress.
      </Text>

      <SheetButton
        title="Play vs CPU"
        subtitle="The table is ready"
        primary
        onPress={onPlayCpu}
      />
      <SheetButton
        title="Play vs Player"
        subtitle="Host a room or join with a code"
        onPress={onPlayPvp}
      />

      <Pressable
        onPress={onHowToPlay}
        style={({ pressed }) => ({
          alignItems: "center",
          paddingVertical: 14,
          marginTop: 10,
          opacity: pressed ? 0.6 : 1,
        })}
      >
        <Text
          style={{
            fontFamily: Font.ui.semi,
            fontSize: 12,
            letterSpacing: 1.6,
            textTransform: "uppercase",
            color: theme.textSecondary,
          }}
        >
          How to play
        </Text>
      </Pressable>
    </>
  );
}

/* ---------- Step: choose create/join ---------- */

function PvpStep({
  onCreate,
  onJoin,
  onRejoin,
  onBack,
}: {
  onCreate: () => void;
  onJoin: () => void;
  onRejoin: (code: string, seat: Seat) => void;
  onBack: () => void;
}) {
  const theme = useAppTheme();
  const [lastRoom, setLastRoomState] = useState<LastRoom | null>(null);

  // Offer a one-tap rejoin if the user soft-left an existing room. The saved
  // pointer can outlive the room, so confirm it still exists first.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await getLastRoom();
      if (cancelled || !r) return;
      const exists = await roomExists(r.code);
      if (cancelled) return;
      if (exists === false) {
        void clearLastRoom();
        return;
      }
      setLastRoomState(r);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <StepHeading
        title="Play with a friend"
        subtitle="One device hosts a room. Share the code, your friend joins."
        onBack={onBack}
      />

      {lastRoom ? (
        <SheetButton
          title={`Rejoin · ${lastRoom.code}`}
          subtitle="Pick up where you left off"
          onPress={() => onRejoin(lastRoom.code, lastRoom.seat)}
        />
      ) : null}
      <SheetButton
        title="Create room"
        subtitle="Get a code and share it"
        primary
        onPress={onCreate}
      />
      <SheetButton
        title="Join room"
        subtitle="Enter your friend's code"
        onPress={onJoin}
      />
    </>
  );
}

/* ---------- Step: host a room ---------- */

function CreateStep({
  code,
  onLaunch,
  onCancel,
}: {
  code: string;
  onLaunch: (code: string, seat: Seat) => void;
  onCancel: () => void;
}) {
  const room = useRoom({ mode: "create", code: code || null });
  useLaunchOnReady(room, code || null, onLaunch);

  const handleShare = () => {
    hapticsImpactLight();
    void Share.share({
      message: `Come play Naija Whot with me! Open the app, tap Play vs Player, then Join Room, and enter my code: ${code}`,
    });
  };

  return (
    <>
      <StepHeading
        title="Room code"
        subtitle="Send this code to your friend."
        onBack={onCancel}
      />
      <View style={{ alignItems: "center" }}>
        <CodeTiles code={code} />
        <View style={{ height: 20 }} />
        <RoomStatusLine state={room} flow="create" />
        <View style={{ height: 16 }} />
      </View>
      <SheetButton title="Share code" primary onPress={handleShare} />
    </>
  );
}

/* ---------- Step: join a room ---------- */

function JoinStep({
  onLaunch,
  onCancel,
}: {
  onLaunch: (code: string, seat: Seat) => void;
  onCancel: () => void;
}) {
  const theme = useAppTheme();
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState("");
  const [submittedCode, setSubmittedCode] = useState<string | null>(null);
  const room = useRoom({ mode: "join", code: submittedCode });
  useLaunchOnReady(room, submittedCode, onLaunch);

  useEffect(() => {
    if (submittedCode) return;
    const t = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(t);
  }, [submittedCode]);

  const handleChange = (next: string) => {
    const cleaned = next
      .toUpperCase()
      .replace(/[^A-Z2-9]/g, "")
      .slice(0, CODE_LENGTH);
    setCode(cleaned);
  };

  const ready = code.length === CODE_LENGTH;
  const showRetry =
    room.kind === "full" || room.kind === "error" || room.kind === "left";

  if (submittedCode) {
    return (
      <>
        <StepHeading
          title="Room code"
          subtitle=""
          onBack={() => {
            setSubmittedCode(null);
            setCode("");
            if (showRetry) return;
            onCancel();
          }}
        />
        <View style={{ alignItems: "center" }}>
          <CodeTiles code={submittedCode} dim />
          <View style={{ height: 20 }} />
          <RoomStatusLine state={room} flow="join" />
          <View style={{ height: 8 }} />
        </View>
      </>
    );
  }

  return (
    <>
      <StepHeading
        title="Enter code"
        subtitle="Ask your friend for the 4-character code on their screen."
        onBack={onCancel}
      />

      <View style={{ alignItems: "center" }}>
        <Pressable
          onPress={() => inputRef.current?.focus()}
          style={{ flexDirection: "row", gap: 10 }}
        >
          {Array.from({ length: CODE_LENGTH }).map((_, i) => {
            const ch = code[i] ?? "";
            const isCursor = i === code.length;
            return (
              <View
                key={i}
                style={{
                  width: 52,
                  height: 68,
                  borderRadius: 12,
                  backgroundColor: theme.surfaceAlt,
                  borderWidth: 1.5,
                  borderColor: isCursor ? BRAND : theme.border,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: Font.display.bold,
                    fontSize: 32,
                    lineHeight: 36,
                    color: theme.textPrimary,
                  }}
                >
                  {ch}
                </Text>
              </View>
            );
          })}
        </Pressable>

        <BottomSheetTextInput
          // @ts-expect-error — BottomSheetTextInput forwards to a TextInput
          ref={inputRef}
          value={code}
          onChangeText={handleChange}
          autoCapitalize="characters"
          autoCorrect={false}
          autoComplete="off"
          maxLength={CODE_LENGTH}
          style={{ position: "absolute", opacity: 0, height: 1, width: 1 }}
        />
      </View>

      <View style={{ height: 20 }} />

      <SheetButton
        title="Join game"
        primary
        disabled={!ready}
        onPress={() => {
          if (ready) setSubmittedCode(code);
        }}
      />
    </>
  );
}

/* ---------- Shared pieces ---------- */

function useLaunchOnReady(
  room: RoomState,
  code: string | null,
  onLaunch: (code: string, seat: Seat) => void,
) {
  // Room snapshots keep arriving after "ready" (each with a fresh object
  // identity), re-running this effect. Without the latch every re-run
  // schedules another launch and the game screen gets pushed twice.
  const launchedRef = useRef(false);
  useEffect(() => {
    if (room.kind !== "ready" || !code || launchedRef.current) return;
    // Brief delay so the "Connected" line registers before the jump.
    const t = setTimeout(() => {
      launchedRef.current = true;
      onLaunch(code, room.seat);
    }, 600);
    return () => clearTimeout(t);
  }, [room, code, onLaunch]);
}

function StepHeading({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
}) {
  const theme = useAppTheme();
  return (
    <View style={{ marginBottom: 20 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 40,
        }}
      >
        <View style={{ position: "absolute", left: 0 }}>
          <IconButton name="arrow-left" onPress={onBack} />
        </View>
        <Text
          style={[
            FontStyle.display.bold,
            {
              textAlign: "center",
              fontSize: 21,
              lineHeight: 26,
              letterSpacing: 1,
              color: theme.textPrimary,
            },
          ]}
        >
          {title}
        </Text>
      </View>
      {subtitle ? (
        <Text
          style={[
            FontStyle.ui.regular,
            {
              marginTop: 8,
              textAlign: "center",
              fontSize: 13,
              lineHeight: 19,
              color: theme.textMuted,
              paddingHorizontal: 24,
            },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

function SheetButton({
  title,
  subtitle,
  primary = false,
  disabled = false,
  onPress,
}: {
  title: string;
  subtitle?: string;
  primary?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        hapticsImpactLight();
        onPress();
      }}
      disabled={disabled}
      style={({ pressed }) => ({
        alignItems: "center",
        borderRadius: 16,
        paddingVertical: 15,
        marginTop: 10,
        backgroundColor: primary ? BRAND : theme.surfaceAlt,
        borderWidth: primary ? 0 : 1,
        borderColor: theme.border,
        opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
      })}
    >
      <Text
        style={{
          fontFamily: Font.ui.bold,
          fontSize: 14,
          letterSpacing: 1.6,
          textTransform: "uppercase",
          color: primary ? ON_BRAND : theme.textPrimary,
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            FontStyle.ui.regular,
            {
              marginTop: 4,
              fontSize: 12,
              color: primary ? ON_BRAND_DIM : theme.textMuted,
            },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
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
    return () => cancelAnimation(dot);
  }, [dot]);
  const dotStyle = useAnimatedStyle(() => ({ opacity: 0.3 + dot.value * 0.7 }));

  const { label, tone, hint } = describe(state, flow);

  const color =
    tone === "success"
      ? theme.success
      : tone === "error"
        ? theme.danger
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
            paddingHorizontal: 24,
            lineHeight: 18,
          }}
        >
          {hint}
        </Text>
      ) : null}
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
            width: 52,
            height: 68,
            borderRadius: 12,
            backgroundColor: theme.surfaceAlt,
            borderWidth: 1,
            borderColor: theme.border,
            alignItems: "center",
            justifyContent: "center",
            opacity: dim ? 0.55 : 1,
          }}
        >
          <Text
            style={{
              fontFamily: Font.display.bold,
              fontSize: 32,
              lineHeight: 36,
              color: theme.textPrimary,
            }}
          >
            {ch}
          </Text>
        </View>
      ))}
    </View>
  );
}

function describe(
  state: RoomState,
  flow: "create" | "join",
): {
  label: string;
  tone: "pending" | "success" | "error";
  hint: string | null;
} {
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
        hint: null,
      };
    case "full":
      return {
        label: "Room is full",
        tone: "error",
        hint: "Two players are already in this room. Go back to try another code.",
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
        hint: "Lost the connection. Go back and try again.",
      };
  }
}
