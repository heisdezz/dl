# TikTok Downloader Project

A mobile application built with Expo (SDK 56) and React Native for fetching, downloading, and playing back TikTok videos with Material 3 dynamic theming.

## Core Features
- **URL Resolution**: Posts TikTok page URLs to `tikdownloader.io/api/ajaxSearch` (requires `Referer: https://tikdownloader.io/` header) to extract direct MP4 download links. Priority: HD snapcdn → any snapcdn non-MP3 → v1x CDN fallback.
- **Progress-Tracked Downloads**: `expo-file-system/legacy` with SAF support, write locking for concurrent SAF operations, and Base64 fallback if `copyAsync` fails.
- **In-App Video Playback**: `expo-video` (`useVideoPlayer` + `VideoView`) on the detail screen. Plays from `localUri` if already downloaded; otherwise resolves a fresh stream URL on demand.
- **Persistent History**: Zustand store persisted via AsyncStorage. Each `HistoryItem` stores metadata + `localUri` (local file path). Deleting an item also deletes the file via `deleteAsync`.
- **Material 3 Dynamic Colors**: All color values come from `Color.android.dynamic` (aliased as `dyn`). Never use hardcoded color values.
- **Floating Pill Tab Bar**: Custom `tabBar` prop on `Tabs` — a pill-shaped bar with `secondaryContainer` active bubbles and `onSurfaceVariant`/`onSecondaryContainer` icon tints.
- **Background Synchronization**: `expo-background-task` for periodic profile syncing.

## Key Data Flow
1. User pastes TikTok URL → `fetchVideoViaTikDown` hits the tik-down-backend → returns `TikTokMetadata` with both `videoUrl` (CDN) and `pageUrl` (TikTok page URL).
2. Download button calls `downloadVideo(pageUrl, ...)` → `resolveDownloadUrl(pageUrl)` → tikdownloader.io → direct MP4 URL → `createDownloadResumable`.
3. `addItem(metadata, localUri)` persists to history with the local file path.
4. History card → `[videoid]` detail screen → plays from `localUri` or re-resolves.

## Project Structure
- `src/app/_layout.tsx`: Root `ExperimentalStack` (no `Host` wrapper needed here).
- `src/app/(main)/_layout.tsx`: `NativeTabs` with floating pill tab bar override.
- `src/app/(main)/index.tsx`: Home — URL input + `VideoCard`.
- `src/app/(main)/videos.tsx`: Download history list with bulk delete.
- `src/app/(main)/settings.tsx`: Session ID and download folder configuration.
- `src/app/[videoid]/index.tsx`: Video detail — thumbnail/player, metadata, actions.
- `src/components/video-card.tsx`: Download card with progress bar.
- `src/components/history-card.tsx`: History list item with file-aware delete.
- `src/components/layout/PageWrap.tsx`: `SafeAreaView` + `Host` wrapper for all screens.
- `src/lib/tiktok.ts`: `fetchVideoViaTikDown`, `fetchTikTokProfile` (NDJSON), `resolveDownloadUrl`.
- `src/lib/downloader.ts`: `downloadVideo` — resolves URL then downloads with SAF/cache handling.
- `src/lib/history.ts`: `HistoryItem` (extends `TikTokMetadata` + `downloadedAt` + `localUri`).
- `src/lib/session.ts`: TikTok session ID store.
- `src/lib/background.ts`: Background task registration and sync logic.
- `src/lib/tw.ts`: Plain `twrnc` instance — do NOT add dynamic colors here (they are `PlatformColor` references, incompatible with twrnc class generation).

## Tech Stack
- **Framework**: Expo SDK 56 / React Native 0.85
- **Navigation**: `expo-router` with `ExperimentalStack` (root) and `NativeTabs` (main)
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
- **Theming**: Always use `Color.android.dynamic` (aliased as `dyn`) for colors. Never hardcode hex/rgba values in component styles.
- **`@expo/ui` Components**: Must be direct children of `<Host>` — navigation screen boundaries break the Compose composition context, so each screen using `@expo/ui` needs its own `Host`. `PageWrap` provides this.
- **File System**: Use `expo-file-system/legacy` (not the new `File`/`DownloadTask` API) — the legacy API is required for SAF operations and is what the existing downloader is built on.
- **Dynamic Colors in twrnc**: Do not spread `Color.android.dynamic` into twrnc theme config — the values are `OpaqueColorValue` (PlatformColor references) and will produce "unknown utility" warnings. Use them directly as inline style values.
