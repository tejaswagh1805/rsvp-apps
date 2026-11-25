import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useStore } from "../store";
import { fonts, useTheme } from "../theme";
import { EventImage, formatDate, getDubaiToday } from "../ui";

const SORTS = ["Soonest", "Newest", "Few places left"] as const;

export function EventsScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const { events, rsvps, refreshEvents } = useStore();
  const today = getDubaiToday();
  const cats = ["All", ...Array.from(new Set(events
    .filter((event) => event.status === "published" && (event.endDate || event.date) >= today)
    .map((event) => event.category)
    .filter(Boolean)))];
  const areas = ["All areas", ...Array.from(new Set(events.map((event) => event.area.trim()).filter(Boolean)))];
  const [cat, setCat] = useState("All");
  const [area, setArea] = useState("All areas");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Soonest");

  useFocusEffect(useCallback(() => { void refreshEvents().catch(() => undefined); }, [refreshEvents]));

  const filtered = events.filter((event) =>
    (event.status === "published" || event.status === "closed")
    && (cat === "All" || event.category === cat)
    && (area === "All areas" || event.area === area),
  );
  const isPast = (event: (typeof events)[number]) => event.status === "closed" || (event.endDate || event.date) < today;
  const upcoming = filtered.filter((event) => !isPast(event)).sort((a, b) => {
    if (sort === "Newest") return b.date.localeCompare(a.date) || (b.time || "").localeCompare(a.time || "");
    if (sort === "Few places left") {
      const aHasCapacity = a.capacity > 0;
      const bHasCapacity = b.capacity > 0;
      if (aHasCapacity !== bHasCapacity) return aHasCapacity ? -1 : 1;
      if (aHasCapacity && bHasCapacity) return (a.capacity - a.confirmed) - (b.capacity - b.confirmed);
    }
    return a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || "");
  });
  const past = filtered.filter(isPast).sort((a, b) => (b.endDate || b.date).localeCompare(a.endDate || a.date));

  const chips = (items: string[], selected: string, onSelect: (value: string) => void) => (
    <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 14, paddingVertical: 6 }}>
      {items.map((item) => (
        <Pressable key={item} onPress={() => onSelect(item)} accessibilityRole="button" accessibilityState={{ selected: selected === item }} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: selected === item ? t.primary : t.border, backgroundColor: selected === item ? t.primary : t.surface }}>
          <Text style={{ fontFamily: fonts.bodyBold, color: selected === item ? t.primaryText : t.text, fontSize: 13 }}>{item}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );

  const eventCard = (ev: (typeof events)[number]) => (
    <Pressable key={ev.id} onPress={() => nav.navigate("Event", { id: ev.id })} accessibilityRole="button" accessibilityLabel={`View event: ${ev.title}`} android_ripple={{ color: t.border }} style={{ backgroundColor: t.surface, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: t.border, marginBottom: 14 }}>
      <EventImage event={ev} style={{ width: "100%", height: 190 }} />
      <View style={{ padding: 14 }}>
        <Text style={{ fontFamily: fonts.bodyBold, color: t.primary, fontSize: 12, letterSpacing: 1.5 }}>{ev.category.toUpperCase()} · {ev.brand}</Text>
        <Text style={{ fontFamily: fonts.display, fontSize: 28, color: t.text }}>{ev.title}</Text>
        <Text style={{ fontFamily: fonts.body, color: t.muted }}>{formatDate(ev.date)}{ev.time ? ` · ${ev.time}` : ""}{ev.area ? ` · ${ev.area}` : ""}</Text>
        {rsvps[ev.id] && rsvps[ev.id] !== "none" ? (
          <Text style={{ fontFamily: fonts.bodyBold, color: t.primary, marginTop: 6 }}>{({ going: "You're going", accepted: "RSVP accepted", pending: "RSVP pending review", waitlist: "On the waitlist", waitlisted: "Waitlisted", declined: "RSVP declined" } as Record<string, string>)[rsvps[ev.id] ?? ""] ?? "RSVP updated"}</Text>
        ) : null}
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={{ fontFamily: fonts.bodyBold, color: t.muted, fontSize: 12, marginLeft: 16, marginTop: 8 }}>CATEGORY</Text>
        {chips(cats, cat, setCat)}
        <Text style={{ fontFamily: fonts.bodyBold, color: t.muted, fontSize: 12, marginLeft: 16, marginTop: 4 }}>AREA</Text>
        {chips(areas, area, setArea)}
        <Text style={{ fontFamily: fonts.bodyBold, color: t.muted, fontSize: 12, marginLeft: 16, marginTop: 4 }}>SORT BY</Text>
        {chips([...SORTS], sort, (value) => setSort(value as (typeof SORTS)[number]))}
        <View style={{ paddingHorizontal: 14, paddingTop: 8 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 26, color: t.text, marginBottom: 10 }}>Upcoming events · {upcoming.length}</Text>
          {upcoming.length ? upcoming.map(eventCard) : <Text style={{ fontFamily: fonts.body, color: t.muted, paddingVertical: 14 }}>No upcoming events right now. Check back soon.</Text>}
          {past.length ? <>
            <Text style={{ fontFamily: fonts.display, fontSize: 26, color: t.text, marginTop: 20, marginBottom: 10 }}>Past events · {past.length}</Text>
            {past.map(eventCard)}
          </> : null}
        </View>
      </ScrollView>
    </View>
  );
}
