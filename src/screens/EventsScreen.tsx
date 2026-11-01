import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { useStore } from "../store";
import { fonts, useTheme } from "../theme";
import { formatDate, getDubaiToday } from "../ui";

export function EventsScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const { events, rsvps, refreshEvents } = useStore();
  const cats = ["All", ...Array.from(new Set(events.map((e) => e.category)))];
  const [cat, setCat] = useState("All");
  const today = getDubaiToday();
  useFocusEffect(useCallback(() => { void refreshEvents().catch(() => undefined); }, [refreshEvents]));
  const list = events
    .filter((e) => (e.status === "published" || e.status === "closed") && (cat === "All" || e.category === cat))
    .sort((a, b) => {
      const aPast = a.status === "closed" || (a.endDate || a.date) < today;
      const bPast = b.status === "closed" || (b.endDate || b.date) < today;
      if (aPast !== bPast) return aPast ? 1 : -1;
      return aPast ? (b.endDate || b.date).localeCompare(a.endDate || a.date) : a.date.localeCompare(b.date);
    });

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <FlatList
        horizontal showsHorizontalScrollIndicator={false} data={cats} keyExtractor={(c) => c}
        style={{ flexGrow: 0 }} contentContainerStyle={{ padding: 14, gap: 8 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => setCat(item)} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: t.primary, backgroundColor: cat === item ? t.primary : "transparent" }}>
            <Text style={{ fontFamily: fonts.bodyBold, color: cat === item ? t.primaryText : t.primary }}>{item}</Text>
          </Pressable>
        )}
      />
      <FlatList
        data={list} keyExtractor={(e) => e.id} contentContainerStyle={{ padding: 14, paddingTop: 0, gap: 14, paddingBottom: 100 }}
        renderItem={({ item: ev }) => (
          <Pressable onPress={() => nav.navigate("Event", { id: ev.id })} style={{ backgroundColor: t.surface, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: t.border }}>
            <Image source={ev.image} style={{ width: "100%", height: 180 }} />
            <View style={{ padding: 14 }}>
              <Text style={{ fontFamily: fonts.bodyBold, color: t.primary, fontSize: 12, letterSpacing: 1.5 }}>{ev.category.toUpperCase()} · {ev.brand}</Text>
              <Text style={{ fontFamily: fonts.display, fontSize: 28, color: t.text }}>{ev.title}</Text>
              <Text style={{ fontFamily: fonts.body, color: t.muted }}>{formatDate(ev.date)} · {ev.time} · {ev.area}</Text>
              {rsvps[ev.id] && rsvps[ev.id] !== "none" ? (
                <Text style={{ fontFamily: fonts.bodyBold, color: t.primary, marginTop: 6 }}>{({ going: "✓ You're going", accepted: "✓ RSVP accepted", pending: "RSVP pending review", waitlist: "On the waitlist", waitlisted: "Waitlisted", declined: "RSVP declined" } as Record<string, string>)[rsvps[ev.id] ?? ""] ?? "RSVP updated"}</Text>
              ) : null}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
