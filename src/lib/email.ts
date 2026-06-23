import nodemailer from "nodemailer"

function createTransporter() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    return null
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  })
}

const FROM = process.env.SMTP_FROM ?? "noreply@kad.my"
const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`
  const transporter = createTransporter()

  if (!transporter) {
    // Development fallback — log the link so dev can test without SMTP
    console.log("\n[EMAIL] Password reset link for", email)
    console.log("[EMAIL]", resetUrl, "\n")
    return
  }

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: "Tetapkan Semula Kata Laluan — Kad.my",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px;font-size:22px;color:#111">Tetapkan Semula Kata Laluan</h2>
        <p style="color:#555;margin:0 0 24px">
          Kami menerima permintaan untuk menetapkan semula kata laluan akaun Kad.my anda.
          Klik butang di bawah untuk meneruskan. Pautan ini sah selama <strong>1 jam</strong>.
        </p>
        <a href="${resetUrl}"
           style="display:inline-block;background:#111;color:#fff;text-decoration:none;
                  padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px">
          Tetapkan Semula Kata Laluan
        </a>
        <p style="color:#999;font-size:12px;margin:24px 0 0">
          Jika anda tidak meminta ini, abaikan e-mel ini. Kata laluan anda tidak akan berubah.
        </p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
        <p style="color:#bbb;font-size:11px;margin:0">
          © ${new Date().getFullYear()} Kad.my · Kad Jemputan Digital
        </p>
      </div>
    `,
  })
}
