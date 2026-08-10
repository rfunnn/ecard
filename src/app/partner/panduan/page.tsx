import { getServerSession } from "next-auth"
import Link from "next/link"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import {
  Globe, CreditCard, FileText, BadgeCheck, LayoutDashboard,
  Users, ChevronRight, MessageCircleQuestion,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function PartnerPanduanPage() {
  const session = await getServerSession(authOptions)

  let partnerRate: number | null = null
  let partnerSlug: string | null = null
  let isPartner = false

  if (session?.user?.email) {
    const partner = await prisma.partner.findUnique({
      where: { email: session.user.email.toLowerCase() },
      select: { partnerRate: true, slug: true, status: true },
    })
    if (partner) {
      isPartner = true
      partnerRate = partner.partnerRate
      partnerSlug = partner.slug
    }
  }

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "ekadku.com"
  const rateDisplay = partnerRate !== null
    ? `RM${(partnerRate / 100).toFixed(2)}`
    : "RM1.00–RM5.00"

  return (
    <div className="min-h-screen bg-[var(--pg)]">
      <header className="sticky top-0 z-20 bg-[var(--pg-alt)] border-b border-[var(--bd)]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link href="/" className="text-sm font-bold text-gold">ekadku.com</Link>
          <span className="text-xs text-[var(--tx-3)] font-medium uppercase tracking-wide">Panduan Partner</span>
          {isPartner ? (
            <Link href="/partner/dashboard" className="text-xs text-[var(--tx-2)] hover:text-[var(--tx-1)] transition-colors">
              Dashboard
            </Link>
          ) : (
            <Link href="/partner/register" className="text-xs font-semibold text-gold hover:opacity-80 transition-opacity">
              Daftar Sekarang
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* Hero */}
        <div className="text-center space-y-3 py-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-[11px] font-semibold uppercase tracking-wider">
            Program Partner Ekadku
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--tx-1)] leading-snug">
            Jual e-kad atas nama<br />perniagaan anda sendiri
          </h1>
          <p className="text-sm text-[var(--tx-2)] max-w-lg mx-auto leading-relaxed">
            Dapatkan subdomain peribadi, storefront berjenama, dan jana pendapatan setiap kali pelanggan anda mencipta e-kad melalui pautan anda.
          </p>
          {!isPartner && (
            <Link
              href="/partner/register"
              className="inline-flex items-center gap-1.5 mt-2 px-5 py-2.5 rounded-full bg-gold text-black text-sm font-bold hover:opacity-90 transition-opacity"
            >
              Mulakan Sekarang <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Benefits */}
        <section className="space-y-3">
          <SectionHeading>Faedah Menjadi Partner</SectionHeading>
          <div className="grid sm:grid-cols-2 gap-3">
            <BenefitCard
              icon={<Globe className="w-5 h-5 text-gold" />}
              title="Subdomain Anda Sendiri"
              desc={`Storefront peribadi di ${partnerSlug ? `${partnerSlug}.${baseDomain}` : `nama-anda.${baseDomain}`} — berjenama, profesional, terus boleh dikongsi kepada pelanggan.`}
            />
            <BenefitCard
              icon={<LayoutDashboard className="w-5 h-5 text-gold" />}
              title="Dashboard Partner"
              desc="Pantau jumlah kad yang diwujudkan, jumlah pelanggan, dan amaun bil terkumpul dalam satu papan pemuka."
            />
            <BenefitCard
              icon={<Users className="w-5 h-5 text-gold" />}
              title="Pelanggan Anda, Jenama Anda"
              desc="Pelanggan yang menggunakan storefront anda akan melihat jenama perniagaan anda — bukan Ekadku."
            />
            <BenefitCard
              icon={<BadgeCheck className="w-5 h-5 text-gold" />}
              title="Tiada Kos Pendaftaran"
              desc="Daftar percuma. Anda hanya dibil berdasarkan jumlah e-kad yang diwujudkan oleh pelanggan anda."
            />
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-3">
          <SectionHeading>Cara Ia Berfungsi</SectionHeading>
          <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-2xl divide-y divide-[var(--bd)]">
            {[
              {
                step: "1",
                title: "Daftar sebagai Partner",
                body: "Isi borang pendaftaran dengan maklumat perniagaan anda. Pihak Ekadku akan menyemak dan meluluskan permohonan dalam masa 1–2 hari bekerja.",
              },
              {
                step: "2",
                title: "Dapatkan subdomain anda",
                body: `Setelah diluluskan, anda mendapat storefront unik di ${partnerSlug ? `${partnerSlug}.${baseDomain}` : `nama-anda.${baseDomain}`}. Kongsi pautan ini kepada pelanggan, letak dalam brosur, atau skan kod QR.`,
              },
              {
                step: "3",
                title: "Pelanggan buat e-kad",
                body: "Setiap kali pelanggan anda mencipta e-kad menggunakan storefront anda, satu rekod penggunaan dicatat secara automatik.",
              },
              {
                step: "4",
                title: "Terima invois bulanan",
                body: "Setiap bulan, Ekadku menjana invois berdasarkan jumlah e-kad yang diwujudkan dalam bulan tersebut. Invois dihantar melalui dashboard partner anda.",
              },
              {
                step: "5",
                title: "Bayar & teruskan perkhidmatan",
                body: "Selesaikan pembayaran invois dalam tempoh yang ditetapkan. Perkhidmatan partner anda kekal aktif selagi tiada bil tertunggak.",
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="flex gap-4 px-5 py-4">
                <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/25 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[11px] font-black text-gold">{step}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--tx-1)]">{title}</p>
                  <p className="text-sm text-[var(--tx-2)] mt-0.5 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="space-y-3">
          <SectionHeading>Harga</SectionHeading>
          <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--tx-1)]">Kadar per e-kad</p>
                <p className="text-xs text-[var(--tx-3)] mt-0.5">
                  {partnerRate !== null
                    ? "Kadar ditetapkan khusus untuk akaun anda"
                    : "Kadar ditetapkan oleh Ekadku berdasarkan pakej yang dipilih"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-gold">{rateDisplay}</p>
                <p className="text-[11px] text-[var(--tx-3)]">setiap e-kad</p>
              </div>
            </div>
            <div className="border-t border-[var(--bd)] pt-4 space-y-2 text-sm text-[var(--tx-2)]">
              <p>• Bil dikira berdasarkan <strong className="text-[var(--tx-1)]">bilangan e-kad</strong> yang diwujudkan dalam sebulan</p>
              <p>• E-kad yang dibatal atau dihapus <strong className="text-[var(--tx-1)]">tidak dikira</strong> dalam bil</p>
              <p>• Tiada bayaran bulanan tetap — bayar ikut penggunaan sahaja</p>
              <p>• Kadar boleh dikemas kini oleh Ekadku — anda akan dimaklumkan terlebih dahulu</p>
            </div>
          </div>
        </section>

        {/* Billing */}
        <section className="space-y-3">
          <SectionHeading>Bil & Invois</SectionHeading>
          <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-2xl divide-y divide-[var(--bd)]">
            <InfoRow
              icon={<FileText className="w-4 h-4 text-[var(--tx-3)]" />}
              label="Bila invois dijana?"
              value="Setiap awal bulan untuk penggunaan bulan sebelumnya. Contoh: invois bulan Julai dijana pada 1 Ogos."
            />
            <InfoRow
              icon={<CreditCard className="w-4 h-4 text-[var(--tx-3)]" />}
              label="Cara pembayaran"
              value="Pembayaran melalui pindahan bank (FPX / transfer terus). Butiran akaun bank disertakan dalam invois."
            />
            <InfoRow
              icon={<FileText className="w-4 h-4 text-[var(--tx-3)]" />}
              label="Tarikh akhir pembayaran"
              value="14 hari dari tarikh invois dikeluarkan. Status invois bertukar kepada 'Tertunggak' jika tidak diselesaikan."
            />
            <InfoRow
              icon={<BadgeCheck className="w-4 h-4 text-[var(--tx-3)]" />}
              label="Semak invois"
              value="Semua invois boleh dilihat di dashboard partner anda di bawah menu Bil & Invois."
            />
          </div>
        </section>

        {/* Subdomain */}
        <section className="space-y-3">
          <SectionHeading>Subdomain Anda</SectionHeading>
          <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-2xl p-5 space-y-4">
            {partnerSlug ? (
              <div className="flex items-center gap-3 bg-[var(--pg)] border border-[var(--bd)] rounded-xl px-4 py-3">
                <Globe className="w-4 h-4 text-gold shrink-0" />
                <span className="font-mono text-sm text-[var(--tx-1)]">https://{partnerSlug}.{baseDomain}</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-[var(--pg)] border border-[var(--bd)] rounded-xl px-4 py-3">
                <Globe className="w-4 h-4 text-[var(--tx-3)] shrink-0" />
                <span className="font-mono text-sm text-[var(--tx-3)]">https://nama-anda.{baseDomain}</span>
              </div>
            )}
            <div className="space-y-2 text-sm text-[var(--tx-2)]">
              <p>• Subdomain ditetapkan semasa pendaftaran berdasarkan nama perniagaan anda</p>
              <p>• Storefront anda memaparkan template e-kad yang tersedia di platform Ekadku</p>
              <p>• Pelanggan anda terus ke storefront anda — tiada promosi Ekadku dipaparkan</p>
              <p>• Subdomain <strong className="text-[var(--tx-1)]">tidak boleh ditukar</strong> selepas akaun diluluskan — pilih dengan teliti semasa daftar</p>
              <p>• Anda boleh kongsikan kod QR dari dashboard untuk memudahkan pelanggan mencapai storefront</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-3">
          <SectionHeading>Soalan Lazim</SectionHeading>
          <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-2xl divide-y divide-[var(--bd)]">
            {[
              {
                q: "Bolehkah pelanggan saya membuat e-kad sendiri?",
                a: "Ya. Pelanggan anda layari storefront anda, pilih template, dan buat e-kad sendiri. Anda tidak perlu membantu setiap proses.",
              },
              {
                q: "Adakah pelanggan saya nampak nama Ekadku?",
                a: "Tidak. Storefront berjalan di bawah subdomain anda. Jenama Ekadku tidak dipaparkan kepada pelanggan anda.",
              },
              {
                q: "Apakah yang berlaku jika saya tidak bayar invois?",
                a: "Invois akan bertukar ke status 'Tertunggak'. Akaun partner anda mungkin digantung sehingga pembayaran diselesaikan.",
              },
              {
                q: "Bolehkah saya tetapkan harga sendiri kepada pelanggan?",
                a: "Ya. Harga yang anda kenakan kepada pelanggan anda adalah urusan perniagaan anda sendiri. Ekadku hanya mengenakan kadar partner yang telah ditetapkan kepada anda.",
              },
              {
                q: "Berapa lama untuk permohonan diluluskan?",
                a: "Biasanya 1–2 hari bekerja. Anda akan menerima notifikasi melalui e-mel apabila akaun diluluskan.",
              },
              {
                q: "Bagaimana jika ada masalah atau pertanyaan?",
                a: "Hubungi kami melalui support@ekadku.com. Kami sedia membantu dalam masa 24 jam.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="px-5 py-4">
                <p className="text-sm font-semibold text-[var(--tx-1)] flex items-start gap-2">
                  <MessageCircleQuestion className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  {q}
                </p>
                <p className="text-sm text-[var(--tx-2)] mt-1.5 ml-6 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center py-6 space-y-3">
          {isPartner ? (
            <>
              <p className="text-sm text-[var(--tx-2)]">Ada soalan lain? Hubungi kami.</p>
              <a href="mailto:support@ekadku.com" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-[var(--bd)] text-sm font-semibold text-[var(--tx-1)] hover:border-gold/40 transition-colors">
                support@ekadku.com
              </a>
            </>
          ) : (
            <>
              <p className="text-sm text-[var(--tx-2)]">Bersedia untuk bermula?</p>
              <Link
                href="/partner/register"
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-gold text-black text-sm font-bold hover:opacity-90 transition-opacity"
              >
                Daftar Sebagai Partner <ChevronRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>

      </main>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-bold text-[var(--tx-3)] uppercase tracking-widest">{children}</h2>
  )
}

function BenefitCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-[var(--pg-alt)] border border-[var(--bd)] rounded-xl p-4 space-y-2">
      <div className="w-9 h-9 rounded-lg bg-gold/10 border border-gold/15 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-sm font-semibold text-[var(--tx-1)]">{title}</p>
      <p className="text-sm text-[var(--tx-2)] leading-relaxed">{desc}</p>
    </div>
  )
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-3 px-5 py-4">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-[var(--tx-3)] uppercase tracking-wide">{label}</p>
        <p className="text-sm text-[var(--tx-2)] mt-0.5 leading-relaxed">{value}</p>
      </div>
    </div>
  )
}
