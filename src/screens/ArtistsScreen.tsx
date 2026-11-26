import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Image, Linking, Pressable, Text, View } from "react-native";
import { ARTISTS, INFLUENCERS } from "../content";
import { PeopleProfile, useStore } from "../store";
import { fonts, useTheme } from "../theme";
import { H2, P, Screen } from "../ui";

type ArtistCardItem = { id?: string; name: string; genre: string; image: any; instagramUrl?: string; tiktokUrl?: string; youtubeUrl?: string; xUrl?: string };

export function ArtistCard({ artist }: { artist: ArtistCardItem }) {
  const t = useTheme();
  const socialLinks = [
    ["logo-instagram", artist.instagramUrl],
    ["logo-tiktok", artist.tiktokUrl],
    ["logo-twitter", artist.xUrl],
    ["logo-youtube", artist.youtubeUrl],
  ] as const;
  const profileSlug = artist.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const openLink = (url: string) => void Linking.openURL(url).catch(() => Alert.alert("Could not open link", "Please try again when you have an internet connection."));
  return (
    <View style={{ marginBottom: 16, borderRadius: 22, overflow: "hidden", backgroundColor: t.surface, borderWidth: 1, borderColor: t.border }}>
      <View>
        <Image source={artist.image} style={{ width: "100%", height: 260 }} />
        {artist.youtubeUrl ? <Pressable onPress={() => openLink(artist.youtubeUrl!)} accessibilityLabel="Open YouTube profile"
          style={{ position: "absolute", top: "40%", alignSelf: "center", width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(168,100,42,0.9)", alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="play" size={30} color="#FFF7EC" />
        </Pressable> : null}
      </View>
      <View style={{ padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <Pressable onPress={() => openLink(`https://www.rsvpdxb.com/artists/${encodeURIComponent(profileSlug)}`)} accessibilityRole="link">
            <Text style={{ fontFamily: fonts.display, fontSize: 26, color: t.text }}>{artist.name}</Text>
          </Pressable>
          <Text style={{ fontFamily: fonts.body, color: t.muted }}>{artist.genre}</Text>
        </View>
        {socialLinks.filter(([, url]) => Boolean(url)).map(([icon, url]) => (
          <Pressable key={icon} onPress={() => openLink(url!)} style={{ padding: 8 }}>
            <Ionicons name={icon} size={22} color={t.primary} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function mapProfile(profile: PeopleProfile, index: number, fallback: typeof ARTISTS): ArtistCardItem {
  return {
    id: profile.id,
    name: profile.name,
    genre: profile.role || profile.subtitle || profile.bio || "",
    image: profile.imageUrl ? { uri: profile.imageUrl } : fallback[index % fallback.length].image,
    instagramUrl: profile.instagramUrl || undefined,
    tiktokUrl: profile.tiktokUrl || undefined,
    youtubeUrl: profile.youtubeUrl || undefined,
    xUrl: profile.xUrl || undefined,
  };
}

export function ArtistsScreen() {
  const { peopleProfiles } = useStore();
  const artists: ArtistCardItem[] = peopleProfiles === null ? ARTISTS : peopleProfiles.filter((profile) => profile.category.toLowerCase() === "artist").map((profile, index) => mapProfile(profile, index, ARTISTS));
  const influencers: ArtistCardItem[] = peopleProfiles === null ? INFLUENCERS : peopleProfiles.filter((profile) => profile.category.toLowerCase() === "influencer").map((profile, index) => mapProfile(profile, index, INFLUENCERS));
  return (
    <Screen>
      <P>The voices, sounds and faces that bring our rooms to life.</P>
      <H2>Artists</H2>
      {artists.length ? artists.map((a) => <ArtistCard key={a.id || a.name} artist={a} />) : <P>No active artist profiles are available.</P>}
      <H2>Influencers</H2>
      {influencers.length ? influencers.map((a) => <ArtistCard key={a.id || a.name} artist={a} />) : <P>No active influencer profiles are available.</P>}
    </Screen>
  );
}
