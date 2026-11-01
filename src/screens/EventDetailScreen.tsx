import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import { Alert, Image, Text, View } from "react-native";
import { useStore } from "../store";
import { fonts, useTheme } from "../theme";
import { Button, Card, Eyebrow, H1, H2, P, Screen, formatDate, getDubaiToday, shareOnWhatsApp } from "../ui";

export function EventDetailScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const { events, rsvps, member, rsvp, cancelRsvp } = useStore();
  const ev = events.find((e) => e.id === params.id);
  if (!ev) return <Screen><P>Event not found.</P></Screen>;
  const state = rsvps[ev.id] ?? "none";
  const spots = Math.max(ev.capacity - ev.confirmed, 0);
  const ended = ev.status === "closed" || (ev.endDate || ev.date) < getDubaiToday();

  const submitRsvp = (deliverablesAgreed = false) => {
    void rsvp(ev.id, deliverablesAgreed).then((s) => Alert.alert(s === "pending" ? "Request submitted" : s === "accepted" || s === "going" ? "You're on the list" : "Added to waitlist", s === "pending" ? "The team will review your RSVP request." : s === "accepted" || s === "going" ? "Your RSVP has been accepted." : "We'll let you know if a spot opens."))
      .catch((error) => Alert.alert("RSVP failed", error instanceof Error ? error.message : "Please try again."));
  };
  const onRsvp = () => {
    if (!member) return nav.navigate("SignIn");
    if (member.track === "Creators" && ev.influencerDeliverables?.trim()) {
      return Alert.alert("Creator deliverables", ev.influencerDeliverables, [
        { text: "Not now", style: "cancel" },
        { text: "I agree", onPress: () => submitRsvp(true) },
      ]);
    }
    submitRsvp();
  };

  return (
    <Screen>
      <Image source={ev.image} style={{ width: "100%", height: 260, borderRadius: 22, marginBottom: 16 }} />
      <Eyebrow>{ev.category} · {ev.brand}</Eyebrow>
      <H1>{ev.title}</H1>
      <P>{formatDate(ev.date)} · {ev.time}{"\n"}{ev.venue}, {ev.area}</P>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
        <Card style={{ flex: 1 }}><Text style={{ fontFamily: fonts.display, fontSize: 30, color: t.text }}>{spots}</Text><P>spots left</P></Card>
        <Card style={{ flex: 1 }}><Text style={{ fontFamily: fonts.display, fontSize: 22, color: t.text }}>{ev.dressCode}</Text><P>dress code</P></Card>
      </View>

      <View style={{ gap: 10, marginTop: 18 }}>
        {ended ? <Button title="Event ended" disabled /> : member && !ev.tracks.some((track) => track === member.track) ? <Button title="Not on your list" disabled /> : state === "none" || state === "declined" ? (
          <Button title={spots > 0 ? "RSVP now" : "Join waitlist"} icon="checkmark-circle-outline" onPress={onRsvp} />
        ) : (
          <Button title={state === "pending" ? "Request pending · Cancel" : state === "accepted" || state === "going" ? "Cancel RSVP" : "Leave waitlist"} variant="outline" onPress={() => void cancelRsvp(ev.id).catch((error) => Alert.alert("Could not update RSVP", error instanceof Error ? error.message : "Please try again."))} />
        )}
        <Button title="Share on WhatsApp" variant="outline" icon="logo-whatsapp" onPress={() => shareOnWhatsApp(ev)} />
      </View>

      <H2>About</H2>
      <P>{ev.about}</P>
      <H2>What's included</H2>
      {ev.included.map((i) => <P key={i}>•  {i}</P>)}
      <H2>Who's invited</H2>
      <P>{ev.whoIsInvited}</P>
      <H2>Host note</H2>
      <P>{ev.hostNote}</P>
    </Screen>
  );
}
