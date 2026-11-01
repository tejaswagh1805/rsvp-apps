export const ARTISTS = [
  { name: "The selector", genre: "DJ / Sound & culture", image: require("../assets/artist-dj.jpg") },
  { name: "The storyteller", genre: "Artist / Live sessions", image: require("../assets/artist-musician.jpg") },
  { name: "The creator", genre: "Fashion / Digital culture", image: require("../assets/artist-creator.jpg") },
];

export const INFLUENCERS = [
  { name: "The tastemaker", genre: "Lifestyle / City guides", image: require("../assets/influencer-lifestyle.jpg") },
  { name: "The mover", genre: "Fitness / Travel", image: require("../assets/influencer-travel.jpg") },
  { name: "The muse", genre: "Beauty / Fashion", image: require("../assets/influencer-beauty.jpg") },
];

// Placeholder social links — replace with the client's real profiles.
export const SOCIALS = { instagram: "https://instagram.com", twitter: "https://x.com", youtube: "https://youtube.com" };

export const BANNER_IMAGES = [
  require("../assets/community-mixer.jpg"),
  require("../assets/community-sessions.jpg"),
  require("../assets/community-creators.jpg"),
  require("../assets/hero.jpg"),
];

export const OFFERS = [
  { name: "Tickets & More", icon: "ticket-outline", title: "Your next great night.", body: "Explore the guest list, see what's included and claim a place in the room.", category: "All" },
  { name: "Food & Drinks", icon: "restaurant-outline", title: "A seat worth taking.", body: "Chef-led tables, tasting experiences and a little something unexpected.", category: "Dining" },
  { name: "Exclusive Invite", icon: "sparkles-outline", title: "Some doors open quietly.", body: "Private previews and curated invitations, matched to your member track.", category: "Property" },
  { name: "Corporate connect", icon: "people-outline", title: "Good connections start here.", body: "Bring your brand, your ideas and your people. We'll bring the room.", category: "All" },
] as const;

export const FAQ: [string, string][] = [
  ["How do I join?", "Register, choose your track and complete your profile. The team normally reviews applications within 48 hours."],
  ["Can I RSVP to every event?", "Events are matched to your member track. Full events offer a waitlist; closed RSVPs cannot accept new responses."],
  ["Where is my entry pass?", "Your pass appears under My Pass in your account after you RSVP."],
  ["Are tickets and payments live?", "Ticket availability, prices and payment steps depend on each event. Use the event contact option to request details and wait for confirmation before paying."],
];

// Leave empty until the client supplies the approved WhatsApp number (digits only, e.g. 9715XXXXXXXX).
export const WHATSAPP_NUMBER = "";
