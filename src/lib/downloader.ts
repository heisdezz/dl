import * as FileSystem from "expo-file-system";
import { StorageAccessFramework } from "expo-file-system/legacy";
import { Platform } from "react-native";

export interface DownloadProgress {
  progress: number;
  totalBytesWritten: number;
  totalBytesExpectedToWrite: number;
}

export type ProgressCallback = (progress: DownloadProgress) => void;

export async function downloadVideo(
  url: string,
  filename: string,
  downloadPath: string | null,
  onProgress?: ProgressCallback,
) {
  try {
    // Cast to any to access properties that might be missing from types but present at runtime
    const FS = FileSystem as any;
    const cacheDir = FS.cacheDirectory;
    if (!cacheDir) throw new Error("Cache directory not available");

    const tmpUri = cacheDir + filename;

    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      tmpUri,
      {},
      (p) => {
        if (p.totalBytesExpectedToWrite > 0) {
          onProgress?.({
            progress: p.totalBytesWritten / p.totalBytesExpectedToWrite,
            totalBytesWritten: p.totalBytesWritten,
            totalBytesExpectedToWrite: p.totalBytesExpectedToWrite,
          });
        } else {
          // If total size is unknown, just report progress as 0 for now
          // but at least it shows activity
          onProgress?.({
            progress: 0,
            totalBytesWritten: p.totalBytesWritten,
            totalBytesExpectedToWrite: p.totalBytesExpectedToWrite,
          });
        }
      },
    );

    const result = await downloadResumable.downloadAsync();
    if (!result) throw new Error("Download failed");

    // 2. If we have a SAF download path (Android), move it there
    if (Platform.OS === "android" && downloadPath) {
      try {
        const fileUri = await StorageAccessFramework.createFileAsync(
          downloadPath,
          filename,
          "video/mp4",
        );

        // Use copyAsync instead of read/write string to avoid memory issues with large videos
        await FileSystem.copyAsync({
          from: result.uri,
          to: fileUri,
        });

        // Clean up tmp file
        await FileSystem.deleteAsync(result.uri, { idempotent: true });
        return fileUri;
      } catch (e) {
        console.error("SAF transfer failed:", e);
        throw e;
      }
    }

    return result.uri;
  } catch (error) {
    console.error("Download error:", error);
    throw error;
  }
}
