# Real Estate App

Professional React Native app – **Admin** management and **User** property browsing. Matches website theme (gold, light/dark).

## Features

- **3-page Welcome flow** – App-style onboarding
- **Home** – Hero, trust stats, featured properties, why invest, how it works
- **Properties** – Full listing with search, pull-to-refresh, backend-integrated
- **Property detail** – Gallery, specs, description, lead form, WhatsApp
- **Admin** – Dashboard (placeholder)
- **Theme** – Light/dark with persistence

## API Setup

Edit `src/api/config.ts`:
- **Android emulator:** `10.0.2.2` (default)
- **Physical device:** Your machine's LAN IP (e.g. `192.168.1.100`)
- **Production:** Set production URL

Backend must run on port 5000 (or update `DEV_PORT`).

## Run

```bash
# Terminal 1 - Metro
npm start

# Terminal 2 - Android
npm run android
```

## Project Structure

```
src/
├── api/           # Backend client (properties, queries)
├── theme/         # Light/dark colors
├── contexts/      # ThemeContext
├── components/    # PropertyCard
├── screens/
│   ├── WelcomeScreen.tsx   # 3-page onboarding
│   ├── HomeScreen.tsx      # Website-like home
│   ├── PropertiesScreen.tsx
│   ├── PropertyDetailScreen.tsx
│   └── AdminScreen.tsx
└── navigation/    # Stack + tabs
```
