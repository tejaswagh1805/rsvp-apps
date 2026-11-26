import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { fonts, useTheme } from "../theme";
import { H1, P, Screen } from "../ui";

const SITE = "https://www.rsvpdxb.com";
const PAGES = [
  { title: "Membership", path: "/membership", icon: "ribbon-outline" },
  { title: "Events Wall", path: "/wall", icon: "newspaper-outline" },
  { title: "Host an event", path: "/host", icon: "business-outline" },
  { title: "Press", path: "/press", icon: "megaphone-outline" },
  { title: "About RSVP DXB", path: "/about", icon: "information-circle-outline" },
  { title: "Gallery", path: "/gallery", icon: "images-outline" },
  { title: "Privacy policy", path: "/privacy", icon: "shield-checkmark-outline" },
  { title: "Terms of use", path: "/terms", icon: "document-text-outline" },
] as const;

export function MoreScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const open = (path: string) => void Linking.openURL(`${SITE}${path}`).catch(() => Alert.alert("Could not open page", "Please try again when you have an internet connection."));
  return <Screen>
    <H1>Explore RSVP DXB</H1>
    <P>Open the same RSVP DXB pages and services available on the customer site.</P>
    <View style={{ marginTop: 18, gap: 9 }}>
      <PageLink title="RSVP Top Picks" icon="sparkles-outline" onPress={() => nav.navigate("TopPicks")} />
      <PageLink title="Venue guide" icon="location-outline" onPress={() => nav.navigate("VenueGuide")} />
      <PageLink title="Artists & Influencers" icon="people-outline" onPress={() => nav.navigate("Artists")} />
      <PageLink title="FAQ" icon="help-circle-outline" onPress={() => nav.navigate("FAQ")} />
      <PageLink title="Contact" icon="chatbubble-ellipses-outline" onPress={() => nav.navigate("Contact")} />
      {PAGES.map((page) => <PageLink key={page.path} title={page.title} icon={page.icon} onPress={() => open(page.path)} />)}
    </View>
  </Screen>;
}

function PageLink({ title, icon, onPress }: { title: string; icon: string; onPress: () => void }) {
  const t = useTheme();
  return <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => ({ flexDirection: "row", alignItems: "center", gap: 13, padding: 15, borderRadius: 14, borderWidth: 1, borderColor: t.border, backgroundColor: t.surface, opacity: pressed ? 0.75 : 1 })}>
    <Ionicons name={icon as any} size={21} color={t.primary} />
    <Text style={{ flex: 1, fontFamily: fonts.bodyBold, color: t.text, fontSize: 15 }}>{title}</Text>
    <Ionicons name="open-outline" size={18} color={t.muted} />
  </Pressable>;
}
