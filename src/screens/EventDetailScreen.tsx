import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import { Alert, Linking, Text, View } from "react-native";
import { useStore } from "../store";
import { fonts, useTheme } from "../theme";
import { Button, Card, Eyebrow, EventImage, Field, H1, H2, P, Screen, formatDate, getDubaiToday, shareEvent } from "../ui";

export function EventDetailScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const { events, rsvps, member, rsvp, cancelRsvp } = useStore();
  const [guestNames, setGuestNames] = React.useState<string[]>([]);
  const [guestName, setGuestName] = React.useState("");
  const ev = events.find((e) => e.id === params.id);
  if (!ev) return <Screen><P>Event not found.</P></Screen>;
  const state = rsvps[ev.id] ?? "none";
  const spots = Math.max(ev.capacity - ev.confirmed, 0);
  const ended = ev.status === "closed" || (ev.endDate || ev.date) < getDubaiToday();

  const submitRsvp = (deliverablesAgreed = false) => {
    void rsvp(ev.id, deliverablesAgreed, guestNames).then((s) => Alert.alert(s === "pending" ? "Request submitted" : s === "accepted" || s === "going" ? "You're on the list" : "Added to waitlist", s === "pending" ? "The team will review your RSVP request." : s === "accepted" || s === "going" ? "Your RSVP has been accepted." : "We'll let you know if a spot opens."))
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
      <EventImage event={ev} style={{ width: "100%", height: 260, borderRadius: 22, marginBottom: 16 }} />
      <Eyebrow>{ev.category} · {ev.brand}</Eyebrow>
      <H1>{ev.title}</H1>
      <P>{formatDate(ev.date)} · {ev.time}{"\n"}{ev.venue}, {ev.area}</P>
      {ev.endTime ? <P style={{ marginTop: 4 }}>Until {ev.endTime}{ev.gatesOpenTime ? ` · Doors ${ev.gatesOpenTime}` : ""}</P> : ev.gatesOpenTime ? <P style={{ marginTop: 4 }}>Doors {ev.gatesOpenTime}</P> : null}
      {ev.applicationDeadline ? <P style={{ marginTop: 4 }}>Applications close {formatDate(ev.applicationDeadline)}</P> : null}
      {ev.ageRestriction ? <P style={{ marginTop: 4 }}>Age restriction: {ev.ageRestriction}</P> : null}
      {ev.hashtag ? <P style={{ marginTop: 4 }}>{ev.hashtag}</P> : null}

      <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
        <Card style={{ flex: 1 }}><Text style={{ fontFamily: fonts.display, fontSize: 30, color: t.text }}>{spots}</Text><P>spots left</P></Card>
        <Card style={{ flex: 1 }}><Text style={{ fontFamily: fonts.display, fontSize: 22, color: t.text }}>{ev.dressCode}</Text><P>dress code</P></Card>
      </View>

      <View style={{ gap: 10, marginTop: 18 }}>
        {ended ? <Button title="Event ended" disabled /> : member && !ev.tracks.some((track) => track === member.track) ? <Button title="Not on your list" disabled /> : state === "none" || state === "declined" ? (
          <>
            {member ? <View style={{ marginTop: 4 }}>
              <P>Add up to two guest names (optional)</P>
              {guestNames.map((name, index) => <View key={`${name}-${index}`} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}><P>{name}</P><Button title="Remove" variant="outline" onPress={() => setGuestNames((items) => items.filter((_, i) => i !== index))} /></View>)}
              {guestNames.length < 2 ? <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
                <View style={{ flex: 1 }}><Field label="Guest full name" value={guestName} onChangeText={setGuestName} /></View>
                <Button title="Add" variant="outline" onPress={() => {
                  const clean = guestName.trim();
                  if (clean.length < 2) return Alert.alert("Add a full name", "Enter at least two characters for your guest's name.");
                  setGuestNames((items) => [...items, clean]); setGuestName("");
                }} />
              </View> : null}
            </View> : null}
            <Button title={spots > 0 ? "RSVP now" : "Join waitlist"} icon="checkmark-circle-outline" onPress={onRsvp} />
          </>
        ) : (
          <Button title={state === "pending" ? "Request pending · Cancel" : state === "accepted" || state === "going" ? "Cancel RSVP" : "Leave waitlist"} variant="outline" onPress={() => void cancelRsvp(ev.id).catch((error) => Alert.alert("Could not update RSVP", error instanceof Error ? error.message : "Please try again."))} />
        )}
        <Button title="Share event" variant="outline" icon="share-outline" onPress={() => shareEvent(ev)} />
      </View>

      <H2>About</H2>
      <P>{ev.about}</P>
      <H2>What's included</H2>
      {ev.included.map((i) => <P key={i}>•  {i}</P>)}
      <H2>Who's invited</H2>
      <P>{ev.whoIsInvited}</P>
      <H2>Host note</H2>
      <P>{ev.hostNote}</P>
      {ev.creatorPassNote ? <><H2>Creator pass</H2><P>{ev.creatorPassNote}</P></> : null}
      {ev.influencerDeliverables ? <><H2>Creator deliverables</H2><P>{ev.influencerDeliverables}</P></> : null}
      {typeof ev.ticketPrice === "number" && ev.ticketPrice > 0 ? <><H2>Ticket price</H2><P>{ev.ticketCurrency || "AED"} {ev.ticketPrice}</P></> : null}
      {ev.ticketUrl ? <Button title={ev.actionLabel || "Get tickets"} icon="open-outline" style={{ marginTop: 14 }} onPress={() => void Linking.openURL(ev.ticketUrl!).catch(() => Alert.alert("Could not open link", "Please try again later."))} /> : null}
      {ev.creatorPassFormUrl ? <Button title="Apply for a creator pass" variant="outline" style={{ marginTop: 10 }} onPress={() => void Linking.openURL(ev.creatorPassFormUrl!).catch(() => Alert.alert("Could not open form", "Please try again later."))} /> : null}
      {ev.mapUrl ? <Button title="Open event location" variant="outline" icon="map-outline" style={{ marginTop: 10 }} onPress={() => void Linking.openURL(ev.mapUrl!).catch(() => Alert.alert("Could not open map", "Please check the event location."))} /> : null}
    </Screen>
  );
}
