import { useColorScheme } from "react-native";

// Bronze, warm sand and deep bronze-brown — same palette as the website.
const light = {
  bg: "#F2DFC3",
  surface: "#FBF1E2",
  text: "#2E1A0B",
  muted: "#7A5A3C",
  primary: "#A8642A",
  primaryText: "#FFF7EC",
  deep: "#4B2A10",
  border: "#D9BC94",
};
const dark: typeof light = {
  bg: "#1F1208",
  surface: "#2E1C0E",
  text: "#F6E7D0",
  muted: "#C9A985",
  primary: "#C98444",
  primaryText: "#1F1208",
  deep: "#4B2A10",
  border: "#5A3A1E",
};

export type Theme = typeof light;
export function useTheme(): Theme {
  return useColorScheme() === "dark" ? dark : light;
}

export const fonts = {
  display: "BebasNeue_400Regular",
  body: "Barlow_400Regular",
  bodyBold: "Barlow_600SemiBold",
};
