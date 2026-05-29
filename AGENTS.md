# TikTok Downloader Project

A cross-platform mobile application built with Expo and React Native for fetching and saving TikTok video metadata.

## Core Features
- **URL Fetching**: Uses the TikTok oEmbed API to retrieve video titles, authors, and covers.
- **Persistent History**: Saves downloaded video metadata to a local store using Zustand and AsyncStorage.
- **Dynamic Theming**: Utilizes Material You (Android Dynamic Colors) and Expo's theme system for a modern UI.

## Project Structure
- `src/app/(main)/`: Contains the main application routes (Home, Videos, Settings).
- `src/app/[videoid]/`: Dynamic route for detailed video metadata.
- `src/components/`: Reusable UI components including `VideoCard` and `HistoryCard`.
- `src/lib/`: Core logic for TikTok API interaction (`tiktok.ts`) and persistent storage (`history.ts`).
- `src/components/layout/`: Global layout wrappers like `PageWrap`.

## Tech Stack
- **Framework**: Expo (SDK 56) / React Native
- **State Management**: Zustand (History), TanStack React Query (Data Fetching)
- **Styling**: `twrnc` (Tailwind for React Native)
- **Icons**: `expo-symbols` (SF Symbols on iOS, Material Symbols on Android)
- **Storage**: `@react-native-async-storage/async-storage` (Persist middleware)

## Development Rules
- **Package Manager**: Use `bun` for all dependency management (installing, adding, removing).
- **Execution**: Use `bunx` to run CLI tools (e.g., `bunx expo`, `bunx tsgo`).
- **Type Checking**: Use `tsgo` via `bunx` (`bunx tsgo`) for all TypeScript compilations and to verify/fix type issues.
- **Styling**: Prefer `twrnc` for styling components to maintain consistency.
- **Theming**: Always use `Color.android.dynamic` (aliased as `dyn`) for colors to support system-wide theming.
