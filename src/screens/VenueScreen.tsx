import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Image, Linking, Pressable, Text, View } from "react-native";
import { Venue, useStore } from "../store";
import { fonts, useTheme } from "../theme";
import { Button, Card, Eyebrow, H1, H2, P, Screen } from "../ui";

function VenueCard({ venue, onPress, onEnquire }: { venue: Venue; onPress: () => void; onEnquire?: () => void }) {
  const t = useTheme();
  return (
    <View style={{ width: 220, marginRight: 14 }}>
      <Pressable onPress={onPress} accessibilityRole="button">
        <Image source={{ uri: venue.imageUrl }} style={{ width: 220, height: 250, borderRadius: 20, backgroundColor: t.surface }} />
        <View style={{ paddingTop: 10 }}>
          <Eyebrow>{venue.category}</Eyebrow>
          <Text numberOfLines={1} style={{ fontFamily: fonts.display, fontSize: 24, color: t.text, marginTop: 3 }}>{venue.name}</Text>
          <Text numberOfLines={2} style={{ fontFamily: fonts.body, fontSize: 13, color: t.muted }}>{venue.location}</Text>
        </View>
      </Pressable>
      {onEnquire ? <Button title="Enquire now" variant="outline" style={{ marginTop: 10, paddingVertical: 10, paddingHorizontal: 12 }} onPress={onEnquire} /> : null}
    </View>
  );
}

function openVenueEnquiry() {
  void Linking.openURL("https://www.rsvpdxb.com/top-picks").catch(() => Alert.alert("Could not open venue enquiries", "Please try again when you have an internet connection."));
}

export function VenueDirectoryScreen() {
  const nav = useNavigation<any>();
  const { venues, refreshVenues } = useStore();
  const t = useTheme();
  useFocusEffect(useCallback(() => { void refreshVenues().catch(() => undefined); }, [refreshVenues]));
  const [category, setCategory] = useState("All venues");
  const categories = useMemo(() => ["All venues", ...Array.from(new Set((venues ?? []).map((venue) => venue.category)))], [venues]);
  const filteredVenues = venues?.filter((venue) => category === "All venues" || venue.category === category) ?? [];
  return (
    <Screen>
      <Eyebrow>RSVP DXB · CITY GUIDE</Eyebrow>
      <H1>Venue Top Picks</H1>
      <P>Places selected by RSVP DXB, with the details and links guests need.</P>
      {venues?.length ? <FlatList horizontal data={categories} keyExtractor={(item) => item} showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginHorizontal: -18 }} contentContainerStyle={{ paddingHorizontal: 18, paddingVertical: 12, gap: 8 }} renderItem={({ item }) => (
        <Pressable onPress={() => setCategory(item)} style={{ paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: t.primary, backgroundColor: category === item ? t.primary : "transparent" }}>
          <Text style={{ fontFamily: fonts.bodyBold, color: category === item ? t.primaryText : t.primary }}>{item}</Text>
        </Pressable>
      )} /> : null}
      {venues === null ? <P style={{ marginTop: 18 }}>Venue picks are unavailable right now. Please try again later.</P> : filteredVenues.length ? filteredVenues.map((venue) => (
        <View key={venue.id} style={{ marginTop: 14 }}>
          <Pressable onPress={() => nav.navigate("Venue", { slug: venue.slug })} accessibilityRole="button">
            <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Image source={{ uri: venue.imageUrl }} style={{ width: 82, height: 96, borderRadius: 14, backgroundColor: t.deep }} />
              <View style={{ flex: 1 }}>
                <Eyebrow>{venue.category}</Eyebrow>
                <Text style={{ fontFamily: fonts.display, fontSize: 23, color: t.text, marginTop: 4 }}>{venue.name}</Text>
                <Text numberOfLines={2} style={{ fontFamily: fonts.body, color: t.muted, marginTop: 4 }}>{venue.location}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={t.primary} />
            </Card>
          </Pressable>
          <Button title="Enquire now" variant="outline" style={{ marginTop: 8, alignSelf: "flex-start" }} onPress={openVenueEnquiry} />
        </View>
      )) : <Card style={{ marginTop: 18 }}><P>No venues are featured at the moment.</P></Card>}
    </Screen>
  );
}

export function VenueDetailScreen() {
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const { venues } = useStore();
  const t = useTheme();
  const venue: Venue | undefined = venues?.find((item) => item.slug === params.slug);
  if (!venue) return <Screen><H1>Venue not found.</H1><Button title="Browse Venue Top Picks" variant="outline" onPress={() => nav.navigate("VenueGuide")} /></Screen>;
  const openLink = (url: string) => void Linking.openURL(url).catch(() => undefined);
  return (
    <Screen>
      <Image source={{ uri: venue.imageUrl }} style={{ width: "100%", height: 290, borderRadius: 22, marginBottom: 18, backgroundColor: t.surface }} />
      <Eyebrow>{venue.category}</Eyebrow>
      <H1>{venue.name}</H1>
      {venue.tagline ? <P style={{ marginBottom: 8 }}>{venue.tagline}</P> : null}
      <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
        <Ionicons name="location-outline" size={18} color={t.primary} />
        <P style={{ flex: 1 }}>{venue.location}</P>
      </View>
      {venue.featuredDate ? <P style={{ marginTop: 8 }}>Featured {new Date(`${venue.featuredDate}T12:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</P> : null}
      <H2>About this place</H2>
      {venue.description.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <P key={index} style={{ marginBottom: 10 }}>{paragraph}</P>)}
      {venue.highlights?.length ? <><H2>Highlights</H2>{venue.highlights.map((item) => <P key={item} style={{ marginBottom: 6 }}>•  {item}</P>)}</> : null}
      {venue.offer ? <Card style={{ marginTop: 18 }}><Eyebrow>Good to know</Eyebrow><P style={{ marginTop: 6 }}>{venue.offer}</P></Card> : null}
      {venue.websiteUrl && !venue.websiteUrl.includes("rsvpdxb.com/top-picks") ? <Button title="Visit venue website" icon="open-outline" style={{ marginTop: 20 }} onPress={() => openLink(venue.websiteUrl)} /> : null}
      {venue.moreInfoUrl || (venue.websiteUrl && venue.websiteUrl.includes("rsvpdxb.com/top-picks")) ? <Button title="More information" variant="outline" style={{ marginTop: 10 }} onPress={() => openLink(venue.moreInfoUrl || venue.websiteUrl)} /> : null}
      {venue.websiteUrl || venue.moreInfoUrl ? <Button title="Enquire now" variant="outline" style={{ marginTop: 10 }} onPress={openVenueEnquiry} /> : null}
      <Button title="All Venue Top Picks" variant="outline" style={{ marginTop: 12 }} onPress={() => nav.navigate("VenueGuide")} />
    </Screen>
  );
}

export function VenuePickTile({ venue, onPress, onEnquire = openVenueEnquiry }: { venue: Venue; onPress: () => void; onEnquire?: () => void }) {
  return <VenueCard venue={venue} onPress={onPress} onEnquire={venue.websiteUrl || venue.moreInfoUrl ? onEnquire : undefined} />;
}
