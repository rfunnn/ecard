import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Terma Perkhidmatan | ekadku.com",
  description: "Terma dan syarat penggunaan perkhidmatan kad jemputan digital ekadku.com.",
  robots: { index: true, follow: false },
}

export default function TermsPage() {
  const updated = "13 Julai 2026"

  return (
    <div className="min-h-screen bg-[var(--pg)]">
      <div className="max-w-2xl mx-auto px-5 py-16 lg:py-24">
        <Link href="/" className="text-xs text-[var(--tx-3)] hover:text-gold transition-colors mb-8 inline-block">
          ← ekadku.com
        </Link>

        <h1 className="font-playfair text-3xl lg:text-4xl text-[var(--tx-1)] mb-2">Terma Perkhidmatan</h1>
        <p className="text-xs text-[var(--tx-3)] mb-10">Dikemaskini: {updated}</p>

        <div className="prose prose-sm prose-neutral max-w-none space-y-8 text-[var(--tx-2)] leading-relaxed">

          <section>
            <h2 className="font-playfair text-lg text-[var(--tx-1)] mb-3">1. Penerimaan Terma</h2>
            <p>
              Dengan menggunakan ekadku.com (&quot;perkhidmatan&quot;), anda bersetuju untuk mematuhi terma ini.
              Jika anda tidak bersetuju, sila hentikan penggunaan perkhidmatan. Kami berhak mengubah
              terma ini pada bila-bila masa dengan notis 14 hari kepada pengguna berdaftar.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-lg text-[var(--tx-1)] mb-3">2. Penerangan Perkhidmatan</h2>
            <p>
              ekadku.com menyediakan platform untuk mencipta, mengurus, dan berkongsi kad jemputan
              digital untuk majlis perkahwinan, hari jadi, dan acara lain. Perkhidmatan termasuk editor
              kad, pengurusan RSVP, galeri foto, dan senarai hadiah.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-lg text-[var(--tx-1)] mb-3">3. Akaun Pengguna</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Anda mesti berumur sekurang-kurangnya 18 tahun untuk mendaftar.</li>
              <li>Anda bertanggungjawab ke atas keselamatan kata laluan akaun anda.</li>
              <li>Satu orang hanya dibenarkan satu akaun.</li>
              <li>Kami berhak menggantung atau menamatkan akaun yang melanggar terma ini.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-playfair text-lg text-[var(--tx-1)] mb-3">4. Pakej dan Pembayaran</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Harga ditunjukkan dalam Ringgit Malaysia (RM) dan termasuk SST jika berkenaan.</li>
              <li>Pembayaran diproses melalui Toyyibpay (FPX). Kami tidak menyimpan maklumat pembayaran anda.</li>
              <li><strong>Dasar Bayaran Balik:</strong> Tiada bayaran balik setelah kad diterbitkan dan boleh diakses oleh tetamu. Jika terdapat masalah teknikal dari pihak kami, hubungi kami dalam 48 jam.</li>
              <li>Pakej memberi akses untuk tempoh yang ditetapkan; kad akan tamat tempoh selepas tarikh yang dipilih.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-playfair text-lg text-[var(--tx-1)] mb-3">5. Kandungan Pengguna</h2>
            <p>Anda mengekalkan pemilikan kandungan yang anda muat naik. Dengan menggunakan perkhidmatan, anda memberi kami lesen terhad untuk menyimpan dan memaparkan kandungan tersebut bagi tujuan perkhidmatan.</p>
            <p className="mt-2">Anda <strong>tidak dibenarkan</strong> memuat naik kandungan yang:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Melanggar hak cipta atau harta intelek pihak lain.</li>
              <li>Mengandungi kandungan lucah, berbahaya, atau menghina.</li>
              <li>Digunakan untuk penipuan atau aktiviti haram.</li>
              <li>Mengandungi perisian hasad atau kod berbahaya.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-playfair text-lg text-[var(--tx-1)] mb-3">6. Harta Intelek</h2>
            <p>
              Templat, reka bentuk, dan kod perisian ekadku.com adalah hak milik kami dan dilindungi
              undang-undang hak cipta Malaysia. Anda tidak dibenarkan menyalin, mengubah suai, atau
              mengedarkan mana-mana bahagian perkhidmatan tanpa kebenaran bertulis.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-lg text-[var(--tx-1)] mb-3">7. Had Liabiliti</h2>
            <p>
              Perkhidmatan disediakan &quot;seadanya&quot;. Kami tidak bertanggungjawab ke atas kehilangan data,
              gangguan perkhidmatan, atau kerosakan tidak langsung. Liabiliti maksimum kami terhad kepada
              jumlah yang anda bayar dalam 3 bulan terakhir.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-lg text-[var(--tx-1)] mb-3">8. Penamatan</h2>
            <p>
              Anda boleh memadam akaun pada bila-bila masa. Kami berhak menamatkan akaun yang
              melanggar terma ini tanpa notis. Selepas penamatan, data anda akan dipadam dalam masa 90 hari.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-lg text-[var(--tx-1)] mb-3">9. Undang-Undang Pentadbiran</h2>
            <p>
              Terma ini ditadbir oleh undang-undang Malaysia. Sebarang pertikaian akan diselesaikan
              di mahkamah Malaysia yang berkenaan.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-lg text-[var(--tx-1)] mb-3">10. Hubungi Kami</h2>
            <p>
              Pertanyaan berkaitan terma ini boleh dihantar kepada:{" "}
              <a href="mailto:ekadku@gmail.com" className="text-gold hover:underline">ekadku@gmail.com</a>
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-[var(--bd)] flex gap-4 text-xs text-[var(--tx-3)]">
          <Link href="/privacy" className="hover:text-gold transition-colors">Dasar Privasi</Link>
          <Link href="/" className="hover:text-gold transition-colors">Laman Utama</Link>
        </div>
      </div>
    </div>
  )
}
