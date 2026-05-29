import * as BackgroundTask from "expo-background-task";
import * as TaskManager from "expo-task-manager";
import { useHistoryStore } from "./history";
import { useSessionStore } from "./session";
import { fetchTikTokProfile } from "./tiktok";

const BACKGROUND_TASK_IDENTIFIER = "background-video-sync";

// Define the task
TaskManager.defineTask(BACKGROUND_TASK_IDENTIFIER, async () => {
  const now = Date.now();
  console.log(
    `Got background task call at date: ${new Date(now).toISOString()}`,
  );

  try {
    const { tiktokSessionId } = useSessionStore.getState();
    const { history, addItem } = useHistoryStore.getState();

    if (!tiktokSessionId) return BackgroundTask.BackgroundTaskResult.Success;

    // For simplicity, let's say we sync the uploader of the last downloaded video
    const lastVideo = history[0];
    if (!lastVideo) return BackgroundTask.BackgroundTaskResult.Success;

    await fetchTikTokProfile(lastVideo.author, tiktokSessionId, 5, (video) => {
      const exists = history.find((h) => h.id === video.id);
      if (!exists) {
        addItem(video);
        console.log(`New video found in background: ${video.id}`);
      }
    });

    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.error("Background task failed:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerBackgroundTask() {
  return BackgroundTask.registerTaskAsync(BACKGROUND_TASK_IDENTIFIER, {
    minimumInterval: 60 * 15, // 15 minutes
  });
}

export async function unregisterBackgroundTask() {
  return BackgroundTask.unregisterTaskAsync(BACKGROUND_TASK_IDENTIFIER);
}
