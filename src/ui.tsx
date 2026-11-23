import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated, Easing, Image, ImageStyle, ImageSourcePropType, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle,
} from "react-native";
import { EventItem } from "./data";
import { fonts, useTheme } from "./theme";

export function Screen({ children, scroll = true }: { children: React.ReactNode; scroll?: boolean }) {
  const t = useTheme();
  if (!scroll) return <View style={{ flex: 1, backgroundColor: t.bg }}>{children}</View>;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: 18, paddingBottom: 48 }}>
      {children}
    </ScrollView>
  );
}

export function H1({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return <Text style={{ fontFamily: fonts.display, fontSize: 44, lineHeight: 44, color: t.text, marginBottom: 8 }}>{children}</Text>;
}
export function H2({ children, style }: { children: React.ReactNode; style?: any }) {
  const t = useTheme();
  return <Text style={[{ fontFamily: fonts.display, fontSize: 30, color: t.text, marginTop: 24, marginBottom: 10 }, style]}>{children}</Text>;
}
export function Eyebrow({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: t.primary }}>{children}</Text>;
}
export function P({ children, style }: { children: React.ReactNode; style?: any }) {
  const t = useTheme();
  return <Text style={[{ fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: t.muted }, style]}>{children}</Text>;
}

export function Button({ title, onPress, variant = "solid", icon, style, disabled }: {
  title: string; onPress?: () => void; variant?: "solid" | "outline"; icon?: any; style?: ViewStyle; disabled?: boolean;
}) {
  const t = useTheme();
  const solid = variant === "solid";
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [{
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        paddingVertical: 14, paddingHorizontal: 20, borderRadius: 999,
        backgroundColor: solid ? t.primary : "transparent", borderWidth: 1.5, borderColor: t.primary,
        opacity: disabled ? 0.5 : pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.97 : 1 }],
      }, style]}
    >
      {icon ? <Ionicons name={icon} size={18} color={solid ? t.primaryText : t.primary} /> : null}
      <Text style={{ fontFamily: fonts.bodyBold, fontSize: 15, color: solid ? t.primaryText : t.primary }}>{title}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label: string }) {
  const t = useTheme();
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontFamily: fonts.bodyBold, color: t.text, marginBottom: 6 }}>{props.label}</Text>
      <TextInput placeholderTextColor={t.muted} {...props}
        style={{ borderWidth: 1, borderColor: t.border, backgroundColor: t.surface, color: t.text, borderRadius: 14, padding: 14, fontFamily: fonts.body, fontSize: 15 }} />
    </View>
  );
}

export function PasswordField(props: TextInputProps & { label: string }) {
  const t = useTheme();
  const [show, setShow] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontFamily: fonts.bodyBold, color: t.text, marginBottom: 6 }}>{props.label}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: t.border, backgroundColor: t.surface, borderRadius: 14 }}>
        <TextInput placeholderTextColor={t.muted} secureTextEntry={!show} autoCapitalize="none" {...props}
          style={{ flex: 1, color: t.text, padding: 14, fontFamily: fonts.body, fontSize: 15 }} />
        <Pressable onPress={() => setShow((s) => !s)} style={{ padding: 12 }} accessibilityLabel={show ? "Hide password" : "Show password"}>
          <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={20} color={t.muted} />
        </Pressable>
      </View>
    </View>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const t = useTheme();
  return <View style={[{ backgroundColor: t.surface, borderRadius: 22, padding: 16, borderWidth: 1, borderColor: t.border }, style]}>{children}</View>;
}

export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function EventImage({ event, style, resizeMode = "cover" }: { event: EventItem; style: ImageStyle; resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center" }) {
  const [remoteFailed, setRemoteFailed] = useState(false);
  useEffect(() => setRemoteFailed(false), [event.id, event.image]);
  const fallback = event.imageFallback as ImageSourcePropType | undefined;
  return (
    <Image
      source={remoteFailed && fallback ? fallback : event.image}
      style={style}
      resizeMode={resizeMode}
      onError={() => { if (fallback) setRemoteFailed(true); }}
    />
  );
}

export function getAvailableEvents(events: EventItem[]) {
  const now = Date.now();
  return events
    .filter((ev) => ev.status === "published" && ev.confirmed < ev.capacity && new Date(`${ev.date}T${ev.time || "00:00"}:00+04:00`).getTime() >= now)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

export function getDubaiToday() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dubai", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function shareEvent(ev: EventItem) {
  void Share.share({ message: `${ev.title} — ${formatDate(ev.date)} ${ev.time} at ${ev.venue}. RSVP DXB.` });
}

export function getLastMinuteEvent(events: EventItem[]) {
  const available = events.filter((ev) => ev.status === "published" && ev.confirmed < ev.capacity);
  const upcoming = available
    .filter((ev) => new Date(`${ev.date}T${ev.time || "00:00"}:00+04:00`).getTime() >= Date.now())
    .sort((a, b) => new Date(`${a.date}T${a.time || "00:00"}:00+04:00`).getTime() - new Date(`${b.date}T${b.time || "00:00"}:00+04:00`).getTime());
  return upcoming[0] ?? available.sort((a, b) => a.date.localeCompare(b.date))[0] ?? events[0];
}

/** Event tile with press zoom + highlight. */
export function EventTile({ ev, onPress, width = 220 }: { ev: EventItem; onPress: () => void; width?: number }) {
  const t = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) => Animated.spring(scale, { toValue: v, useNativeDriver: true, friction: 6 }).start();
  return (
    <Animated.View style={{ width, marginRight: 14, transform: [{ scale }] }}>
      <Pressable onPress={onPress} onPressIn={() => to(1.03)} onPressOut={() => to(1)}>
        <EventImage event={ev} style={{ width, height: width * 1.2, borderRadius: 20 }} />
        <View style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }, { justifyContent: "flex-end", padding: 12, borderRadius: 20, backgroundColor: "rgba(46,26,11,0.25)" }]}>
          <View style={{ alignSelf: "flex-start", backgroundColor: t.primary, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 6 }}>
            <Text style={{ color: t.primaryText, fontFamily: fonts.bodyBold, fontSize: 11 }}>{ev.category}</Text>
          </View>
          <Text style={{ color: "#FFF7EC", fontFamily: fonts.display, fontSize: 24, lineHeight: 24 }}>{ev.title}</Text>
          <Text style={{ color: "#F2DFC3", fontFamily: fonts.body, fontSize: 12 }}>{formatDate(ev.date)} · {ev.area}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

/** Endless auto-scrolling row. direction "left" = right-to-left movement. */
export function Marquee({ items, direction, onOpen }: { items: EventItem[]; direction: "left" | "right"; onOpen: (id: string) => void }) {
  const tile = 220 + 14;
  const rowWidth = tile * items.length;
  const x = useRef(new Animated.Value(direction === "left" ? 0 : -rowWidth)).current;
  const animation = useRef<Animated.CompositeAnimation | null>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(x, {
        toValue: direction === "left" ? -rowWidth : 0,
        duration: items.length * 3500,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animation.current = anim;
    anim.start();
    return () => {
      anim.stop();
      animation.current = null;
    };
  }, [rowWidth, direction]);
  useEffect(() => {
    if (paused) animation.current?.stop();
    else animation.current?.start();
  }, [paused]);
  const doubled = [...items, ...items];
  return (
    <View
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      onTouchCancel={() => setPaused(false)}
      style={{ overflow: "hidden", marginHorizontal: -18 }}
    >
      <Animated.View style={{ flexDirection: "row", transform: [{ translateX: x }] }}>
        {doubled.map((ev, i) => <EventTile key={ev.id + i} ev={ev} onPress={() => onOpen(ev.id)} />)}
      </Animated.View>
    </View>
  );
}

/** Pulsing highlight wrapper (used for "Last minute ticket"). */
export function Pulse({ children }: { children: React.ReactNode }) {
  const s = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(s, { toValue: 1.05, duration: 700, useNativeDriver: true }),
      Animated.timing(s, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]));
    a.start();
    return () => a.stop();
  }, []);
  return <Animated.View style={{ transform: [{ scale: s }] }}>{children}</Animated.View>;
}
