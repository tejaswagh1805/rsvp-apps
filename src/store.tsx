import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { EVENTS, EventItem, RsvpState } from "./data";

const API_URL = (process.env.EXPO_PUBLIC_RSVP_API_URL || "https://d1f5sjkm09kt76.cloudfront.net").replace(/\/$/, "");
const KEY = "rsvp-dxb-state-v2";
let accessToken: string | null = null;

interface MemberProfile {
  name: string;
  email: string;
  phone: string;
  city?: string;
  handle?: string;
  followers?: number;
  track: string;
  rank: string;
  points: number;
  memberId: string;
  memberNumber?: number;
  photo?: string;
}

type ApiMember = { id: string; name: string; email: string; track: string; rank: string; points: number; city?: string; mobile?: string; handle?: string; followers?: number; memberNumber?: number; accessToken?: string };
type ApiEvent = Omit<EventItem, "image"> & { image?: string; imageGallery?: string[]; imageData?: string; video?: string };
export type PeopleProfile = {
  id: string;
  category: string;
  name: string;
  role?: string | null;
  subtitle?: string | null;
  bio?: string | null;
  imageUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
  xUrl?: string | null;
  displayOrder?: number;
};
export type Venue = {
  id: string;
  slug: string;
  category: string;
  name: string;
  tagline: string;
  description: string;
  location: string;
  highlights: string[];
  offer: string;
  featuredDate: string | null;
  imageUrl: string;
  websiteUrl: string;
  moreInfoUrl: string;
  displayOrder: number;
  featured: boolean;
  active?: boolean;
};

const EVENT_IMAGES: Record<string, any> = {
  "atlantis-chef-table": require("../assets/event-dining.jpg"),
  "jumeirah-spring-launch": require("../assets/event-fashion.jpg"),
  "dubai-hills-preview": require("../assets/event-property.jpg"),
  "marina-sunset-session": require("../assets/event-nightlife.jpg"),
  "difc-art-night": require("../assets/event-fashion.jpg"),
  "beach-club-opening": require("../assets/event-nightlife.jpg"),
};

function mapEvent(item: ApiEvent): EventItem {
  const remoteImage = item.imageGallery?.[0] || item.imageData || item.image;
  const image = remoteImage?.startsWith("http") || remoteImage?.startsWith("data:")
    ? { uri: remoteImage }
    : EVENT_IMAGES[item.id] ?? EVENT_IMAGES["atlantis-chef-table"];
  return { ...item, image } as EventItem;
}

async function api<T>(path: string, input?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: input === undefined ? "GET" : "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    ...(input === undefined ? {} : { body: JSON.stringify(input) }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.error || `Request failed (${response.status}).`);
  return body as T;
}

interface Store {
  ready: boolean;
  events: EventItem[];
  peopleProfiles: PeopleProfile[] | null;
  venues: Venue[] | null;
  member: MemberProfile | null;
  rsvps: Record<string, RsvpState>;
  signIn: (email: string, password: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  register: (input: { name: string; email: string; password: string; track: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateMember: (patch: Partial<MemberProfile>) => Promise<void>;
  rsvp: (eventId: string, deliverablesAgreed?: boolean) => Promise<RsvpState>;
  cancelRsvp: (eventId: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
  refreshPeopleProfiles: () => Promise<void>;
  refreshVenues: () => Promise<void>;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [member, setMember] = useState<MemberProfile | null>(null);
  const [events, setEvents] = useState<EventItem[]>(EVENTS);
  const [peopleProfiles, setPeopleProfiles] = useState<PeopleProfile[] | null>(null);
  const [venues, setVenues] = useState<Venue[] | null>(null);
  const [rsvps, setRsvps] = useState<Record<string, RsvpState>>({});

  const refreshEvents = useCallback(async () => {
    const items = await api<ApiEvent[]>("/api/mobile/events");
    setEvents(items.map(mapEvent));
  }, []);

  const refreshPeopleProfiles = useCallback(async () => {
    const items = await api<PeopleProfile[]>("/api/mobile/people-profiles");
    setPeopleProfiles(items);
  }, []);

  const refreshVenues = useCallback(async () => {
    const items = await api<Venue[]>("/api/mobile/venues");
    setVenues(items.filter((venue) => venue.active !== false));
  }, []);

  const refreshMemberData = async () => {
    const current = await api<ApiMember>("/api/mobile/session");
    let photo: string | undefined;
    try {
      const savedProfile = await AsyncStorage.getItem(`${KEY}-profile`);
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile) as { memberId?: unknown; photo?: unknown };
        if (parsed.memberId === current.id && typeof parsed.photo === "string") photo = parsed.photo;
      }
    } catch {
      // A damaged local profile cache should not prevent a member from signing in.
    }
    setMember({ name: current.name, email: current.email, phone: current.mobile ?? "", city: current.city, handle: current.handle, followers: current.followers, track: current.track, rank: current.rank, points: current.points, memberId: current.id, memberNumber: current.memberNumber, photo });
    setRsvps(await api<Record<string, RsvpState>>("/api/mobile/rsvps"));
  };

  useEffect(() => {
    let active = true;
    void Promise.all([AsyncStorage.getItem(`${KEY}-token`), refreshEvents().catch(() => undefined), refreshPeopleProfiles().catch(() => undefined), refreshVenues().catch(() => undefined)])
      .then(async ([token]) => {
        if (!active) return;
        accessToken = token;
        if (token) {
          try { await refreshMemberData(); }
          catch { accessToken = null; await AsyncStorage.removeItem(`${KEY}-token`); await AsyncStorage.removeItem(`${KEY}-profile`); }
        } else {
          await AsyncStorage.removeItem(`${KEY}-profile`);
        }
      })
      .catch(() => undefined)
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (ready && member) void AsyncStorage.setItem(`${KEY}-profile`, JSON.stringify(member));
    if (ready && !member) void AsyncStorage.removeItem(`${KEY}-profile`);
  }, [member, ready]);

  const value = useMemo<Store>(() => ({
    ready, events, peopleProfiles, venues, member, rsvps,
    signIn: async (email, password) => {
      const result = await api<ApiMember>("/api/mobile/sign-in", { email, password });
      if (!result.accessToken) throw new Error("The server did not return a mobile session.");
      accessToken = result.accessToken;
      await AsyncStorage.setItem(`${KEY}-token`, result.accessToken);
      await refreshMemberData();
    },
    requestPasswordReset: async (email) => {
      await api<{ ok: true }>("/api/mobile/password-reset", { email });
    },
    register: async ({ name, email, password, track }) => {
      await api("/api/register", { name, email, password, track, city: "Dubai", platform: "Instagram", role: "Mobile app application" });
    },
    signOut: async () => {
      try { await api("/api/mobile/sign-out", {}); }
      finally {
        accessToken = null;
        await AsyncStorage.removeItem(`${KEY}-token`);
        await AsyncStorage.removeItem(`${KEY}-profile`);
        setMember(null);
        setRsvps({});
      }
    },
    updateMember: async (patch) => {
      if (Object.prototype.hasOwnProperty.call(patch, "photo")) { setMember((current) => current ? { ...current, photo: patch.photo } : current); return; }
      const current = member;
      if (!current) throw new Error("Sign in to update your profile.");
      const result = await api<ApiMember>("/api/mobile/profile", {
        name: patch.name ?? current.name,
        city: current.city || "Dubai",
        mobile: patch.phone ?? current.phone,
        instagram: current.handle ?? "",
        followers: String(current.followers ?? 0),
      });
      setMember((value) => value ? { ...value, name: result.name, phone: result.mobile ?? value.phone, city: result.city, handle: result.handle, followers: result.followers } : value);
    },
    rsvp: async (eventId, deliverablesAgreed = false) => {
      const result = await api<{ status: RsvpState }>("/api/mobile/rsvps", { eventId, guestNames: [], deliverablesAgreed });
      setRsvps((items) => ({ ...items, [eventId]: result.status }));
      return result.status;
    },
    cancelRsvp: async (eventId) => {
      await api("/api/mobile/rsvps/cancel", { eventId });
      setRsvps((items) => ({ ...items, [eventId]: "none" }));
      await refreshEvents().catch(() => undefined);
    },
    changePassword: async (currentPassword, newPassword) => {
      await api<{ ok: true; signedOut: true }>("/api/mobile/password", { currentPassword, newPassword });
      accessToken = null;
      await AsyncStorage.removeItem(`${KEY}-token`);
      await AsyncStorage.removeItem(`${KEY}-profile`);
      setMember(null);
      setRsvps({});
    },
    refreshEvents,
    refreshPeopleProfiles,
    refreshVenues,
  }), [ready, events, peopleProfiles, venues, member, rsvps]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const store = useContext(Ctx);
  if (!store) throw new Error("useStore must be used inside StoreProvider");
  return store;
}
