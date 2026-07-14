export function extractYoutubeVideoId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }
  return null
}

export function getYoutubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

export function getYoutubeEmbedUrl(videoId: string, autoplay = false, loop = true, muted = false, origin = "", startSeconds = 0): string {
  const params = new URLSearchParams({
    enablejsapi: "1",
    autoplay: autoplay ? "1" : "0",
    mute: muted ? "1" : "0",
    loop: loop ? "1" : "0",
    playlist: videoId,
    controls: "0",
    showinfo: "0",
    rel: "0",
    iv_load_policy: "3",
    modestbranding: "1",
  })
  if (origin) params.set("origin", origin)
  if (startSeconds > 0) params.set("start", String(Math.floor(startSeconds)))
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`
}
