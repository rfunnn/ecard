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

const FROM = process.env.SMTP_FROM ?? "noreply@ekadku.com"
const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

export interface OrderNotificationData {
  orderId: string
  userEmail: string
  userName: string | null
  totalAmount: number   // in sen
  paidAt: Date
  items: Array<{
    package: string
    amount: number      // in sen
    card: {
      slug: string
      title: string
      groomName: string | null
      brideName: string | null
    }
  }>
}

export async function sendOrderNotification(data: OrderNotificationData): Promise<void> {
  const transporter = createTransporter()
  if (!transporter) {
    console.warn("[email] SMTP not configured — skipping order notification for", data.orderId)
    return
  }

  const toRM = (sen: number) => `RM${(sen / 100).toFixed(2)}`
  const customerName = data.userName || data.userEmail

  const itemRows = data.items
    .map((item) => {
      const cardLabel =
        item.card.groomName && item.card.brideName
          ? `${item.card.groomName} & ${item.card.brideName}`
          : item.card.title || item.card.slug
      return `<tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8df;">${cardLabel}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8df;text-align:center;">
          <span style="background:#7B1414;color:#fff;font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;">${item.package}</span>
        </td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0e8df;text-align:right;font-weight:600;">${toRM(item.amount)}</td>
      </tr>`
    })
    .join("")

  const paidAtStr = data.paidAt.toLocaleString("ms-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    dateStyle: "full",
    timeStyle: "short",
  })

  const html = `<!DOCTYPE html>
<html lang="ms">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f3ee;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ee;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
  <tr>
    <td style="background:linear-gradient(135deg,#7B1414,#A83232);padding:28px 32px;text-align:center;">
      <p style="margin:0;color:#D4AF37;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;">ekadku.com</p>
      <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:700;">Pesanan Baru ✦</h1>
    </td>
  </tr>
  <tr>
    <td style="padding:32px;">
      <p style="margin:0 0 20px;color:#4a1010;font-size:14px;line-height:1.6;">
        Pesanan baharu telah diterima dan pembayaran telah disahkan.
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fdf5ee;border-radius:8px;padding:16px;margin-bottom:24px;">
        <tr>
          <td style="padding:4px 0;color:#7B1414;font-size:12px;font-weight:600;width:140px;">ID Pesanan</td>
          <td style="padding:4px 0;color:#4a1010;font-size:12px;font-family:monospace;">${data.orderId}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#7B1414;font-size:12px;font-weight:600;">Pelanggan</td>
          <td style="padding:4px 0;color:#4a1010;font-size:12px;">${customerName}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#7B1414;font-size:12px;font-weight:600;">E-mel</td>
          <td style="padding:4px 0;color:#4a1010;font-size:12px;">${data.userEmail}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;color:#7B1414;font-size:12px;font-weight:600;">Tarikh Bayar</td>
          <td style="padding:4px 0;color:#4a1010;font-size:12px;">${paidAtStr}</td>
        </tr>
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0e8df;border-radius:8px;overflow:hidden;margin-bottom:24px;">
        <thead>
          <tr style="background:#fdf5ee;">
            <th style="padding:8px 12px;text-align:left;font-size:11px;color:#7B1414;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;">Kad</th>
            <th style="padding:8px 12px;text-align:center;font-size:11px;color:#7B1414;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;">Pakej</th>
            <th style="padding:8px 12px;text-align:right;font-size:11px;color:#7B1414;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;">Harga</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr style="background:#7B1414;">
            <td colspan="2" style="padding:10px 12px;color:#fff;font-size:13px;font-weight:600;">JUMLAH</td>
            <td style="padding:10px 12px;color:#D4AF37;font-size:15px;font-weight:700;text-align:right;">${toRM(data.totalAmount)}</td>
          </tr>
        </tfoot>
      </table>
      <p style="margin:0;color:rgba(74,16,16,0.5);font-size:12px;text-align:center;">
        Kad telah diterbitkan secara automatik dan aktif selama 6 bulan.
      </p>
    </td>
  </tr>
  <tr>
    <td style="background:#fdf5ee;padding:16px 32px;text-align:center;border-top:1px solid #f0e8df;">
      <p style="margin:0;color:rgba(74,16,16,0.4);font-size:11px;">ekadku.com — Kad Jemputan Digital</p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`

  await transporter.sendMail({
    from: FROM,
    to: "ekadku@gmail.com",
    subject: `[Pesanan Baru] ${customerName} — ${toRM(data.totalAmount)}`,
    html,
  })
}

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
    subject: "Tetapkan Semula Kata Laluan — ekadku.com",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
        <h2 style="margin:0 0 8px;font-size:22px;color:#111">Tetapkan Semula Kata Laluan</h2>
        <p style="color:#555;margin:0 0 24px">
          Kami menerima permintaan untuk menetapkan semula kata laluan akaun ekadku.com anda.
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
          © ${new Date().getFullYear()} ekadku.com · Kad Jemputan Digital
        </p>
      </div>
    `,
  })
}
