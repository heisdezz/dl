import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";
import { resolveDownloadUrl } from "./tiktok";
import { Logger } from "./logger";

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

  Logger.info("download started", { filename, downloadPath });
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

    Logger.info("downloading to cache for SAF", { cacheFile });
    const task = FileSystem.createDownloadResumable(url, cacheFile, {}, onSnap);
    const result = await task.downloadAsync();
    if (!result?.uri) {
      Logger.error("cache download returned no URI");
      throw new Error("Download failed");
    }

    await acquireLock(downloadPath);
    try {
      const safUri = await FileSystem.StorageAccessFramework.createFileAsync(
        downloadPath,
        filename,
        "video/mp4",
      );

      try {
        await FileSystem.copyAsync({ from: cacheFile, to: safUri });
        Logger.info("SAF copy complete", { safUri });
      } catch (e) {
        Logger.warn("copyAsync failed, falling back to Base64", { error: String(e) });
        const base64 = await FileSystem.readAsStringAsync(cacheFile, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await FileSystem.writeAsStringAsync(safUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        Logger.info("Base64 SAF transfer complete");
      }

      FileSystem.deleteAsync(cacheFile, { idempotent: true }).catch(() => {});
      return safUri;
    } catch (e) {
      Logger.error("SAF transfer failed", { error: String(e) });
      throw e;
    } finally {
      releaseLock(downloadPath);
    }
  }

  const destDir = downloadPath
    ? downloadPath.endsWith("/")
      ? downloadPath
      : `${downloadPath}/`
    : FileSystem.cacheDirectory ?? `${FileSystem.documentDirectory}cache/`;

  await ensureDir(destDir);
  const filePath = destDir + filename;

  Logger.info("downloading to file", { filePath });
  const task = FileSystem.createDownloadResumable(url, filePath, {}, onSnap);
  const result = await task.downloadAsync();
  if (!result?.uri) {
    Logger.error("download returned no URI");
    throw new Error("Download failed");
  }
  Logger.info("download complete", { uri: result.uri });
  return result.uri;
}
