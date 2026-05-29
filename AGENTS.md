# TikTok Downloader Project

A cross-platform mobile application built with Expo and React Native for fetching, saving, and downloading TikTok video metadata.

## Core Features
- **Intelligent URL Fetching**: Uses a dual-strategy approach with oEmbed for basics and the TikDown API for high-quality metadata and direct URLs.
- **Persistent History & Sessions**: Decoupled Zustand stores for video history and TikTok session management.
- **Progress-Tracked Downloads**: Integrated downloader module with real-time feedback and Android Storage Access Framework (SAF) support.
- **Background Synchronization**: Automated profile-based syncing using `expo-background-task`.
- **Material 3 Design**: Sophisticated UI following Material 3 principles with dynamic color support.

## Project Structure
- `src/app/(main)/`: Main application routes (Home, Videos, Settings).
- `src/app/[videoid]/`: Dynamic route for high-fidelity video metadata views.
- `src/components/`: Reusable UI components (`VideoCard`, `HistoryCard`).
- `src/lib/session.ts`: Standalone TikTok session management.
- `src/lib/history.ts`: Persistent download history and folder preferences.
- `src/lib/downloader.ts`: Progress-tracked file system operations.
- `src/lib/background.ts`: Periodic background synchronization tasks.
- `src/lib/tiktok.ts`: API interaction logic using Axios and NDJSON streaming.

## Tech Stack
- **Framework**: Expo (SDK 56) / React Native
- **State Management**: Zustand (History & Session), TanStack React Query (Data Fetching)
- **Networking**: Axios (Standard Requests), Fetch (NDJSON Streaming)
- **Styling**: `twrnc` (Tailwind for React Native)
- **Icons**: `expo-symbols` (SF Symbols / Material Symbols)
- **Storage**: `@react-native-async-storage/async-storage`, `expo-file-system` (SAF Support)

## Development Rules
- **Package Manager**: Use `bun` for all dependency management.
- **Execution**: Use `bunx` to run CLI tools (e.g., `bunx expo`, `bunx tsgo`).
- **Type Checking**: Use `tsgo` via `bunx` for all TypeScript compilations.
- **Theming**: Always use `Color.android.dynamic` (aliased as `dyn`) to support system-wide dynamic theming.
- **Background Ops**: Ensure tasks are registered in the root layout's ready phase.
