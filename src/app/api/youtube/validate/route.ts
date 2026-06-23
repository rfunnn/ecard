import { NextRequest, NextResponse } from "next/server"
import { extractYoutubeVideoId, getYoutubeThumbnail } from "@/lib/youtube"

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url")
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 })

  const videoId = extractYoutubeVideoId(url)
  if (!videoId) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })
  }

  return NextResponse.json({
    videoId,
    thumbnail: getYoutubeThumbnail(videoId),
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
  })
}
