export interface TikTokMetadata {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  videoUrl?: string;
}

/**
 * A simple TikTok scraper using the oEmbed API.
 * In a real production environment, you might need a more robust solution
 * or a specialized backend to handle CORS and advanced scraping.
 */
export async function getTikTokMetadata(
  url: string,
): Promise<TikTokMetadata | null> {
  try {
    // Basic validation
    if (!url.includes("tiktok.com")) return null;

    const response = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
    );
    if (!response.ok) return null;

    const data = await response.json();

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
