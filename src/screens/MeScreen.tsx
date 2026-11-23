import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import { RANKS } from "../data";
import { useStore } from "../store";
import { fonts, useTheme } from "../theme";
import { Button, Card, Field, H1, H2, P, PasswordField, Screen, formatDate } from "../ui";

type Tab = "overview" | "pass" | "profile";

export function MeScreen() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const { member, events, rsvps, signOut, updateMember, changePassword } = useStore();
  const [tab, setTab] = useState<Tab>("overview");
  const [name, setName] = useState(member?.name ?? "");
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [cf, setCf] = useState("");

  useEffect(() => {
    setName(member?.name ?? "");
    setPhone(member?.phone ?? "");
  }, [member?.memberId, member?.name, member?.phone]);

  if (!member) {
    return (
      <Screen>
        <Ionicons name="person-circle-outline" size={72} color={t.primary} style={{ alignSelf: "center", marginTop: 30 }} />
        <H1>You're signed out.</H1>
        <P style={{ marginBottom: 18 }}>Sign in to see your pass, RSVPs and profile.</P>
        <Button title="Sign in" onPress={() => nav.navigate("SignIn")} />
        <Button title="Register" variant="outline" style={{ marginTop: 10 }} onPress={() => nav.navigate("Register")} />
      </Screen>
    );
  }

  const going = events.filter((e) => ["going", "waitlist", "pending", "accepted", "waitlisted"].includes(rsvps[e.id] ?? "none"));
  const next = RANKS.find((r) => r.at > member.points);
  const progress = next ? member.points / next.at : 1;

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.6 });
    if (!res.canceled) {
      updateMember({ photo: res.assets[0].uri });
      Alert.alert("Saved", "Your profile picture was updated.");
    }
  };

  const Avatar = ({ size }: { size: number }) =>
    member.photo ? <Image source={{ uri: member.photo }} style={{ width: size, height: size, borderRadius: size / 2 }} /> : (
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: t.primary, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontFamily: fonts.display, fontSize: size * 0.42, color: t.primaryText }}>{member.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}</Text>
      </View>
    );

  return (
    <Screen>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
        <Avatar size={68} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 32, color: t.text }}>{member.name}</Text>
          <P>{member.track} · {member.rank} · {member.points} pts</P>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 8, marginVertical: 18 }}>
        {(["overview", "pass", "profile"] as Tab[]).map((k) => (
          <Pressable key={k} onPress={() => setTab(k)} style={{ flex: 1, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: t.primary, backgroundColor: tab === k ? t.primary : "transparent" }}>
            <Text style={{ textAlign: "center", fontFamily: fonts.bodyBold, color: tab === k ? t.primaryText : t.primary }}>{k === "pass" ? "My Pass" : k[0].toUpperCase() + k.slice(1)}</Text>
          </Pressable>
        ))}
      </View>

      {tab === "overview" ? (
        <>
          <Card>
            <P>Progress to {next?.name ?? "top rank"}</P>
            <View style={{ height: 10, borderRadius: 5, backgroundColor: t.border, marginTop: 8 }}>
              <View style={{ width: `${Math.min(progress, 1) * 100}%`, height: 10, borderRadius: 5, backgroundColor: t.primary }} />
            </View>
          </Card>
          <H2>My RSVPs</H2>
          {going.length === 0 ? <P>No RSVPs yet — explore Events.</P> : going.map((e) => (
            <Pressable key={e.id} onPress={() => nav.navigate("Event", { id: e.id })}>
              <Card style={{ marginBottom: 10 }}>
                <Text style={{ fontFamily: fonts.display, fontSize: 22, color: t.text }}>{e.title}</Text>
                <P>{formatDate(e.date)} · {({ going: "Going", accepted: "Accepted", pending: "Request pending", waitlist: "Waitlist", waitlisted: "Waitlisted" } as Record<string, string>)[rsvps[e.id] ?? ""] ?? "RSVP"}</P>
              </Card>
            </Pressable>
          ))}
        </>
      ) : null}

      {tab === "pass" ? (
        <Card style={{ alignItems: "center", backgroundColor: t.deep, borderColor: t.primary }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 30, color: "#FFF7EC" }}>RSVP DXB · MEMBERSHIP</Text>
          <Text style={{ fontFamily: fonts.body, color: "#C9A985", marginTop: 24, letterSpacing: 2 }}>MEMBER NUMBER</Text>
          <Text style={{ fontFamily: fonts.display, fontSize: 56, color: "#F2DFC3", marginTop: 8 }}>{member.memberNumber ? String(member.memberNumber).padStart(3, "0") : "—"}</Text>
          <Text style={{ fontFamily: fonts.bodyBold, color: "#F2DFC3", fontSize: 16, marginTop: 12 }}>{member.name} · {member.rank}</Text>
          <Text style={{ fontFamily: fonts.body, color: "#C9A985", marginTop: 8, textAlign: "center" }}>Use this number as your member reference. No QR scan required.</Text>
        </Card>
      ) : null}

      {tab === "profile" ? (
        <>
          <Card style={{ alignItems: "center", gap: 10 }}>
            <Avatar size={96} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button title="Change photo" icon="image-outline" onPress={pickPhoto} />
              {member.photo ? <Button title="Remove" variant="outline" onPress={() => updateMember({ photo: undefined })} /> : null}
            </View>
          </Card>
          <H2>Details</H2>
          <Field label="Full name" value={name} onChangeText={setName} />
          <Field label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <Button title="Save changes" onPress={async () => { try { await updateMember({ name, phone }); Alert.alert("Saved", "Your profile was updated."); } catch (error) { Alert.alert("Could not save", error instanceof Error ? error.message : "Please try again."); } }} />

          <H2>Update password</H2>
          <PasswordField label="Current password" value={cur} onChangeText={setCur} />
          <PasswordField label="New password" value={nw} onChangeText={setNw} placeholder="At least 8 characters" />
          <PasswordField label="Confirm new password" value={cf} onChangeText={setCf} />
          <Button title="Update password" onPress={async () => {
            if (!cur) return Alert.alert("Missing", "Enter your current password.");
            if (nw.length < 8 || !/[A-Z]/.test(nw) || !/\d/.test(nw) || !/[^A-Za-z0-9\s]/.test(nw)) return Alert.alert("Password requirements", "Use at least 8 characters, including an uppercase letter, a number and a special character.");
            if (nw !== cf) return Alert.alert("Passwords don't match", "Please confirm the same password.");
            try { await changePassword(cur, nw); }
            catch (error) { return Alert.alert("Could not update password", error instanceof Error ? error.message : "Please try again."); }
            setCur(""); setNw(""); setCf(""); setTab("overview");
            Alert.alert("Password updated", "Your password has been changed. Sign in again with your new password.");
          }} />
        </>
      ) : null}

      <Button title="Log out" variant="outline" icon="log-out-outline" style={{ marginTop: 28 }} onPress={() => {
        Alert.alert("Log out?", "You'll need to sign in again.", [
          { text: "Cancel", style: "cancel" },
          { text: "Log out", style: "destructive", onPress: () => { void signOut().finally(() => setTab("overview")); } },
        ]);
      }} />
    </Screen>
  );
}
