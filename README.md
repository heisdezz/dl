# TikDown - TikTok Downloader

A modern, fast, and elegant TikTok video downloader built with React Native and Expo. TikDown allows you to fetch, download, and manage your favorite TikTok videos with high-quality results and a native experience.

## ✨ Features

- **Direct Downloads**: Download high-quality MP4 videos directly from TikTok URLs.
- **Native Video Player**: Integrated high-performance video player with custom controls, seek-to-drag, and auto-looping.
- **Fullscreen Support**: Enjoy your videos in native fullscreen mode.
- **History Management**: Keep track of your downloads with a persistent history, search, and sort functionality.
- **Material 3 Design**: Beautiful UI with Material You dynamic theming and responsive layouts.
- **SAF Support**: Full support for Android Storage Access Framework to save videos directly to your preferred folders.
- **Smart Sharing**: Share local video files or links with one tap.
- **Session Logging**: In-app logs to track downloads and system events.

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (Recommended package manager)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- Android Studio / Xcode (for native development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/heisdezz/dl.git
   cd dl
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the development server:
   ```bash
   bun start
   ```

### Building for Android

To generate a release APK:

```bash
bunx expo prebuild --platform android
cd android && ./gradlew assembleRelease
```

The APK will be located at `android/app/build/outputs/apk/release/app-release.apk`.

## 🛠 Tech Stack

- **Framework**: Expo SDK 56 / React Native
- **Navigation**: Expo Router (File-based)
- **State Management**: Zustand + TanStack Query
- **Styling**: twrnc (Tailwind CSS for React Native) + Material 3 Dynamic Colors
- **Video**: expo-video
- **Icons**: MaterialCommunityIcons (@expo/vector-icons)
- **Database**: AsyncStorage (Persistence)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/heisdezz/dl/issues).

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by [heisdezz](https://github.com/heisdezz)
