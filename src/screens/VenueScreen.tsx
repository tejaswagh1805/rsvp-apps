import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Image, Linking, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Venue, useStore } from "../store";
import { fonts, useTheme } from "../theme";
import { Button, Card, Eyebrow, Field, H1, H2, P, Screen } from "../ui";

function VenueCard({ venue, onPress }: { venue: Venue; onPress: () => void }) {
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
      {venue.websiteUrl || venue.moreInfoUrl ? <VenueEnquiryAction venue={venue} style={{ marginTop: 10 }} /> : null}
    </View>
  );
}

export function VenueEnquiryAction({ venue, style }: { venue: Venue; style?: any }) {
  const t = useTheme();
  const { member, submitVenueEnquiry } = useStore();
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(member?.name ?? "");
    setEmail(member?.email ?? "");
    setPhone(member?.phone ?? "");
    setConsent(false);
  }, [visible, member?.memberId, venue.id]);

  const submit = async () => {
    if (name.trim().length < 2) return Alert.alert("Enter your name", "Please enter your name to continue.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return Alert.alert("Check your email", "Enter a valid email address.");
    if (phone.trim() && !/^\+?[\d\s().-]{8,22}$/.test(phone.trim())) return Alert.alert("Check your phone", "Enter a valid phone number or leave it blank.");
    if (!consent) return Alert.alert("Consent required", "Please agree before continuing to the venue website.");

    setBusy(true);
    try {
      const result = await submitVenueEnquiry({ venueId: venue.id, name: name.trim(), email: email.trim(), phone: phone.trim(), consent });
      setVisible(false);
      await Linking.openURL(result.redirectUrl);
    } catch (error) {
      Alert.alert("Could not submit enquiry", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return <>
    <Button title="Enquire now" variant="outline" style={style} onPress={() => setVisible(true)} />
    <Modal visible={visible} transparent animationType="slide" onRequestClose={() => { if (!busy) setVisible(false); }}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(20,12,6,0.62)" }}>
        <Pressable onPress={() => { if (!busy) setVisible(false); }} style={{ flex: 1 }} accessibilityLabel="Close venue enquiry" />
        <View style={{ maxHeight: "88%", backgroundColor: t.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 22, paddingBottom: 28 }}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Eyebrow>RSVP DXB · VENUE ENQUIRY</Eyebrow>
            <H2 style={{ marginTop: 6 }}>Visit {venue.name}</H2>
            <P style={{ marginBottom: 18 }}>Your details help us understand how guests discover our venue picks.</P>
            <Field label="Your name" value={name} onChangeText={setName} autoComplete="name" />
            <Field label="Email address" value={email} onChangeText={setEmail} autoComplete="email" keyboardType="email-address" autoCapitalize="none" />
            <Field label="Phone (optional)" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            <Pressable onPress={() => setConsent((value) => !value)} accessibilityRole="checkbox" accessibilityState={{ checked: consent }} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 18 }}>
              <View style={{ width: 22, height: 22, borderRadius: 5, borderWidth: 1, borderColor: consent ? t.primary : t.muted, backgroundColor: consent ? t.primary : t.surface, alignItems: "center", justifyContent: "center" }}>
                {consent ? <Ionicons name="checkmark" size={16} color={t.primaryText} /> : null}
              </View>
              <Text style={{ flex: 1, color: t.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 19 }}>I agree to share my details with RSVP DXB to record this venue referral and continue to the venue website.</Text>
            </Pressable>
            <Button title={busy ? "Submitting…" : "Continue to venue"} icon="open-outline" disabled={busy} onPress={() => void submit()} />
            <Button title="Cancel" variant="outline" disabled={busy} style={{ marginTop: 10 }} onPress={() => setVisible(false)} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  </>;
}

export function VenueDirectoryScreen() {
  const nav = useNavigation<any>();
  const { venues, refreshVenues } = useStore();
  const t = useTheme();
  useFocusEffect(useCallback(() => { void refreshVenues().catch(() => undefined); }, [refreshVenues]));
  const [category, setCategory] = useState("All venues");
  const allVenues = venues ?? [];
  const categories = useMemo(() => ["All venues", ...Array.from(new Set(allVenues.map((venue) => venue.category)))], [allVenues]);
  const filteredVenues = allVenues.filter((venue) => category === "All venues" || venue.category === category);
  return (
    <Screen>
      <Eyebrow>RSVP DXB · CITY GUIDE</Eyebrow>
      <H1>Venue Top Picks</H1>
      <P>Places selected by RSVP DXB, with the details and links guests need.</P>
      {allVenues.length ? <FlatList horizontal data={categories} keyExtractor={(item) => item} showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginHorizontal: -18 }} contentContainerStyle={{ paddingHorizontal: 18, paddingVertical: 12, gap: 8 }} renderItem={({ item }) => (
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
          {venue.websiteUrl || venue.moreInfoUrl ? <VenueEnquiryAction venue={venue} style={{ marginTop: 8, alignSelf: "flex-start" }} /> : null}
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
      {venue.websiteUrl ? <Button title="Visit venue website" icon="open-outline" style={{ marginTop: 20 }} onPress={() => openLink(venue.websiteUrl)} /> : null}
      {venue.moreInfoUrl ? <Button title="More information" variant="outline" style={{ marginTop: 10 }} onPress={() => openLink(venue.moreInfoUrl)} /> : null}
      {venue.websiteUrl || venue.moreInfoUrl ? <VenueEnquiryAction venue={venue} style={{ marginTop: 10 }} /> : null}
      <Button title="All Venue Top Picks" variant="outline" style={{ marginTop: 12 }} onPress={() => nav.navigate("VenueGuide")} />
    </Screen>
  );
}

export function VenuePickTile({ venue, onPress }: { venue: Venue; onPress: () => void }) {
  return <VenueCard venue={venue} onPress={onPress} />;
}
