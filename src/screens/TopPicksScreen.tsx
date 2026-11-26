import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useMemo } from "react";
import { Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useStore } from "../store";
import { fonts, useTheme } from "../theme";
import { Button, EventImage, Eyebrow, H1, P, getDubaiToday, formatDate } from "../ui";
import { VenueEnquiryAction } from "./VenueScreen";

export function TopPicksScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const { events, venues, savedEvents, toggleSavedEvent, dataErrors, refreshEvents, refreshVenues } = useStore();
  useFocusEffect(useCallback(() => {
    void Promise.all([refreshEvents().catch(() => undefined), refreshVenues().catch(() => undefined)]);
  }, [refreshEvents, refreshVenues]));

  const today = getDubaiToday();
  const picks = useMemo(() => events.filter((event) => event.status === "published" && event.topPick && (event.endDate || event.date) >= today), [events, today]);
  const featuredVenues = useMemo(() => (venues ?? []).filter((venue) => venue.active !== false && venue.featured), [venues]);
  const hasError = Boolean(dataErrors.events || dataErrors.venues);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 48 }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 28, borderBottomWidth: 1, borderColor: t.border }}>
        <Eyebrow>Selected for the spotlight</Eyebrow>
        <H1>RSVP Top Picks</H1>
        <P>Explore the events hand-picked by RSVP DXB.</P>
      </View>
      <View style={{ paddingHorizontal: 18, paddingTop: 20 }}>
        {hasError ? <View style={{ marginBottom: 14 }}>
          <P>Some picks could not be refreshed. Pull down to try again.</P>
          {dataErrors.events ? <Button title="Retry events" variant="outline" style={{ marginTop: 8 }} onPress={() => void refreshEvents().catch(() => undefined)} /> : null}
          {dataErrors.venues ? <Button title="Retry venues" variant="outline" style={{ marginTop: 8 }} onPress={() => void refreshVenues().catch(() => undefined)} /> : null}
        </View> : null}
        {!picks.length && !featuredVenues.length ? <View style={{ borderWidth: 1, borderColor: t.border, backgroundColor: t.surface, borderRadius: 14, padding: 18 }}>
          <P>No RSVP Top Picks are available right now.</P>
        </View> : null}
        {picks.map((event) => (
          <View key={event.id} style={{ marginBottom: 18, overflow: "hidden", borderRadius: 18, borderWidth: 1, borderColor: t.border, backgroundColor: t.surface }}>
            <Pressable onPress={() => nav.navigate("Event", { id: event.id })} accessibilityRole="button" accessibilityLabel={`View event: ${event.title}`}>
              <View style={{ backgroundColor: t.deep, alignItems: "center", justifyContent: "center" }}>
                <EventImage event={event} style={{ width: "100%", height: 230 }} resizeMode="cover" />
                <Text style={{ position: "absolute", top: 14, left: 14, backgroundColor: t.primary, color: t.primaryText, borderRadius: 999, overflow: "hidden", paddingHorizontal: 12, paddingVertical: 6, fontFamily: fonts.bodyBold }}>{event.category}</Text>
              </View>
              <View style={{ padding: 16 }}>
                <Text style={{ color: t.muted, fontFamily: fonts.bodyBold, fontSize: 12, textTransform: "uppercase" }}>{formatDate(event.date)}{event.time ? ` · ${event.time}` : ""}{event.area ? ` · ${event.area}` : ""}</Text>
                <Text style={{ color: t.text, fontFamily: fonts.display, fontSize: 27, lineHeight: 31, marginTop: 7 }}>{event.title}</Text>
                <Text style={{ color: t.muted, fontFamily: fonts.body, fontSize: 15, marginTop: 8 }}>{event.venue || event.brand || "RSVP DXB event"}</Text>
                {event.about ? <Text numberOfLines={3} style={{ color: t.muted, fontFamily: fonts.body, fontSize: 14, lineHeight: 20, marginTop: 8 }}>{event.about}</Text> : null}
              </View>
            </Pressable>
            <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingBottom: 16 }}>
              <Button title={savedEvents.includes(event.id) ? "Saved" : "Save event"} variant="outline" style={{ flex: 1 }} onPress={() => toggleSavedEvent(event.id)} />
              <Button title="Request RSVP" style={{ flex: 1 }} onPress={() => nav.navigate("Event", { id: event.id })} />
            </View>
            {event.creatorPassFormUrl ? <Pressable onPress={() => void Linking.openURL(event.creatorPassFormUrl!).catch(() => undefined)} style={{ marginHorizontal: 16, marginBottom: 16, padding: 13, borderWidth: 1, borderColor: t.border, borderRadius: 14 }}>
              <Text style={{ color: t.text, fontFamily: fonts.bodyBold }}>Request a creator pass ↗</Text>
              <Text style={{ color: t.muted, fontFamily: fonts.body, fontSize: 12, marginTop: 2 }}>Send your details for team review</Text>
            </Pressable> : null}
          </View>
        ))}
        {featuredVenues.map((venue) => (
          <View key={`venue-${venue.id}`} style={{ marginBottom: 18, overflow: "hidden", borderRadius: 18, borderWidth: 1, borderColor: t.border, backgroundColor: t.surface }}>
            <Pressable onPress={() => nav.navigate("Venue", { slug: venue.slug })} accessibilityRole="button" accessibilityLabel={`Explore venue: ${venue.name}`}>
              <Image source={{ uri: venue.imageUrl }} style={{ width: "100%", height: 260, backgroundColor: t.deep }} resizeMode="cover" />
              <View style={{ padding: 16 }}>
                <Eyebrow>{venue.category}</Eyebrow>
                <Text style={{ color: t.text, fontFamily: fonts.display, fontSize: 27, marginTop: 4 }}>{venue.name}</Text>
                <Text style={{ color: t.muted, fontFamily: fonts.body, marginTop: 3 }}>{venue.location}</Text>
                {venue.tagline ? <Text style={{ color: t.muted, fontFamily: fonts.body, marginTop: 6 }}>{venue.tagline}</Text> : null}
              </View>
            </Pressable>
            <View style={{ flexDirection: "row", gap: 9, paddingHorizontal: 16, paddingBottom: 16 }}>
              <Button title="Explore venue" variant="outline" style={{ flex: 1 }} onPress={() => nav.navigate("Venue", { slug: venue.slug })} />
              {venue.websiteUrl || venue.moreInfoUrl ? <VenueEnquiryAction venue={venue} style={{ flex: 1 }} /> : null}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
