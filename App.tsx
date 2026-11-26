import { Barlow_400Regular, Barlow_600SemiBold } from "@expo-google-fonts/barlow";
import { BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ArtistsScreen } from "./src/screens/ArtistsScreen";
import { AuthScreens } from "./src/screens/AuthScreens";
import { EventDetailScreen } from "./src/screens/EventDetailScreen";
import { EventsScreen } from "./src/screens/EventsScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { InfoScreen } from "./src/screens/InfoScreen";
import { MeScreen } from "./src/screens/MeScreen";
import { MoreScreen } from "./src/screens/MoreScreen";
import { OffersScreen } from "./src/screens/OffersScreen";
import { TopPicksScreen } from "./src/screens/TopPicksScreen";
import { TicketAvailabilityScreen } from "./src/screens/TicketAvailabilityScreen";
import { VenueDetailScreen, VenueDirectoryScreen } from "./src/screens/VenueScreen";
import { StoreProvider, useStore } from "./src/store";
import { fonts, useTheme } from "./src/theme";

export type RootStack = {
  Tabs: undefined;
  Event: { id: string };
  Artists: undefined;
  SignIn: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  FAQ: undefined;
  Contact: undefined;
  TicketAvailability: undefined;
  VenueGuide: undefined;
  TopPicks: undefined;
  Venue: { slug: string };
};

const Stack = createNativeStackNavigator<RootStack>();
const Tab = createBottomTabNavigator();

function Tabs() {
  const t = useTheme();
  const icons: Record<string, [any, any]> = {
    Home: ["home", "home-outline"],
    Events: ["calendar", "calendar-outline"],
    Offers: ["ticket", "ticket-outline"],
    Account: ["person-circle", "person-circle-outline"],
    More: ["ellipsis-horizontal-circle", "ellipsis-horizontal-circle-outline"],
  };
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: t.deep },
        headerTintColor: "#F2DFC3",
        headerTitleStyle: { fontFamily: fonts.display, fontSize: 26 },
        tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.border, height: 64, paddingBottom: 8 },
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.muted,
        tabBarLabelStyle: { fontFamily: fonts.bodyBold },
        tabBarIcon: ({ focused, color, size }) => <Ionicons name={icons[route.name][focused ? 0 : 1]} color={color} size={size} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Events" component={EventsScreen} />
      <Tab.Screen name="Offers" component={OffersScreen} options={{ title: "Tickets & Offers" }} />
      <Tab.Screen name="Account" component={MeScreen} options={{ title: "My account" }} />
      <Tab.Screen name="More" component={MoreScreen} options={{ title: "Explore more" }} />
    </Tab.Navigator>
  );
}

function Root() {
  const t = useTheme();
  const scheme = useColorScheme();
  const { ready } = useStore();
  if (!ready) return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: t.bg }}><ActivityIndicator color={t.primary} /></View>;
  const base = scheme === "dark" ? DarkTheme : DefaultTheme;
  return (
    <NavigationContainer theme={{ ...base, colors: { ...base.colors, background: t.bg, card: t.deep, text: "#F2DFC3", primary: t.primary, border: t.border } }}>
      <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: t.deep }, headerTintColor: "#F2DFC3", headerTitleStyle: { fontFamily: fonts.display, fontSize: 24 } as any }}>
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
        <Stack.Screen name="Event" component={EventDetailScreen} options={{ title: "Event" }} />
        <Stack.Screen name="TicketAvailability" component={TicketAvailabilityScreen} options={{ title: "Available tickets" }} />
        <Stack.Screen name="VenueGuide" component={VenueDirectoryScreen} options={{ title: "Venue Top Picks" }} />
        <Stack.Screen name="TopPicks" component={TopPicksScreen} options={{ title: "RSVP Top Picks" }} />
        <Stack.Screen name="Venue" component={VenueDetailScreen} options={{ title: "Venue" }} />
        <Stack.Screen name="Artists" component={ArtistsScreen} options={{ title: "Artists & Influencers" }} />
        <Stack.Screen name="SignIn" component={AuthScreens.SignIn} options={{ title: "Member sign in" }} />
        <Stack.Screen name="Register" component={AuthScreens.Register} options={{ title: "Join RSVP DXB" }} />
        <Stack.Screen name="ForgotPassword" component={AuthScreens.Forgot} options={{ title: "Forgot password" }} />
        <Stack.Screen name="ResetPassword" component={AuthScreens.Reset} options={{ title: "Reset password" }} />
        <Stack.Screen name="FAQ" options={{ title: "FAQ" }}>{() => <InfoScreen page="faq" />}</Stack.Screen>
        <Stack.Screen name="Contact" options={{ title: "Find us · Talk to us" }}>{() => <InfoScreen page="contact" />}</Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [loaded] = useFonts({ BebasNeue_400Regular, Barlow_400Regular, Barlow_600SemiBold });
  if (!loaded) return <View style={{ flex: 1, backgroundColor: "#4B2A10" }} />;
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="light" />
        <Root />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

