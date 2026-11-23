import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import { FAQ } from "../content";
import { fonts, useTheme } from "../theme";
import { Button, Card, H1, P, Screen } from "../ui";

export function InfoScreen({ page }: { page: "faq" | "contact" }) {
  const t = useTheme();
  const [open, setOpen] = useState<number | null>(0);

  if (page === "faq") {
    return (
      <Screen>
        <H1>A few good questions.</H1>
        {FAQ.map(([q, a], i) => (
          <Card key={q} style={{ marginTop: 10 }}>
            <Pressable onPress={() => setOpen(open === i ? null : i)} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 16, color: t.text, flex: 1 }}>{q}</Text>
              <Ionicons name={open === i ? "remove" : "add"} size={22} color={t.primary} />
            </Pressable>
            {open === i ? <P style={{ marginTop: 8 }}>{a}</P> : null}
          </Card>
        ))}
      </Screen>
    );
  }

  return (
    <Screen>
      <H1>Find us. Talk to us.</H1>
      <P>RSVP DXB · A Tickbox UAE company. 303 Diplomat One Building, AWR Properties, 9th Street, Umm Hurair 1, Dubai, UAE.</P>
      <Button title="Open address in Maps" icon="map-outline" style={{ marginTop: 16 }} onPress={() => Linking.openURL("https://maps.google.com/?q=Diplomat+One+Building+Umm+Hurair+1+Dubai").catch(() => Alert.alert("Could not open Maps", "Search for Diplomat One Building, Umm Hurair 1, Dubai."))} />
      <P style={{ marginTop: 18 }}>For event, ticket, and partnership enquiries, use the customer site contact page.</P>
      <Button title="Open customer site contact page" icon="open-outline" style={{ marginTop: 16 }} onPress={() => Linking.openURL("https://www.rsvpdxb.com/contact").catch(() => Alert.alert("Could not open contact page", "Please visit www.rsvpdxb.com/contact."))} />
      <View style={{ height: 40 }} />
    </Screen>
  );
}
