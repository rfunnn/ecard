import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { uploadFile } from "@/lib/storage"
import { rateLimit, rateLimitKey } from "@/lib/rate-limit"

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

// Magic bytes for allowed image formats
const MAGIC: Array<{ bytes: number[]; mask?: number[]; ext: string }> = [
  { bytes: [0xff, 0xd8, 0xff],                           ext: "jpg"  }, // JPEG
  { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], ext: "png"  }, // PNG
  { bytes: [0x47, 0x49, 0x46, 0x38],                     ext: "gif"  }, // GIF
  { bytes: [0x52, 0x49, 0x46, 0x46],                     ext: "webp" }, // WEBP (RIFF header)
]

function detectImageType(buf: Buffer): string | null {
  for (const sig of MAGIC) {
    if (sig.bytes.every((b, i) => buf[i] === b)) return sig.ext
  }
  // WEBP: RIFF????WEBP
  if (buf.slice(0, 4).toString("hex") === "52494646" &&
      buf.slice(8, 12).toString("ascii") === "WEBP") return "webp"
  return null
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // 20 uploads per user per hour
  if (!rateLimit(`upload:${session.user.id}`, 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429 })
  }

  try {
    const form = await req.formData()
    const file = form.get("file") as File | null

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())

    // Validate actual file content via magic bytes — never trust the MIME header alone
    const detectedExt = detectImageType(buffer)
    if (!detectedExt)
      return NextResponse.json({ error: "File must be a valid image (JPEG, PNG, GIF, or WebP)" }, { status: 400 })

    const mimeMap: Record<string, string> = { jpg: "image/jpeg", png: "image/png", gif: "image/gif", webp: "image/webp" }
    const url = await uploadFile(buffer, mimeMap[detectedExt] ?? "image/jpeg", detectedExt)

    return NextResponse.json({ url })
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error("[upload] Failed:", detail, err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
