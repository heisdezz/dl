import axios from "axios";

export interface TikTokMetadata {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  videoUrl?: string;
}

/**
 * A simple TikTok scraper using the oEmbed API.
 */
export async function getTikTokMetadata(
  url: string,
): Promise<TikTokMetadata | null> {
  try {
    if (!url.includes("tiktok.com")) return null;

    const response = await axios.get(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
    );

    const data = response.data;

    return {
      id: data.video_id || Math.random().toString(36).substring(7),
      title: data.title || "TikTok Video",
      author: data.author_name || "Unknown Author",
      coverUrl: data.thumbnail_url,
    };
  } catch (error) {
    console.error("Failed to fetch TikTok metadata:", error);
    return null;
  }
}

/**
 * Fetches metadata for a single video using the TikDown API.
 */
export async function fetchVideoViaTikDown(
  videoUrl: string,
  sessionId: string,
): Promise<TikTokMetadata | null> {
  let result: TikTokMetadata | null = null;
  try {
    await fetchTikTokProfile(videoUrl, sessionId, 1, (video) => {
      result = video;
    });
  } catch (e) {
    console.error("TikDown fetch failed:", e);
  }
  return result;
}

/**
 * Fetches videos from a TikTok profile using the TikDown API.
 * This implementation uses axios for the initial request and manual parsing for NDJSON streaming.
 */
export async function fetchTikTokProfile(
  username: string,
  sessionId: string,
  limit = 20,
  onVideoFetched?: (video: TikTokMetadata) => void,
) {
  // Axios doesn't support NDJSON streaming as easily as fetch + reader in some environments,
  // but for the sake of the exercise, we can use it with responseType: 'stream' in Node,
  // but in React Native 'fetch' is actually more robust for streaming responses.
  // However, we can use fetch for the streaming part and axios for others.

  const res = await fetch("https://tik-down-backend.vercel.app/tiktok", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ u: username, tt_session_id: sessionId, limit }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch profile");
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("ReadableStream not supported");

  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      if (line.trim()) {
        try {
          const videoData = JSON.parse(line);
          const metadata: TikTokMetadata = {
            id: videoData.id,
            title: videoData.title,
            author: videoData.uploader,
            coverUrl:
              videoData.thumbnail || videoData.thumbnails?.slice(-1)[0]?.url,
            videoUrl: videoData.url || videoData.webpage_url,
          };
          onVideoFetched?.(metadata);
        } catch (e) {
          console.error("Error parsing NDJSON line:", e);
        }
      }
    }
  }
}
