import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, ScrollView, Text, View } from "react-native";
import { OFFERS } from "../content";
import { useStore } from "../store";
import { fonts, useTheme } from "../theme";
import { Card, EventTile, H1, P, Pulse, Screen } from "../ui";

export function OffersScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const { events } = useStore();
  const [tab, setTab] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const offer = OFFERS[tab];
  const list = events.filter((e) => e.status === "published" && (offer.category === "All" || e.category === offer.category));

  useEffect(() => {
    fade.setValue(0);
    Animated.spring(fade, { toValue: 1, useNativeDriver: true }).start();
  }, [tab]);

  return (
    <Screen>
      <Pressable onPress={() => nav.navigate("TicketAvailability")} accessibilityRole="button">
      <Pulse>
        <Card style={{ backgroundColor: t.deep, borderColor: t.primary, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Ionicons name="flash" size={26} color="#F2DFC3" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 26, color: "#FFF7EC" }}>Last minute ticket</Text>
            <Text style={{ fontFamily: fonts.body, color: "#F2DFC3" }}>Tonight's final spots — move fast.</Text>
          </View>
        </Card>
      </Pulse>
      </Pressable>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 18, marginHorizontal: -18 }} contentContainerStyle={{ paddingHorizontal: 18, gap: 8 }}>
        {OFFERS.map((o, i) => (
          <Pressable key={o.name} onPress={() => setTab(i)} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: t.primary, backgroundColor: tab === i ? t.primary : "transparent" }}>
            <Ionicons name={o.icon as any} size={16} color={tab === i ? t.primaryText : t.primary} />
            <Text style={{ fontFamily: fonts.bodyBold, color: tab === i ? t.primaryText : t.primary }}>{o.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <Animated.View style={{ opacity: fade, transform: [{ translateY: fade.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }}>
        <H1>{offer.title}</H1>
        <P>{offer.body}</P>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16, marginHorizontal: -18 }} contentContainerStyle={{ paddingHorizontal: 18 }}>
          {list.map((ev) => <EventTile key={ev.id} ev={ev} onPress={() => nav.navigate("Event", { id: ev.id })} />)}
        </ScrollView>
      </Animated.View>
    </Screen>
  );
}
