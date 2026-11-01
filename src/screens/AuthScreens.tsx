import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import { TRACKS } from "../data";
import { useStore } from "../store";
import { fonts, useTheme } from "../theme";
import { Button, Field, H1, P, PasswordField, Screen } from "../ui";

function Link({ title, onPress }: { title: string; onPress: () => void }) {
  const t = useTheme();
  return <Pressable onPress={onPress} style={{ paddingVertical: 10 }}><Text style={{ fontFamily: fonts.bodyBold, color: t.primary, textAlign: "center" }}>{title}</Text></Pressable>;
}

function SignIn() {
  const nav = useNavigation<any>();
  const { signIn } = useStore();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  return (
    <Screen>
      <Image source={require("../../assets/logo.png")} style={{ width: 160, height: 70, alignSelf: "center", marginBottom: 12 }} resizeMode="contain" />
      <H1>Welcome back.</H1>
      <P style={{ marginBottom: 18 }}>Sign in with your approved RSVP DXB member account.</P>
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
      <PasswordField label="Password" value={pw} onChangeText={setPw} placeholder="Your password" />
      <Link title="Forgot password?" onPress={() => nav.navigate("ForgotPassword")} />
      <Button title="Sign in" onPress={async () => {
        if (!email.includes("@") || pw.length < 1) return Alert.alert("Check your details", "Enter a valid email and password.");
        try { await signIn(email, pw); nav.navigate("Tabs", { screen: "Account" }); }
        catch (error) { Alert.alert("Sign in failed", error instanceof Error ? error.message : "Please try again."); }
      }} />
      <Link title="New here? Join RSVP DXB" onPress={() => nav.navigate("Register")} />
    </Screen>
  );
}

function Register() {
  const t = useTheme();
  const nav = useNavigation<any>();
  const { register } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [track, setTrack] = useState(TRACKS[1].name as string);
  return (
    <Screen>
      <H1>Get on the list.</H1>
      <Field label="Full name" value={name} onChangeText={setName} placeholder="Your name" />
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
      <PasswordField label="Password" value={pw} onChangeText={setPw} placeholder="At least 12 characters" />
      <Text style={{ fontFamily: fonts.bodyBold, color: t.text, marginBottom: 8 }}>Your track</Text>
      <View style={{ gap: 8, marginBottom: 18 }}>
        {TRACKS.map((tr) => (
          <Pressable key={tr.name} onPress={() => setTrack(tr.name)} style={{ padding: 14, borderRadius: 16, borderWidth: 1.5, borderColor: track === tr.name ? t.primary : t.border, backgroundColor: t.surface }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 22, color: t.text }}>{tr.name}</Text>
            <P>{tr.blurb}</P>
          </Pressable>
        ))}
      </View>
      <Button title="Create account" onPress={async () => {
        if (!name || !email.includes("@") || pw.length < 12 || !/[A-Z]/.test(pw) || !/\d/.test(pw) || !/[^A-Za-z0-9\s]/.test(pw)) return Alert.alert("Check your details", "Enter your name and a valid email, and use a password with at least 12 characters, an uppercase letter, a number and a special character.");
        try { await register({ name, email, password: pw, track }); Alert.alert("Application submitted", "Your membership application is pending review. You can sign in after it is approved.", [{ text: "OK", onPress: () => nav.navigate("SignIn") }]); }
        catch (error) { Alert.alert("Application not submitted", error instanceof Error ? error.message : "Please try again."); }
      }} />
    </Screen>
  );
}

function Forgot() {
  const { requestPasswordReset } = useStore();
  const [email, setEmail] = useState("");
  return (
    <Screen>
      <H1>Forgot password?</H1>
      <P style={{ marginBottom: 18 }}>Enter your email to request a secure, one-time password reset link for your member account.</P>
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
      <Button title="Send reset link" onPress={async () => {
        if (!email.includes("@")) return Alert.alert("Check your email", "Enter a valid email address.");
        try {
          await requestPasswordReset(email.trim());
          Alert.alert("Check your inbox", "If an approved member account uses that email, reset instructions will arrive shortly. The link is valid for 30 minutes.");
        } catch (error) {
          Alert.alert("Could not request reset", error instanceof Error ? error.message : "Please try again.");
        }
      }} />
    </Screen>
  );
}

function Reset() {
  const nav = useNavigation<any>();
  return (
    <Screen>
      <H1>Check your email.</H1>
      <P style={{ marginBottom: 18 }}>Open the secure reset link from RSVP DXB to choose your new password. The link expires after 30 minutes.</P>
      <Button title="Back to sign in" variant="outline" onPress={() => nav.navigate("SignIn")} />
    </Screen>
  );
}

export const AuthScreens = { SignIn, Register, Forgot, Reset };
