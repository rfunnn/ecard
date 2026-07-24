import { NextRequest, NextResponse } from "next/server"
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"

// Secured by HEALTH_CHECK_SECRET env var. Call with ?secret=<value>.
// Intended to be triggered by an external cron job (e.g. cron-job.org, Uptime Robot, or server cron).

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean)

// Default limits (bytes). Override via env vars.
const DB_MAX_BYTES    = Number(process.env.DB_MAX_BYTES    ?? 1 * 1024 * 1024 * 1024)  // 1 GB
const STORAGE_MAX_BYTES = Number(process.env.STORAGE_MAX_BYTES ?? 10 * 1024 * 1024 * 1024) // 10 GB

const ALERT_THRESHOLD = 0.80 // 80%

function mailer() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) return null
  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  })
}

async function checkDatabase(): Promise<{ usedBytes: number; maxBytes: number; pct: number }> {
  const result = await prisma.$queryRaw<Array<{ used: bigint }>>`
    SELECT SUM(data_length + index_length) AS used
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
  `
  const usedBytes = Number(result[0]?.used ?? 0)
  return { usedBytes, maxBytes: DB_MAX_BYTES, pct: usedBytes / DB_MAX_BYTES }
}

async function checkStorage(): Promise<{ usedBytes: number; maxBytes: number; pct: number }> {
  const client = new S3Client({
    endpoint: process.env.STORAGE_ENDPOINT,
    region: process.env.STORAGE_REGION ?? "us-east-1",
    credentials: {
      accessKeyId:     process.env.STORAGE_ACCESS_KEY ?? "",
      secretAccessKey: process.env.STORAGE_SECRET_KEY ?? "",
    },
    forcePathStyle: true,
  })

  const bucket = process.env.STORAGE_BUCKET ?? "ecard"
  let totalBytes = 0
  let continuationToken: string | undefined

  do {
    const res = await client.send(new ListObjectsV2Command({
      Bucket: bucket,
      ContinuationToken: continuationToken,
    }))
    for (const obj of res.Contents ?? []) {
      totalBytes += obj.Size ?? 0
    }
    continuationToken = res.NextContinuationToken
  } while (continuationToken)

  return { usedBytes: totalBytes, maxBytes: STORAGE_MAX_BYTES, pct: totalBytes / STORAGE_MAX_BYTES }
}

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(2)} MB`
  return `${(bytes / 1e3).toFixed(2)} KB`
}

async function sendAlert(subject: string, html: string) {
  const transport = mailer()
  if (!transport || ADMIN_EMAILS.length === 0) {
    console.warn("[health-check] SMTP not configured or no admin emails — skipping alert")
    return
  }
  await transport.sendMail({
    from: process.env.SMTP_FROM ?? "noreply@ekadku.com",
    to: ADMIN_EMAILS.join(", "),
    subject,
    html,
  })
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  if (!secret || secret !== process.env.HEALTH_CHECK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const alerts: string[] = []
  let dbInfo: { usedBytes: number; maxBytes: number; pct: number } | null = null
  let storageInfo: { usedBytes: number; maxBytes: number; pct: number } | null = null
  const errors: string[] = []

  try {
    dbInfo = await checkDatabase()
    if (dbInfo.pct >= ALERT_THRESHOLD) {
      alerts.push(
        `🗄️ Database: ${formatBytes(dbInfo.usedBytes)} / ${formatBytes(dbInfo.maxBytes)} (${(dbInfo.pct * 100).toFixed(1)}%)`
      )
    }
  } catch (e) {
    errors.push(`DB check failed: ${e instanceof Error ? e.message : String(e)}`)
  }

  try {
    storageInfo = await checkStorage()
    if (storageInfo.pct >= ALERT_THRESHOLD) {
      alerts.push(
        `📦 Object Storage: ${formatBytes(storageInfo.usedBytes)} / ${formatBytes(storageInfo.maxBytes)} (${(storageInfo.pct * 100).toFixed(1)}%)`
      )
    }
  } catch (e) {
    errors.push(`Storage check failed: ${e instanceof Error ? e.message : String(e)}`)
  }

  if (alerts.length > 0) {
    const alertRows = alerts.map((a) => `<li style="margin-bottom:8px;">${a}</li>`).join("")
    await sendAlert(
      `[ekadku.com] ⚠️ Amaran Kapasiti — ${alerts.length} sumber melebihi 80%`,
      `<!DOCTYPE html>
<html lang="ms">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f7f3ee;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ee;padding:32px 16px;">
<tr><td align="center">
<table width="580" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:580px;width:100%;">
  <tr>
    <td style="background:linear-gradient(135deg,#7B1414,#A83232);padding:24px 32px;text-align:center;">
      <p style="margin:0;color:#D4AF37;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;">ekadku.com</p>
      <h1 style="margin:8px 0 0;color:#fff;font-size:20px;font-weight:700;">⚠️ Amaran Kapasiti</h1>
    </td>
  </tr>
  <tr>
    <td style="padding:28px 32px;">
      <p style="margin:0 0 16px;color:#4a1010;font-size:14px;line-height:1.6;">
        Satu atau lebih sumber sistem <strong>ekadku.com</strong> telah melebihi <strong>80% kapasiti</strong>. Sila ambil tindakan segera.
      </p>
      <ul style="margin:0 0 20px;padding-left:20px;color:#333;font-size:14px;line-height:1.8;">
        ${alertRows}
      </ul>
      <p style="margin:0;color:rgba(74,16,16,0.5);font-size:12px;">
        Dihantar secara automatik oleh sistem pemantauan ekadku.com · ${new Date().toLocaleString("ms-MY", { timeZone: "Asia/Kuala_Lumpur" })}
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`,
    )
  }

  return NextResponse.json({
    ok: true,
    checkedAt: new Date().toISOString(),
    db: dbInfo
      ? { used: formatBytes(dbInfo.usedBytes), max: formatBytes(dbInfo.maxBytes), pct: `${(dbInfo.pct * 100).toFixed(1)}%`, alert: dbInfo.pct >= ALERT_THRESHOLD }
      : null,
    storage: storageInfo
      ? { used: formatBytes(storageInfo.usedBytes), max: formatBytes(storageInfo.maxBytes), pct: `${(storageInfo.pct * 100).toFixed(1)}%`, alert: storageInfo.pct >= ALERT_THRESHOLD }
      : null,
    alerts,
    errors,
  })
}
