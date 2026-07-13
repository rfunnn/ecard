import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Dasar Privasi | ekadku.com",
  description: "Dasar privasi ekadku.com — bagaimana kami mengumpul, menggunakan, dan melindungi maklumat peribadi anda.",
  robots: { index: true, follow: false },
}

export default function PrivacyPage() {
  const updated = "13 Julai 2026"

  return (
    <div className="min-h-screen bg-[var(--pg)]">
      <div className="max-w-2xl mx-auto px-5 py-16 lg:py-24">
        <Link href="/" className="text-xs text-[var(--tx-3)] hover:text-gold transition-colors mb-8 inline-block">
          ← ekadku.com
        </Link>

        <h1 className="font-playfair text-3xl lg:text-4xl text-[var(--tx-1)] mb-2">Dasar Privasi</h1>
        <p className="text-xs text-[var(--tx-3)] mb-10">Dikemaskini: {updated}</p>

        <div className="prose prose-sm prose-neutral max-w-none space-y-8 text-[var(--tx-2)] leading-relaxed">

          <section>
            <h2 className="font-playfair text-lg text-[var(--tx-1)] mb-3">1. Pengenalan</h2>
            <p>
              ekadku.com (&quot;kami&quot;, &quot;perkhidmatan&quot;) menghormati privasi anda dan komited untuk melindungi maklumat
              peribadi anda selaras dengan Akta Perlindungan Data Peribadi 2010 (PDPA) Malaysia. Dasar
              ini menerangkan bagaimana kami mengumpul, menggunakan, dan melindungi maklumat anda.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-lg text-[var(--tx-1)] mb-3">2. Maklumat yang Kami Kumpul</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Maklumat akaun:</strong> nama, alamat e-mel, kata laluan (disimpan dalam bentuk hash).</li>
              <li><strong>Maklumat kad jemputan:</strong> nama majlis, tarikh, lokasi, gambar, dan maklumat tetamu yang anda masukkan.</li>
              <li><strong>Maklumat pembayaran:</strong> rekod transaksi diproses oleh Toyyibpay — kami tidak menyimpan maklumat kad kredit/debit.</li>
              <li><strong>Data penggunaan:</strong> bilangan paparan kad, RSVP yang diterima, analitik asas tanpa maklumat peribadi tetamu.</li>
              <li><strong>Log teknikal:</strong> alamat IP, jenis pelayar, masa akses — untuk keselamatan dan penyelesaian masalah sahaja.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-playfair text-lg text-[var(--tx-1)] mb-3">3. Bagaimana Kami Menggunakan Maklumat Anda</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Menyediakan dan menguruskan perkhidmatan kad jemputan digital.</li>
              <li>Memproses pembayaran dan mengesahkan pesanan.</li>
              <li>Menghantar e-mel berkaitan akaun (tetapan semula kata laluan, pengesahan).</li>
              <li>Meningkatkan perkhidmatan berdasarkan corak penggunaan secara agregat.</li>
              <li>Mematuhi keperluan undang-undang Malaysia.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-playfair text-lg text-[var(--tx-1)] mb-3">4. Perkongsian Maklumat dengan Pihak Ketiga</h2>
            <p>Kami tidak menjual maklumat peribadi anda. Maklumat dikongsi hanya dengan:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong>Toyyibpay</strong> — memproses bayaran anda. Tertakluk kepada dasar privasi Toyyibpay.</li>
              <li><strong>Google</strong> — jika anda log masuk menggunakan Google OAuth. Tertakluk kepada Dasar Privasi Google.</li>
              <li><strong>Pembekal infrastruktur</strong> — pelayan VPS dan storan objek untuk hosting aplikasi.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-playfair text-lg text-[var(--tx-1)] mb-3">5. Storan dan Keselamatan Data</h2>
            <p>
              Data disimpan di pelayan dalam Malaysia atau rantau Asia Tenggara. Kami menggunakan HTTPS,
              kata laluan di-hash, token selamat, dan pembatasan kadar akses untuk melindungi akaun anda.
              Gambar dan fail disimpan dalam storan objek yang disulitkan.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-lg text-[var(--tx-1)] mb-3">6. Tempoh Penyimpanan Data</h2>
            <p>
              Maklumat akaun disimpan selagi akaun anda aktif. Kad jemputan yang tamat tempoh disimpan
              selama 90 hari selepas tarikh luput sebelum dipadam secara automatik. Anda boleh meminta
              pemadaman akaun pada bila-bila masa melalui e-mel di bawah.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-lg text-[var(--tx-1)] mb-3">7. Hak Anda di Bawah PDPA</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Mengakses maklumat peribadi yang kami simpan tentang anda.</li>
              <li>Membetulkan maklumat yang tidak tepat.</li>
              <li>Meminta pemadaman akaun dan data anda.</li>
              <li>Menarik balik kebenaran pemprosesan data pada bila-bila masa.</li>
            </ul>
            <p className="mt-2">Untuk menggunakan hak ini, hubungi kami di <a href="mailto:ekadku@gmail.com" className="text-gold hover:underline">ekadku@gmail.com</a>.</p>
          </section>

          <section>
            <h2 className="font-playfair text-lg text-[var(--tx-1)] mb-3">8. Kuki (Cookies)</h2>
            <p>
              Kami menggunakan kuki sesi yang diperlukan untuk log masuk dan keselamatan sahaja. Tiada
              kuki penjejakan pihak ketiga atau pengiklanan digunakan.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-lg text-[var(--tx-1)] mb-3">9. Hubungi Kami</h2>
            <p>
              Sebarang pertanyaan berkaitan privasi boleh dihantar kepada:{" "}
              <a href="mailto:ekadku@gmail.com" className="text-gold hover:underline">ekadku@gmail.com</a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-[var(--bd)] flex gap-4 text-xs text-[var(--tx-3)]">
          <Link href="/terms" className="hover:text-gold transition-colors">Terma Perkhidmatan</Link>
          <Link href="/" className="hover:text-gold transition-colors">Laman Utama</Link>
        </div>
      </div>
    </div>
  )
}
