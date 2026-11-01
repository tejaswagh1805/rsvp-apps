# RSVP DXB — React Native (Expo) starter

React Native customer app prototype for RSVP DXB. Android and iOS use the same Expo app and bundled sample content.

> Android and iOS use the same app code. Live events and approved member actions use the existing RSVP admin API, which connects to the shared Neon database. The mobile app never contains database credentials.

## Run it on your phone
1. Install Node.js 18 or 20.
2. In this folder:
   ```bash
   npm install
   npx expo install --fix     # aligns package versions with the Expo SDK
   npx expo start
   ```
3. Install **Expo Go** on your Android or iPhone and scan the QR code **from inside the Expo Go app** (not the phone's camera).
   - If scanning fails, run `npx expo start --tunnel` instead (PC and phone may be on different networks).
   - Keep the terminal open while testing; the first load can take 1–2 minutes.

## What's included
- Home: video banner + photos sliding in on scroll, header turns solid on scroll, "Last minute ticket" pulse button
- Latest events slider and database-driven Venue Top Picks; venue cards open the same published venue details and links as the customer site
- Events gallery, artists on home, full Artists & Influencers screen (artists first), social links, video play button
- Events list with category filters, event detail with RSVP / waitlist / cancel and WhatsApp sharing
- Tickets & Offers with 4 animated tabs
- Member sign in, applications, RSVP requests and cancellation, profile editing, and saved member sessions use the admin API
- Events and capacity load from the shared database, with bundled images used when no event image is configured
- Password recovery opens the customer site's email reset flow; signed-in password changes are checked and saved through the mobile API
- My account: overview, My Pass with QR code, profile photo (auto-saved), profile edit, update password, log out
- FAQ, Contact form, floating WhatsApp chat button, light/dark mode (follows the phone)

## Before store release
- Set `WHATSAPP_NUMBER` and real social links in `src/content.ts`.
- The mobile API is hosted with the admin service at `https://d1f5sjkm09kt76.cloudfront.net`. Set `EXPO_PUBLIC_RSVP_API_URL` in the EAS environment to override it for another deployment. Deploy the admin service update that exposes `/api/mobile/venues`, `/api/mobile/password`, and `/api/mobile/password-reset` before releasing the app build.
- Deploy the admin service changes and ensure its shared database has the `member_sessions` and `event_rsvp_requests` tables before releasing a new app build. RSVP and profile changes then persist with member data in Neon.
- Build with EAS: `npm i -g eas-cli`, `eas login`, `eas build -p android` / `eas build -p ios`, then `eas submit`.
- Needs a Google Play developer account and an Apple developer account. `com.rsvpdxb.app` is set as the app ID in `app.json`. Change it if needed.

The admin dashboard is not included. It stays on the web.
