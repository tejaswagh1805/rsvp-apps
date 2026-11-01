import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { EventItem } from "../data";
import { useStore } from "../store";
import { fonts, useTheme } from "../theme";
import { Card, Eyebrow, formatDate, getAvailableEvents, H1, H2, P, requestCategoryOnWhatsApp, Screen, TICKET_CATEGORIES } from "../ui";

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
              <Text style={{ fontFamily: fonts.body, color: t.muted, marginTop: 3 }}>Demo event capacity. Ask the team to confirm live ticket inventory.</Text>
            </View>
          </Card>
          <H2>Choose a ticket category</H2>
          <P>Category-level inventory and pricing need confirmation by the event team.</P>
          <View style={{ gap: 10, marginTop: 14 }}>
            {TICKET_CATEGORIES.map((category) => (
              <Card key={category.name} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.display, fontSize: 25, color: t.text }}>{category.name}</Text>
                  <Text style={{ fontFamily: fonts.body, color: t.muted }}>Availability: confirm with team · Price: {category.price}</Text>
                </View>
                <Pressable onPress={() => requestCategoryOnWhatsApp(selected, category.name)} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "#25D366", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10 }}>
                  <Ionicons name="logo-whatsapp" size={17} color="#fff" />
                  <Text style={{ color: "#fff", fontFamily: fonts.bodyBold, fontSize: 12 }}>Request</Text>
                </Pressable>
              </Card>
            ))}
          </View>
          <P style={{ marginTop: 16 }}>WhatsApp opens a request for the event and category. The team must confirm availability, price and payment, then send the ticket PDF.</P>
        </>
      ) : (
        <>
          <Eyebrow>Tickets</Eyebrow>
          <H1>Available events</H1>
          <P>Upcoming published events with remaining demo places. Select an event to view ticket categories.</P>
          {available.length ? available.map((ev) => (
            <Pressable key={ev.id} onPress={() => setSelected(ev)} accessibilityRole="button" style={{ marginTop: 14 }}>
              <Card style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Image source={ev.image} style={{ width: 82, height: 96, borderRadius: 14 }} />
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
