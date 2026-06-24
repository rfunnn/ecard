import { NextRequest, NextResponse } from "next/server"
import { uploadFile } from "@/lib/storage"

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("file") as File | null

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
    if (!file.type.startsWith("image/"))
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 })

    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "")
    const url = await uploadFile(buffer, file.type, ext)

    return NextResponse.json({ url })
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error("[upload] Failed:", detail, err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
