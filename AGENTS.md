# TikTok Downloader Project

A mobile application built with Expo (SDK 56) and React Native for fetching, downloading, and playing back TikTok videos with Material 3 dynamic theming.

## Core Features
- **URL Resolution**: Posts TikTok page URLs to `tikdownloader.io/api/ajaxSearch` (requires `Referer: https://tikdownloader.io/` header) to extract direct MP4 download links. Priority: HD snapcdn → any snapcdn non-MP3 → v1x CDN fallback.
- **Progress-Tracked Downloads**: `expo-file-system/legacy` with SAF support, write locking for concurrent SAF operations, and Base64 fallback if `copyAsync` fails.
- **In-App Video Playback**: `expo-video` (`useVideoPlayer` + `VideoView`) on the detail screen. Plays only from `localUri` (downloaded file) — no network streaming. Custom controls with drag-to-seek (VLC-style: pause on drag, seek on release), half-screen height.
- **Persistent History**: Zustand store persisted via AsyncStorage. Each `HistoryItem` stores metadata + `localUri`. Deleting an item also deletes the file via `deleteAsync`.
- **History Search & Sort**: `useFilteredHistory()` hook with `useMemo` — filters by query/localOnly, sorts by newest/oldest/author. Must use `useMemo` — returning a new array from a Zustand selector causes infinite re-renders.
- **Session Logging**: In-memory `Logger` (info/warn/error/crash) via Zustand — session-only, not persisted. Viewable on the Logs screen from Settings.
- **Material 3 Dynamic Colors**: All color values come from `Color.android.dynamic` (aliased as `dyn`). Never use hardcoded color values.
- **Tab Bar**: `NativeTabs` from `expo-router/unstable-native-tabs` with SF/Material icon support. Do NOT use `blurEffect` prop — it causes an infinite re-render loop.
- **Background Synchronization**: `expo-background-task` for periodic profile syncing.

## Key Data Flow
1. User pastes TikTok URL → `fetchVideoViaTikDown` hits the tik-down-backend → returns `TikTokMetadata` with both `videoUrl` (CDN) and `pageUrl` (TikTok page URL).
2. Download button calls `downloadVideo(pageUrl, ...)` → `resolveDownloadUrl(pageUrl)` → tikdownloader.io → direct MP4 URL → `createDownloadResumable`.
3. `addItem(metadata, localUri)` persists to history with the local file path.
4. History card → `[videoid]` detail screen → plays from `localUri` only (no fallback to URL).

## Project Structure
- `src/app/_layout.tsx`: Root `Stack` + `QueryClientProvider`, Zustand hydration gate, splash screen.
- `src/app/(main)/_layout.tsx`: `NativeTabs` — Home, Videos, Settings tabs with icons.
- `src/app/(main)/index.tsx`: Home — URL input + `VideoCard`.
- `src/app/(main)/videos.tsx`: Download history with search bar, sort chips, localOnly toggle.
- `src/app/(main)/settings.tsx`: Session ID, download folder, Logs navigation button.
- `src/app/[videoid]/index.tsx`: Video detail — half-screen player, custom controls, metadata.
- `src/app/logs.tsx`: Session log viewer — FlatList with level badges, timestamps, share-to-copy.
- `src/components/video-card.tsx`: Download card with progress bar.
- `src/components/history-card.tsx`: History list item with share button + file-aware delete dialog.
- `src/components/layout/PageWrap.tsx`: `SafeAreaView` + `Host` wrapper for all screens.
- `src/lib/tiktok.ts`: `fetchVideoViaTikDown`, `fetchTikTokProfile` (NDJSON), `resolveDownloadUrl`.
- `src/lib/downloader.ts`: `downloadVideo` — resolves URL then downloads with SAF/cache handling.
- `src/lib/history.ts`: `HistoryItem`, `useHistoryStore`, `useFilteredHistory`, `HistoryFilter`, `SortOrder`.
- `src/lib/logger.ts`: `Logger` singleton + `useLogStore` (in-memory, session-only).
- `src/lib/session.ts`: TikTok session ID store.
- `src/lib/background.ts`: Background task registration and sync logic.
- `src/lib/tw.ts`: Plain `twrnc` instance — do NOT add dynamic colors here.

## Tech Stack
- **Framework**: Expo SDK 56 / React Native 0.85
- **Navigation**: `expo-router` with `Stack` (root) and `NativeTabs` (main)
- **State**: Zustand + AsyncStorage persistence, TanStack React Query
- **Networking**: Axios (tikdownloader.io + tik-down-backend), Fetch (NDJSON profile streaming)
- **File System**: `expo-file-system/legacy` (SAF, `createDownloadResumable`, `copyAsync`)
- **Video**: `expo-video` (`useVideoPlayer`, `VideoView`)
- **Styling**: `twrnc` for layout/spacing utilities only; colors always via `Color.android.dynamic`
- **Icons**: `expo-symbols` (SF Symbols on iOS, Material Symbols on Android)
- **Storage**: `@react-native-async-storage/async-storage`

## Development Rules
- **Package Manager**: Use `bun` for all dependency management (`bun add`, `bun install`).
- **CLI Tools**: Use `bunx` (e.g., `bunx expo`, `bunx tsgo`).
- **Type Checking**: `bunx tsgo --noEmit` — must pass clean before considering work done.
- **Ship**: `bun ship` — type-checks, stages all, generates a conventional commit message via `claude -p`, commits, and pushes.
- **Theming**: Always use `Color.android.dynamic` (aliased as `dyn`) for colors. Never hardcode hex/rgba values in component styles.
- **`@expo/ui` Components**: Must be direct children of `<Host>` — navigation screen boundaries break Compose composition. `PageWrap` provides the `Host` wrapper.
- **File System**: Use `expo-file-system/legacy` (not the new `File`/`DownloadTask` API) — required for SAF operations.
- **Dynamic Colors in twrnc**: Do not spread `Color.android.dynamic` into twrnc config — `OpaqueColorValue` (PlatformColor) values are incompatible with twrnc class generation. Use them as inline style values only.
- **Zustand Selectors**: Never return a new array/object from a selector — it causes infinite re-renders. Use `useMemo` for derived/filtered lists (see `useFilteredHistory`).
- **NativeTabs**: Do not pass `blurEffect` prop — causes infinite re-render loop. Do not use `NativeTabs` with `useColorScheme()` in the same component.
- **Video playback**: The detail screen only plays locally downloaded files (`localUri`). Do not add URL resolution/streaming to the player — it is intentionally local-only.
