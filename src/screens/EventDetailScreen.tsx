import { useNavigation, useRoute } from "@react-navigation/native";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useState } from "react";
import { Alert, Linking, ScrollView, Share, Text, View } from "react-native";
import { useStore } from "../store";
import { fonts, useTheme } from "../theme";
import { Button, Card, Eyebrow, EventImage, Field, H1, H2, P, Screen, formatDate, getDubaiToday } from "../ui";

function EventVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri);
  return <VideoView player={player} style={{ width: "100%", height: 230, borderRadius: 18, marginTop: 12 }} contentFit="contain" nativeControls />;
}

export function EventDetailScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const { params } = useRoute<any>();
  const { events, rsvps, member, rsvp, cancelRsvp, refreshEvents, savedEvents, toggleSavedEvent } = useStore();
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [guestName, setGuestName] = useState("");
  const [retryLookup, setRetryLookup] = useState(0);
  const [lookupState, setLookupState] = useState<"loading" | "loaded" | "error">("loading");
  const event = events.find((item) => item.id === params.id);

  useEffect(() => {
    let active = true;
    if (event) {
      setLookupState("loaded");
      return () => { active = false; };
    }
    setLookupState("loading");
    void refreshEvents()
      .then(() => { if (active) setLookupState("loaded"); })
      .catch(() => { if (active) setLookupState("error"); });
    return () => { active = false; };
  }, [params.id, refreshEvents, retryLookup]);

  if (!event) return (
    <Screen>
      <H1>{lookupState === "loading" ? "Loading event" : lookupState === "error" ? "Could not load event" : "Event not found"}</H1>
      <P>{lookupState === "loading" ? "Getting the latest event details…" : lookupState === "error" ? "Check your connection and try again." : "This event may no longer be published or available."}</P>
      {lookupState !== "loading" ? <Button title="Try again" style={{ marginTop: 18 }} onPress={() => setRetryLookup((value) => value + 1)} /> : null}
    </Screen>
  );

  const state = rsvps[event.id] ?? "none";
  const spotsLeft = Math.max(event.capacity - event.confirmed, 0);
  const limitedSpots = event.capacity > 0 && event.confirmed / event.capacity >= 0.8;
  const past = event.status === "closed" || (event.endDate || event.date) < getDubaiToday();
  const eligible = event.tracks.length === 0 || Boolean(member && event.tracks.includes(member.track as any));
  const creatorDeliverables = member?.track === "Creators" ? event.influencerDeliverables?.trim() ?? "" : "";

  const submitRsvp = (deliverablesAgreed = false) => {
    void rsvp(event.id, deliverablesAgreed, guestNames)
      .then((status) => Alert.alert(
        status === "pending" ? "Request submitted" : status === "accepted" || status === "going" ? "You're on the list" : "Request updated",
        status === "pending" ? "The team will review your RSVP request." : status === "accepted" || status === "going" ? "Your RSVP has been accepted." : "Your RSVP status has been updated.",
      ))
      .catch((error) => Alert.alert("RSVP failed", error instanceof Error ? error.message : "Please try again."));
  };

  const onRsvp = () => {
    if (!member) return nav.navigate("SignIn");
    if (creatorDeliverables) {
      return Alert.alert("Creator deliverables", creatorDeliverables, [
        { text: "Not now", style: "cancel" },
        { text: "I agree", onPress: () => submitRsvp(true) },
      ]);
    }
    submitRsvp();
  };

  const shareEvent = () => {
    const url = new URL(`https://www.rsvpdxb.com/events/${encodeURIComponent(event.id)}`);
    if (member?.memberId) url.searchParams.set("ref", member.memberId);
    void Share.share({ message: `Join me at ${event.title} · ${formatDate(event.date)}${event.venue ? ` at ${event.venue}` : ""}. ${url.toString()}` });
  };

  const requestButton = () => {
    if (past) return <Button title="Event ended" disabled />;
    if (member && !eligible) return <Button title="Not on your list" disabled />;
    if (state === "none" || state === "declined") return <Button title={state === "declined" ? "Request again" : "Request RSVP"} icon="checkmark-circle-outline" onPress={onRsvp} />;
    return <Button title={state === "pending" ? "Request pending · Cancel" : state === "accepted" || state === "going" ? "Cancel RSVP" : "Leave waitlist"} variant="outline" onPress={() => void cancelRsvp(event.id).catch((error) => Alert.alert("Could not update RSVP", error instanceof Error ? error.message : "Please try again."))} />;
  };

  return (
    <Screen>
      <EventImage event={event} style={{ width: "100%", height: 260, borderRadius: 22, marginBottom: 16 }} />
      {event.brand ? <Eyebrow>{event.brand}</Eyebrow> : <Eyebrow>RSVP DXB · THE GUEST LIST</Eyebrow>}
      <H1>{event.title}</H1>
      <P>{formatDate(event.date)}{event.endDate && event.endDate !== event.date ? ` – ${formatDate(event.endDate)}` : ""}{event.time ? ` · ${event.time}${event.endTime ? `–${event.endTime}` : ""}` : ""}{event.venue ? `\n${event.venue}` : ""}{event.area ? `, ${event.area}` : ""}</P>
      {event.category ? <Text style={{ alignSelf: "flex-start", overflow: "hidden", borderRadius: 999, backgroundColor: t.primary, color: t.primaryText, paddingHorizontal: 12, paddingVertical: 6, marginTop: 10, fontFamily: fonts.bodyBold }}>{event.category}</Text> : null}
      {past ? <Text style={{ alignSelf: "flex-start", overflow: "hidden", borderRadius: 999, backgroundColor: t.border, color: t.text, paddingHorizontal: 12, paddingVertical: 6, marginTop: 8, fontFamily: fonts.bodyBold }}>Past event</Text> : null}
      {event.gatesOpenTime ? <P style={{ marginTop: 8 }}>Gates open {event.gatesOpenTime}</P> : null}
      {event.applicationDeadline ? <P style={{ marginTop: 4 }}>Nominations close {formatDate(event.applicationDeadline)}</P> : null}
      {event.ageRestriction ? <P style={{ marginTop: 4 }}>Age restriction: {event.ageRestriction}</P> : null}
      {event.hashtag ? <P style={{ marginTop: 4 }}>{event.hashtag}</P> : null}

      {!past ? <Card style={{ marginTop: 16 }}>
        <Eyebrow>YOUR NIGHT OUT</Eyebrow>
        <H2 style={{ marginTop: 6 }}>{event.tracks.length ? "Request your place" : "Make it a night to remember"}</H2>
        <P>Send your RSVP request and our team will review it and confirm the details.</P>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 }}>
          <Text style={{ fontFamily: fonts.bodyBold, color: t.primary }}>{event.category}</Text>
          {event.capacity > 0 ? <Text style={{ fontFamily: fonts.body, color: t.muted, fontSize: 12 }}>{limitedSpots ? "Limited spots · " : ""}{spotsLeft} of {event.capacity} places available</Text> : null}
        </View>
        {event.capacity > 0 ? <View style={{ height: 6, backgroundColor: t.border, borderRadius: 9, overflow: "hidden", marginTop: 10 }}><View style={{ height: 6, width: `${Math.min((event.confirmed / event.capacity) * 100, 100)}%`, backgroundColor: t.primary }} /></View> : null}
        {event.tracks.length ? <P style={{ marginTop: 12 }}>Open to {event.tracks.join(", ")}</P> : <P style={{ marginTop: 12 }}>Open to all approved member tracks.</P>}
        {member && state === "none" || member && state === "declined" ? <View style={{ marginTop: 12 }}>
          <P>Add up to two guests (optional)</P>
          {guestNames.map((name, index) => <View key={`${index}-${name}`} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}><P>{name}</P><Button title="Remove" variant="outline" onPress={() => setGuestNames((items) => items.filter((_, i) => i !== index))} /></View>)}
          {guestNames.length < 2 ? <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 8 }}>
            <View style={{ flex: 1 }}><Field label={`Guest ${guestNames.length + 1} full name`} value={guestName} onChangeText={setGuestName} /></View>
            <Button title="Add" variant="outline" onPress={() => {
              const clean = guestName.trim();
              if (clean.length < 2) return Alert.alert("Add a full name", "Enter at least two characters for your guest's name.");
              setGuestNames((items) => [...items, clean]); setGuestName("");
            }} />
          </View> : null}
        </View> : null}
        <View style={{ marginTop: 14 }}>{requestButton()}</View>
        {state === "pending" ? <P style={{ textAlign: "center", fontSize: 12, marginTop: 8 }}>Your place is not confirmed until the RSVP DXB team reviews your request.</P> : null}
        {state === "accepted" ? <P style={{ textAlign: "center", fontSize: 12, marginTop: 8 }}>Your RSVP has been accepted. Please check your email for event entry details.</P> : null}
      </Card> : <Card style={{ marginTop: 16 }}>
        <Eyebrow>EVENT RECAP</Eyebrow><H2 style={{ marginTop: 6 }}>Part of the story</H2>
        <P>This event has taken place. Explore the highlights and see the photos once they are added.</P>
        <P style={{ marginTop: 12 }}>Event date · {formatDate(event.date)}{event.endDate && event.endDate !== event.date ? ` – ${formatDate(event.endDate)}` : ""}</P>
        {event.brand ? <P>Presented by · {event.brand}</P> : null}
      </Card>}

      <View style={{ gap: 10, marginTop: 12 }}>
        <Button title="Share event" variant="outline" icon="share-outline" onPress={shareEvent} />
        {!past && event.date ? <Button title="Add to calendar" variant="outline" icon="calendar-outline" onPress={() => void Linking.openURL(googleCalendarUrl(event)).catch(() => Alert.alert("Could not open calendar", "Please try again later."))} /> : null}
        <Button title={savedEvents.includes(event.id) ? "Saved" : "Save event"} variant="outline" icon="bookmark-outline" onPress={() => toggleSavedEvent(event.id)} />
      </View>

      {event.about ? <><H2>About this event</H2><P>{event.about}</P></> : null}
      {event.included.length ? <>
        <H2>{past ? "Event highlights" : "What's included"}</H2>
        {event.included.map((item) => <P key={item}>•  {item}</P>)}
      </> : null}
      {event.dressCode ? <><H2>Dress code</H2><P>{event.dressCode}</P></> : null}
      {event.whoIsInvited ? <><H2>Who's invited</H2><P>{event.whoIsInvited}</P></> : null}
      {event.creatorPassNote ? <><H2>Creator passes / nominations</H2><P>{event.creatorPassNote}</P></> : null}
      {event.reservationPhone ? <><H2>Reservations</H2><P>{event.reservationPhone}</P></> : null}
      {event.hashtag ? <><H2>Event hashtag</H2><P>{event.hashtag}</P></> : null}
      {event.venue || event.mapUrl ? <>
        <H2>Location</H2><P>{event.venue}{event.area ? `, ${event.area}` : ""}</P>
        {event.mapUrl ? <Button title="Open map and directions" variant="outline" icon="map-outline" style={{ marginTop: 10 }} onPress={() => void Linking.openURL(event.mapUrl!).catch(() => Alert.alert("Could not open map", "Please check the event location."))} /> : null}
      </> : null}
      {event.images?.length ? <>
        <H2>Photos</H2>
        <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {event.images.map((image, index) => <EventImage key={`${event.id}-photo-${index}`} event={{ ...event, image: { uri: image } }} style={{ width: 190, height: 150, borderRadius: 16 }} />)}
        </ScrollView>
      </> : null}
      {event.videos?.length ? <><H2>Event video</H2>{event.videos.map((video, index) => <EventVideo key={`${event.id}-video-${index}`} uri={video} />)}</> : null}
      {event.hostNote ? <><H2>{past ? "Our role" : "Host note"}</H2><P>{event.hostNote}</P></> : null}
      {event.influencerDeliverables ? <><H2>Creator deliverables</H2><P>{event.influencerDeliverables}</P></> : null}
      {typeof event.ticketPrice === "number" && event.ticketPrice > 0 ? <><H2>Ticket price</H2><P>{event.ticketCurrency || "AED"} {event.ticketPrice}</P></> : null}
      {event.ticketUrl ? <Button title={event.actionLabel || "Get tickets"} icon="open-outline" style={{ marginTop: 14 }} onPress={() => void Linking.openURL(event.ticketUrl!).catch(() => Alert.alert("Could not open link", "Please try again later."))} /> : null}
      {event.reservationPhone ? <Button title="Call to reserve" variant="outline" icon="call-outline" style={{ marginTop: 10 }} onPress={() => void Linking.openURL(`tel:${internationalPhoneHref(event.reservationPhone!)}`).catch(() => Alert.alert("Could not start a call", "Please try again later."))} /> : null}
      {event.creatorPassFormUrl ? <Button title="Request a creator pass" variant="outline" style={{ marginTop: 10 }} onPress={() => void Linking.openURL(event.creatorPassFormUrl!).catch(() => Alert.alert("Could not open form", "Please try again later."))} /> : null}
    </Screen>
  );
}

function internationalPhoneHref(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (phone.trim().startsWith("+")) return `+${digits}`;
  if (digits.startsWith("971")) return `+${digits}`;
  digits = digits.replace(/^0/, "");
  return `+971${digits}`;
}

function googleCalendarUrl(event: { title: string; date: string; endDate?: string; time?: string; endTime?: string; venue?: string; area?: string; about?: string }) {
  const calendarTime = (value: string | undefined) => {
    const match = (value || "").trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
    if (!match) return "";
    let hour = Number(match[1]);
    const minute = Number(match[2] || 0);
    if (match[3]) hour = (hour % 12) + (match[3].toUpperCase() === "PM" ? 12 : 0);
    if (hour > 23 || minute > 59) return "";
    return `${String(hour).padStart(2, "0")}${String(minute).padStart(2, "0")}`;
  };
  const start = calendarTime(event.time);
  const end = calendarTime(event.endTime) || start;
  const date = (value: string) => value.replace(/-/g, "");
  let dates: string;
  if (start && end) dates = `${date(event.date)}T${start}00/${date(event.endDate || event.date)}T${end}00`;
  else {
    const endDay = new Date(`${event.endDate || event.date}T12:00:00Z`);
    endDay.setUTCDate(endDay.getUTCDate() + 1);
    dates = `${date(event.date)}/${date(endDay.toISOString().slice(0, 10))}`;
  }
  const location = [event.venue, event.area].filter(Boolean).join(", ");
  const query = new URLSearchParams({ action: "TEMPLATE", text: event.title, dates, ...(start && end ? { ctz: "Asia/Dubai" } : {}), details: event.about || "RSVP DXB event", location });
  return `https://calendar.google.com/calendar/render?${query.toString()}`;
}
