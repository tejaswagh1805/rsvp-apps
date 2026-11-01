import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, Linking, Pressable, Text, View } from "react-native";
import { FAQ, WHATSAPP_NUMBER } from "../content";
import { fonts, useTheme } from "../theme";
import { Button, Card, Field, H1, P, Screen } from "../ui";

export function InfoScreen({ page }: { page: "faq" | "contact" }) {
  const t = useTheme();
  const [open, setOpen] = useState<number | null>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

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
      <Button title="Chat on WhatsApp" icon="logo-whatsapp" style={{ marginVertical: 18 }}
        onPress={() => Linking.openURL(WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}` : "https://wa.me/")} />
      <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" />
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
      <Field label="Message" value={msg} onChangeText={setMsg} placeholder="How can we help?" multiline />
      <Button title="Send message" onPress={async () => {
        if (!name || !email.includes("@") || !msg) return Alert.alert("Almost there", "Please fill in your name, a valid email and a message.");
        const body = encodeURIComponent(`Hello RSVP DXB,\n\n${msg}\n\nName: ${name}\nEmail: ${email}`);
        const url = WHATSAPP_NUMBER ? `https://wa.me/${WHATSAPP_NUMBER}?text=${body}` : `https://wa.me/?text=${body}`;
        try {
          await Linking.openURL(url);
          Alert.alert("WhatsApp opened", "Review and send your message in WhatsApp.");
        } catch {
          Alert.alert("Could not open WhatsApp", "Please try again or use the Chat on WhatsApp button above.");
        }
      }} />
      <View style={{ height: 40 }} />
    </Screen>
  );
}
