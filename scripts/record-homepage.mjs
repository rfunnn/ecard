/**
 * Records the homepage phone mockup animation and saves as MP4.
 * Run: node scripts/record-homepage.mjs
 * Requires: dev server running on localhost:3000, ffmpeg on PATH
 */
import { chromium } from "playwright"
import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const TMP_DIR   = path.join(__dirname, "..", "tmp-recording")
const OUT_FILE  = path.join(__dirname, "..", "public", "homepage-demo.mp4")

// Duration in ms — 6 features × 3 s each + generous buffer
const RECORD_MS = 26_000

if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true })

console.log("Launching browser…")
const browser = await chromium.launch({ headless: true })

// Portrait viewport so the phone mockup fills the frame naturally
const context = await browser.newContext({
  viewport:    { width: 430, height: 932 },
  recordVideo: { dir: TMP_DIR, size: { width: 430, height: 932 } },
})

const page = await context.newPage()

console.log("Loading homepage…")
await page.goto("http://localhost:3000", { waitUntil: "networkidle", timeout: 30_000 })

// Dismiss any opening gate / splash if present — hit Escape or just wait
await page.keyboard.press("Escape")

// Scroll the phone mockup into view
await page.evaluate(() => {
  const el = document.querySelector("[class*='HomepagePhoneMockup'], [data-mockup], canvas, video")
    ?? document.querySelector("main")
  el?.scrollIntoView({ behavior: "instant", block: "center" })
})

console.log(`Recording for ${RECORD_MS / 1000}s…`)
await page.waitForTimeout(RECORD_MS)

// Closing the context finalises the .webm file
await context.close()
await browser.close()

// Find the recorded .webm
const webmFiles = fs.readdirSync(TMP_DIR).filter(f => f.endsWith(".webm"))
if (!webmFiles.length) {
  console.error("No .webm found in", TMP_DIR)
  process.exit(1)
}
const webmPath = path.join(TMP_DIR, webmFiles[0])
console.log(`Recorded: ${webmPath}`)

// Convert to MP4 via ffmpeg
console.log("Converting to MP4…")
// Use the ffmpeg alias installed by winget (may need full path on first run)
const FFMPEG_BIN = "C:\\Users\\arfan.azman\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.1.2-full_build\\bin"
const ffmpegPath = path.join(FFMPEG_BIN, "ffmpeg.exe")
const env = { ...process.env, PATH: `${FFMPEG_BIN};${process.env.PATH}` }

// Ensure width/height are even numbers (H.264 requirement), high quality
const ffmpegCmd = `"${ffmpegPath}" -y -i "${webmPath}" -vf "scale=430:932" -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -an "${OUT_FILE}"`
execSync(ffmpegCmd, { stdio: "inherit", env })

// Cleanup temp files
fs.rmSync(TMP_DIR, { recursive: true, force: true })

console.log(`\nDone! MP4 saved to: ${OUT_FILE}`)
