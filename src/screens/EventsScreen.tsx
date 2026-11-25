import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useStore } from "../store";
import { fonts, useTheme } from "../theme";
import { Button, EventImage, formatDate, getDubaiToday } from "../ui";
import { VenuePickTile } from "./VenueScreen";

const SORTS = ["Soonest", "Newest", "Few places left"] as const;

export function EventsScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { events, venues, rsvps, savedEvents, dataErrors, toggleSavedEvent, refreshEvents } = useStore();
  const today = getDubaiToday();
  const featuredOnly = route.params?.featuredMode === "topPicks";
  const featuredVenues = useMemo(() => (venues ?? []).filter((venue) => venue.active !== false && venue.featured), [venues]);
  const sourceEvents = useMemo(() => featuredOnly
    ? events.filter((event) => event.status === "published" && event.topPick === true && (event.endDate || event.date) >= today)
    : events, [events, featuredOnly, today]);
  const [category, setCategory] = useState("All");
  const [area, setArea] = useState("All areas");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Soonest");

  useFocusEffect(useCallback(() => { void refreshEvents().catch(() => undefined); }, [refreshEvents]));

  const categories = useMemo(() => ["All", ...Array.from(new Set(sourceEvents
    .filter((event) => event.status === "published" && (event.endDate || event.date) >= today)
    .map((event) => event.category.trim())
    .filter(Boolean)))], [sourceEvents, today]);
  const areas = useMemo(() => ["All areas", ...Array.from(new Set(sourceEvents
    .map((event) => event.area.trim()).filter(Boolean)))], [sourceEvents]);

  const { upcoming, past } = useMemo(() => {
    let matching = sourceEvents.filter((event) =>
      (event.status === "published" || event.status === "closed")
      && (category === "All" || event.category === category)
      && (area === "All areas" || event.area === area),
    );
    const isPast = (event: (typeof events)[number]) =>
      event.status === "closed" || (event.endDate || event.date) < today;
    const upcomingEvents = matching.filter((event) => !isPast(event));
    const pastEvents = featuredOnly ? [] : matching.filter(isPast);

    if (sort === "Few places left") {
      upcomingEvents.sort((a, b) => {
        const aHasCapacity = a.capacity > 0;
        const bHasCapacity = b.capacity > 0;
        if (aHasCapacity !== bHasCapacity) return aHasCapacity ? -1 : 1;
        if (aHasCapacity && bHasCapacity) return (a.capacity - a.confirmed) - (b.capacity - b.confirmed);
        return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
      });
    } else if (sort === "Newest") {
      upcomingEvents.sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
    } else {
      upcomingEvents.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
    }
    pastEvents.sort((a, b) => (b.endDate || b.date).localeCompare(a.endDate || a.date));
    return { upcoming: upcomingEvents, past: pastEvents };
  }, [sourceEvents, category, area, sort, today, featuredOnly]);

  const chipRow = (items: string[], selected: string, onSelect: (value: string) => void) => (
    <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 14, paddingVertical: 7 }}>
      {items.map((item) => (
        <Pressable key={item} onPress={() => onSelect(item)} accessibilityRole="button" accessibilityState={{ selected: selected === item }}
          style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: selected === item ? t.primary : t.border, backgroundColor: selected === item ? t.primary : t.surface }}>
          <Text style={{ fontFamily: fonts.bodyBold, color: selected === item ? t.primaryText : t.text, fontSize: 13 }}>{item}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );

  const eventCard = (event: (typeof events)[number], isPastEvent: boolean) => {
    const placesLeft = Math.max(event.capacity - event.confirmed, 0);
    const full = event.capacity > 0 && placesLeft === 0;
    const limited = event.capacity > 0 && placesLeft > 0 && placesLeft <= 10;
    const rsvpLabel: Record<string, string> = {
      going: "You're going", accepted: "RSVP accepted", pending: "RSVP pending review",
      waitlist: "On the waitlist", waitlisted: "Waitlisted", declined: "RSVP declined",
    };

    return (
      <View key={event.id} style={{ backgroundColor: t.surface, borderRadius: 20, overflow: "hidden", borderWidth: 1, borderColor: t.border, marginBottom: 14 }}>
        <Pressable onPress={() => nav.navigate("Event", { id: event.id })} accessibilityRole="button" accessibilityLabel={`View ${event.title}`}>
          <View>
            <EventImage event={event} style={{ width: "100%", height: 205 }} />
            <View style={{ position: "absolute", top: 12, left: 12, right: 12, flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {[event.category, ...(isPastEvent ? ["Past event"] : []), ...(!isPastEvent && event.tracks.length > 0 && limited ? [`${placesLeft} ${placesLeft === 1 ? "place" : "places"} left`] : []), ...(!isPastEvent && event.tracks.length > 0 && full ? ["Full"] : [])].map((label, index) => (
                <Text key={`${label}-${index}`} style={{ overflow: "hidden", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: index === 0 ? t.primary : "rgba(31,18,8,0.78)", color: "#FFF7EC", fontFamily: fonts.bodyBold, fontSize: 12 }}>{label}</Text>
              ))}
            </View>
          </View>
          <View style={{ padding: 14 }}>
            <Text style={{ fontFamily: fonts.bodyBold, color: t.muted, fontSize: 12 }}>{formatDate(event.date)}{event.time ? ` · ${event.time}` : ""}{event.area ? ` · ${event.area}` : ""}</Text>
            <Text numberOfLines={2} style={{ fontFamily: fonts.display, color: t.text, fontSize: 24, lineHeight: 28, marginTop: 5 }}>{event.title}</Text>
            <Text style={{ fontFamily: fonts.body, color: t.muted, fontSize: 14, marginTop: 3 }}>{event.brand || event.venue || "RSVP DXB event"}</Text>
            <Text numberOfLines={2} style={{ fontFamily: fonts.body, color: t.muted, fontSize: 14, lineHeight: 20, marginTop: 10 }}>
              {isPastEvent ? event.about.slice(0, 150) : event.applicationDeadline ? `Nominations close ${formatDate(event.applicationDeadline)}` : event.ageRestriction || event.hashtag || (event.tracks.length ? `Open to ${event.tracks.join(", ")}` : event.about)}
            </Text>
            {rsvps[event.id] && rsvps[event.id] !== "none" ? <Text style={{ fontFamily: fonts.bodyBold, color: t.primary, marginTop: 8 }}>{rsvpLabel[rsvps[event.id] ?? ""] ?? "RSVP updated"}</Text> : null}
          </View>
        </Pressable>

        <View style={{ flexDirection: "row", gap: 9, paddingHorizontal: 14, paddingBottom: 14 }}>
          {isPastEvent ? <Button title="View recap" icon="arrow-up-outline" style={{ flex: 1 }} onPress={() => nav.navigate("Event", { id: event.id })} /> : <>
            <Button title={savedEvents.includes(event.id) ? "Saved" : "Save event"} variant="outline" style={{ flex: 1 }} onPress={() => toggleSavedEvent(event.id)} />
            <Button title="Request RSVP" style={{ flex: 1 }} onPress={() => nav.navigate("Event", { id: event.id })} />
          </>}
        </View>
        {!isPastEvent && event.creatorPassFormUrl ? <Pressable onPress={() => nav.navigate("Event", { id: event.id })} style={{ paddingHorizontal: 16, paddingBottom: 14 }} accessibilityRole="button" accessibilityLabel="Open creator pass request">
          <Text style={{ color: t.primary, fontFamily: fonts.bodyBold }}>Request a creator pass  ↗</Text>
          <Text style={{ color: t.muted, fontFamily: fonts.body, fontSize: 12, marginTop: 2 }}>Send your details for team review</Text>
        </Pressable> : null}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 31, color: t.text, marginHorizontal: 16, marginTop: 8 }}>{featuredOnly ? "RSVP Top Picks" : "What is on"}</Text>
        <Text style={{ fontFamily: fonts.body, color: t.muted, fontSize: 14, marginHorizontal: 16, marginBottom: 12 }}>{featuredOnly ? "Explore the events hand-picked by RSVP DXB." : "Browse event details, ticket links, reservation contacts and creator opportunities."}</Text>
        {dataErrors.events ? <View style={{ marginHorizontal: 14, marginBottom: 8 }}>
          <Text style={{ fontFamily: fonts.body, color: t.primary, fontSize: 13 }}>Could not refresh live events: {dataErrors.events}</Text>
          <Button title="Retry loading events" variant="outline" style={{ marginTop: 8 }} onPress={() => void refreshEvents().catch(() => undefined)} />
        </View> : null}
        {featuredOnly ? <Button title="All events" variant="outline" icon="arrow-back" style={{ marginHorizontal: 14, marginBottom: 8 }} onPress={() => nav.setParams({ featuredMode: undefined })} /> : null}
        <Text style={{ fontFamily: fonts.bodyBold, color: t.muted, fontSize: 12, marginLeft: 16, marginTop: 4 }}>CATEGORY</Text>
        {chipRow(categories, category, setCategory)}
        <Text style={{ fontFamily: fonts.bodyBold, color: t.muted, fontSize: 12, marginLeft: 16, marginTop: 4 }}>AREA</Text>
        {chipRow(areas, area, setArea)}
        <Text style={{ fontFamily: fonts.bodyBold, color: t.muted, fontSize: 12, marginLeft: 16, marginTop: 4 }}>SORT EVENTS</Text>
        {chipRow([...SORTS], sort, (value) => setSort(value as (typeof SORTS)[number]))}
        <View style={{ paddingHorizontal: 14, paddingTop: 8 }}>
          {featuredOnly ? <>
            {upcoming.length ? <>
              <Text style={{ fontFamily: fonts.bodyBold, color: t.primary, fontSize: 12, letterSpacing: 1.5, marginBottom: 10 }}>FEATURED EVENTS · {upcoming.length}</Text>
              {upcoming.map((event) => eventCard(event, false))}
            </> : null}
            {featuredVenues.length ? <>
              <Text style={{ fontFamily: fonts.bodyBold, color: t.primary, fontSize: 12, letterSpacing: 1.5, marginTop: 18, marginBottom: 10 }}>VENUE TOP PICKS · {featuredVenues.length}</Text>
              <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 14 }}>
                {featuredVenues.map((venue) => <VenuePickTile key={venue.id} venue={venue} onPress={() => nav.navigate("Venue", { slug: venue.slug })} />)}
              </ScrollView>
            </> : null}
            {!upcoming.length && !featuredVenues.length ? <Text style={{ fontFamily: fonts.body, color: t.muted, paddingVertical: 18 }}>No RSVP Top Picks are available right now.</Text> : null}
          </> : <>
            <Text style={{ fontFamily: fonts.body, color: t.muted, fontSize: 13, marginBottom: 10 }}>{upcoming.length} upcoming {upcoming.length === 1 ? "event" : "events"}</Text>
            {upcoming.length ? upcoming.map((event) => eventCard(event, false)) : <Text style={{ fontFamily: fonts.body, color: t.muted, paddingVertical: 18 }}>{`No ${category === "All" ? "upcoming events" : `${category} events`} right now — check back soon.`}</Text>}
          </>}
          {past.length ? <>
            <Text style={{ fontFamily: fonts.display, fontSize: 27, color: t.text, marginTop: 24, marginBottom: 4 }}>Past events</Text>
            <Text style={{ fontFamily: fonts.body, color: t.muted, fontSize: 13, marginBottom: 10 }}>{past.length} event recaps</Text>
            {past.map((event) => eventCard(event, true))}
          </> : null}
        </View>
      </ScrollView>
    </View>
  );
}
