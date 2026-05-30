import axios from "axios";

export interface TikTokMetadata {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  videoUrl?: string;
  pageUrl?: string;
}

function mapVideoData(data: any): TikTokMetadata {
  return {
    id: data.id,
    title: data.title,
    author: data.uploader,
    coverUrl: data.thumbnail || data.thumbnails?.slice(-1)[0]?.url,
    videoUrl: data.url || data.webpage_url,
    pageUrl: data.webpage_url,
  };
}

export async function getTikTokMetadata(
  url: string,
): Promise<TikTokMetadata | null> {
  try {
    if (!url.includes("tiktok.com")) return null;
    const res = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      id: data.video_id || url.split("/").pop() || "",
      title: data.title || "TikTok Video",
      author: data.author_name || "Unknown Author",
      coverUrl: data.thumbnail_url,
    };
  } catch {
    return null;
  }
}

export async function fetchVideoViaTikDown(
  videoUrl: string,
  sessionId?: string | null,
): Promise<TikTokMetadata | null> {
  try {
    const res = await fetch(
      "https://tik-down-backend.vercel.app/tiktok/download",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ u: videoUrl, tt_session_id: sessionId || "" }),
      },
    );
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || "Failed to fetch video");
    }
    return mapVideoData(await res.json());
  } catch (e) {
    console.error("TikDown fetch failed:", e);
    return getTikTokMetadata(videoUrl);
  }
}

export async function fetchTikTokProfile(
  username: string,
  sessionId?: string | null,
  limit = 20,
  onVideoFetched?: (video: TikTokMetadata) => void,
) {
  const res = await fetch("https://tik-down-backend.vercel.app/tiktok", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      u: username,
      tt_session_id: sessionId || "",
      limit,
    }),
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Failed to fetch profile");
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
          onVideoFetched?.(mapVideoData(JSON.parse(line)));
        } catch (e) {
          console.error("Error parsing NDJSON line:", e);
        }
      }
    }
  }
}

export async function resolveDownloadUrl(tikTokUrl: string): Promise<string> {
  // console.log(tikTokUrl, "q");

  const payload = {
    q: tikTokUrl,
    lang: "en",
  };

  console.log("payload", payload);
  const { data } = await axios.post(
    "https://tikdownloader.io/api/ajaxSearch",
    new URLSearchParams(payload).toString(),
  );

  console.log("data", data);
  if (data.status !== "ok" || !data.data) {
    throw new Error(`tikdownloader.io error: status=${data.status}`);
  }

  const html = data.data;
  const decode = (u: string) => u.replace(/&amp;/g, "&");

  // HD MP4 via snapcdn
  const hdMatch = html.match(
    /href="([^"]+)"[^>]*>\s*<i[^>]*><\/i>\s*Download MP4 HD/,
  );
  if (hdMatch?.[1]) return decode(hdMatch[1]);

  // Any snapcdn non-MP3 link
  const snapUrl = [
    ...html.matchAll(/href="(https?:\/\/dl\.snapcdn[^"]+)"/g),
  ].find((m) => !m[1].includes(".mp3"))?.[1];
  if (snapUrl) return decode(snapUrl);

  // Direct CDN fallback
  const cdnMatch = html.match(/href="(https:\/\/v1[^"]+\.mp4[^"]*)"/);
  if (cdnMatch?.[1]) return decode(cdnMatch[1]);

  throw new Error("Could not extract download URL from tikdownloader.io");
}
