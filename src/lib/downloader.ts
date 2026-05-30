import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { resolveDownloadUrl } from "./tiktok";

export interface DownloadProgress {
  progress: number;
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
}

export type ProgressCallback = (progress: DownloadProgress) => void;

const safWriteLocks = new Set<string>();

async function acquireLock(dir: string): Promise<void> {
  while (safWriteLocks.has(dir)) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  safWriteLocks.add(dir);
}

function releaseLock(dir: string): void {
  safWriteLocks.delete(dir);
}

async function ensureDir(dir: string): Promise<void> {
  if (dir.startsWith("content://")) return;
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

export async function downloadVideo(
  tikTokUrl: string,
  filename: string,
  downloadPath: string | null,
  onProgress?: ProgressCallback,
  _sessionId?: string | null,
): Promise<string> {
  if (Platform.OS === "web") {
    window.open(tikTokUrl, "_blank");
    return tikTokUrl;
  }

  const url = await resolveDownloadUrl(tikTokUrl);
  const isSAF = !!downloadPath?.startsWith("content://");

  const onSnap = (snap: FileSystem.DownloadProgressData) => {
    if (snap.totalBytesExpectedToWrite > 0) {
      onProgress?.({
        progress: snap.totalBytesWritten / snap.totalBytesExpectedToWrite,
        totalBytesWritten: snap.totalBytesWritten,
        totalBytesExpectedToWrite: snap.totalBytesExpectedToWrite,
      });
    }
  };

  if (isSAF && downloadPath) {
    const cacheDir =
      FileSystem.cacheDirectory ?? `${FileSystem.documentDirectory}cache/`;
    await ensureDir(cacheDir);
    const cacheFile = cacheDir + filename;

    const task = FileSystem.createDownloadResumable(url, cacheFile, {}, onSnap);
    const result = await task.downloadAsync();
    if (!result?.uri) throw new Error("Download failed");

    await acquireLock(downloadPath);
    try {
      const safUri = await FileSystem.StorageAccessFramework.createFileAsync(
        downloadPath,
        filename,
        "video/mp4",
      );

      try {
        await FileSystem.copyAsync({ from: cacheFile, to: safUri });
      } catch {
        // copyAsync can fail on some Android versions — fall back to Base64
        const base64 = await FileSystem.readAsStringAsync(cacheFile, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await FileSystem.writeAsStringAsync(safUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      FileSystem.deleteAsync(cacheFile, { idempotent: true }).catch(() => {});
      return safUri;
    } finally {
      releaseLock(downloadPath);
    }
  }

  // Normal file:// destination
  const destDir = downloadPath
    ? downloadPath.endsWith("/")
      ? downloadPath
      : `${downloadPath}/`
    : FileSystem.cacheDirectory ?? `${FileSystem.documentDirectory}cache/`;

  await ensureDir(destDir);
  const filePath = destDir + filename;

  const task = FileSystem.createDownloadResumable(url, filePath, {}, onSnap);
  const result = await task.downloadAsync();
  if (!result?.uri) throw new Error("Download failed");
  return result.uri;
}
