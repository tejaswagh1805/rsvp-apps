import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useVideoPlayer, VideoView } from "expo-video";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Animated, Dimensions, Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ARTISTS } from "../content";
import { useStore } from "../store";
import { fonts, useTheme } from "../theme";
import { Button, Eyebrow, EventCarousel, EventImage, getDubaiToday, H2, P, Pulse } from "../ui";
import { ArtistCard } from "./ArtistsScreen";
import { VenuePickTile } from "./VenueScreen";

const { width: W, height: H } = Dimensions.get("window");
const BANNER_H = Math.round(H * 0.76);

function Banner() {
  const player = useVideoPlayer(require("../../assets/banner.mp4"), (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });
  return (
    <View style={{ height: BANNER_H, overflow: "hidden" }}>
      <VideoView player={player} style={{ position: "absolute", width: W, height: BANNER_H }} contentFit="cover" nativeControls={false} />
      <LinearGradient colors={["rgba(31,18,8,0.55)", "transparent", "rgba(31,18,8,0.85)"]} style={{ position: "absolute", width: W, height: BANNER_H }} />
      <View style={{ position: "absolute", bottom: 28, left: 18, right: 18 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 54, lineHeight: 52, color: "#FFF7EC" }}>THE CITY IS{"\n"}BETTER TOGETHER.</Text>
        <Text style={{ fontFamily: fonts.body, color: "#F2DFC3", fontSize: 15, marginTop: 6 }}>Dubai's curated guest list — invitations, passes and the best rooms in town.</Text>
      </View>
    </View>
  );
}

export function HomeScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { events, peopleProfiles, venues, refreshEvents, refreshPeopleProfiles, refreshVenues } = useStore();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [solid, setSolid] = useState(false);
  const openTicketAvailability = () => nav.navigate("TicketAvailability");

  useFocusEffect(useCallback(() => {
    void Promise.all([refreshEvents().catch(() => undefined), refreshPeopleProfiles().catch(() => undefined), refreshVenues().catch(() => undefined)]);
  }, [refreshEvents, refreshPeopleProfiles, refreshVenues]));

  const today = getDubaiToday();
  const latestEvents = useMemo(() => events.filter((event) => event.status === "published" && event.latestEvent !== false && (event.endDate || event.date) >= today), [events, today]);
  const topPicks = useMemo(() => events.filter((event) => event.status === "published" && event.topPick && (event.endDate || event.date) >= today), [events, today]);
  const open = (id: string) => nav.navigate("Event", { id });

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      {/* Header overlays the banner, turns solid after scrolling */}
      <View style={{ position: "absolute", zIndex: 10, left: 0, right: 0, paddingTop: insets.top + 6, paddingHorizontal: 16, paddingBottom: 10,
        backgroundColor: solid ? t.deep : "transparent", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Image source={require("../../assets/logo.png")} style={{ width: 110, height: 40 }} resizeMode="contain" />
        <Pulse>
          <Pressable onPress={openTicketAvailability} style={{ backgroundColor: t.primary, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", gap: 6, alignItems: "center" }}>
            <Ionicons name="flash" size={14} color={t.primaryText} />
            <Text style={{ color: t.primaryText, fontFamily: fonts.bodyBold, fontSize: 13 }}>Last minute ticket</Text>
          </Pressable>
        </Pulse>
      </View>

      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
          listener: (e: any) => setSolid(e.nativeEvent.contentOffset.y > 60),
        })}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <Banner />
        <View style={{ padding: 18 }}>
          <View style={{ marginBottom: 34 }}>
            <Eyebrow>Fresh on the list</Eyebrow>
            <H2 style={{ marginTop: 4 }}>Latest events</H2>
            {latestEvents.length ? <EventCarousel items={latestEvents} onOpen={open} /> : <P>No latest events are available right now.</P>}
          </View>

          <View style={{ marginBottom: 28 }}>
            <Eyebrow>Hand-picked</Eyebrow>
            <H2 style={{ marginTop: 4 }}>RSVP top picks</H2>
            {topPicks.length ? <EventCarousel items={topPicks} onOpen={open} /> : <P>No RSVP Top Picks have been selected yet.</P>}
          </View>

          {venues?.some((venue) => venue.featured) ? <View style={{ marginBottom: 28 }}>
            <Eyebrow>Hand-picked</Eyebrow>
            <H2 style={{ marginTop: 4 }}>Venue Top Picks</H2>
            <Animated.ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -18 }} contentContainerStyle={{ paddingHorizontal: 18 }}>
              {venues.filter((venue) => venue.featured).map((venue) => <VenuePickTile key={venue.id} venue={venue} onPress={() => nav.navigate("Venue", { slug: venue.slug })} />)}
            </Animated.ScrollView>
            <Button title="Explore all venues" variant="outline" icon="arrow-forward" style={{ marginTop: 12 }} onPress={() => nav.navigate("VenueGuide")} />
          </View> : null}

          <H2>Latest events gallery</H2>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {latestEvents.slice(0, 6).map((ev) => (
              <Pressable key={ev.id} onPress={() => open(ev.id)} style={{ width: (W - 46) / 2 }}>
                <EventImage event={ev} style={{ width: "100%", height: 150, borderRadius: 16 }} />
              </Pressable>
            ))}
          </View>

          <Eyebrow>The people behind the energy</Eyebrow>
          <H2 style={{ marginTop: 4 }}>Artist's & Influencers</H2>
          {(peopleProfiles === null ? ARTISTS.map((artist) => ({ ...artist, id: artist.name })) : peopleProfiles.filter((profile) => profile.category.toLowerCase() === "artist").map((profile, index) => ({
            id: profile.id,
            name: profile.name,
            genre: profile.role || profile.subtitle || profile.bio || "",
            image: profile.imageUrl ? { uri: profile.imageUrl } : ARTISTS[index % ARTISTS.length].image,
            instagramUrl: profile.instagramUrl || undefined,
            tiktokUrl: profile.tiktokUrl || undefined,
            youtubeUrl: profile.youtubeUrl || undefined,
            xUrl: profile.xUrl || undefined,
          }))).map((a) => <ArtistCard key={a.id || a.name} artist={a} />)}
          <Button title="View artists & influencers" variant="outline" icon="arrow-forward" onPress={() => nav.navigate("Artists")} />

          <H2>Ticket & offers</H2>
          <P>Tickets, food n drinks, exclusive invites and corporate networking.</P>
          <Button title="Explore offers" icon="ticket-outline" style={{ marginTop: 12 }} onPress={() => nav.navigate("Offers")} />

          <View style={{ flexDirection: "row", gap: 10, marginTop: 28 }}>
            <Button title="FAQ" variant="outline" style={{ flex: 1 }} onPress={() => nav.navigate("FAQ")} />
            <Button title="Contact us" variant="outline" style={{ flex: 1 }} onPress={() => nav.navigate("Contact")} />
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}
