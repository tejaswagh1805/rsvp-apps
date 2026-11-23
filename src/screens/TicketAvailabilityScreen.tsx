import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import { EventItem } from "../data";
import { useStore } from "../store";
import { fonts, useTheme } from "../theme";
import { Button, Card, Eyebrow, EventImage, formatDate, getAvailableEvents, H1, P, Screen } from "../ui";

export function TicketAvailabilityScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const { events } = useStore();
  const available = getAvailableEvents(events);
  const [selected, setSelected] = useState<EventItem | null>(null);

  return (
    <Screen>
      {selected ? (
        <>
          <Pressable onPress={() => setSelected(null)} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 18 }}>
            <Ionicons name="arrow-back" size={20} color={t.primary} />
            <Text style={{ color: t.primary, fontFamily: fonts.bodyBold }}>All available events</Text>
          </Pressable>
          <Eyebrow>{selected.category} · {selected.brand}</Eyebrow>
          <H1>{selected.title}</H1>
          <P>{formatDate(selected.date)} · {selected.time}{"\n"}{selected.venue}, {selected.area}</P>
          <Card style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons name="ticket" size={22} color={t.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.bodyBold, color: t.text }}>Event places remaining: {Math.max(selected.capacity - selected.confirmed, 0)}</Text>
              <Text style={{ fontFamily: fonts.body, color: t.muted, marginTop: 3 }}>{typeof selected.ticketPrice === "number" && selected.ticketPrice > 0 ? `Listed ticket price: ${selected.ticketCurrency || "AED"} ${selected.ticketPrice}.` : "Ask the event team to confirm current ticket availability and price."}</Text>
            </View>
          </Card>
          {selected.ticketUrl ? <Button title={selected.actionLabel || "Get tickets"} icon="open-outline" style={{ marginTop: 16 }} onPress={() => void Linking.openURL(selected.ticketUrl!).catch(() => Alert.alert("Could not open ticket link", "Please try again later."))} /> : null}
          {selected.reservationPhone ? <Button title="Call about tickets" icon="call-outline" variant={selected.ticketUrl ? "outline" : "solid"} style={{ marginTop: 12 }} onPress={() => void Linking.openURL(`tel:${selected.reservationPhone}`).catch(() => Alert.alert("Could not start a call", "Please try again later."))} /> : null}
          {!selected.ticketUrl && !selected.reservationPhone ? <Button title="Open RSVP DXB contact page" icon="open-outline" variant="outline" style={{ marginTop: 12 }} onPress={() => void Linking.openURL("https://www.rsvpdxb.com/contact").catch(() => Alert.alert("Could not open contact page", "Please visit www.rsvpdxb.com/contact."))} /> : null}
        </>
      ) : (
        <>
          <Eyebrow>Tickets</Eyebrow>
          <H1>Available events</H1>
          <P>Upcoming published events with remaining places. Select an event for its ticket link or ask the team for current availability.</P>
          {available.length ? available.map((ev) => (
            <Pressable key={ev.id} onPress={() => setSelected(ev)} accessibilityRole="button" style={{ marginTop: 14 }}>
              <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <EventImage event={ev} style={{ width: 82, height: 96, borderRadius: 14 }} />
                <View style={{ flex: 1 }}>
                  <Eyebrow>{ev.category} · {ev.brand}</Eyebrow>
                  <Text style={{ fontFamily: fonts.display, fontSize: 22, color: t.text, marginTop: 4 }}>{ev.title}</Text>
                  <Text style={{ fontFamily: fonts.body, color: t.muted, marginTop: 4 }}>{formatDate(ev.date)} · {ev.time}</Text>
                  <Text style={{ fontFamily: fonts.bodyBold, color: t.primary, marginTop: 4 }}>{ev.capacity - ev.confirmed} event places remaining</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={t.primary} />
              </Card>
            </Pressable>
          )) : <Card style={{ marginTop: 18 }}><Text style={{ fontFamily: fonts.bodyBold, color: t.text }}>No upcoming events currently show remaining places.</Text><P style={{ marginTop: 6 }}>Please check back later or contact the RSVP DXB team.</P></Card>}
        </>
      )}
    </Screen>
  );
}
