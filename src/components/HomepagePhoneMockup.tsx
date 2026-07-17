"use client"

import { useState, useEffect, useRef } from "react"
import { Phone, CirclePlay, CirclePause, MapPin, Gift, Mail, Music, Calendar, Clock, Users, Heart } from "lucide-react"

type FeatureId = "card" | "rsvp" | "lokasi" | "hadiah" | "hubungi" | "muzik"

const SEQUENCE: FeatureId[] = ["card", "rsvp", "lokasi", "hadiah", "hubungi", "muzik"]
const DURATION = 3000

// Creamy + Maroon palette
const BG       = "#fdf5ee"          // warm cream main background
const SHEET_BG = "#f2e4d4"          // deeper cream for sheet overlays
const MAROON   = "#7B1414"          // deep maroon — text, icons, borders
const MAROON_A = "#A83232"          // mid maroon — accents, active elements
const ROSE     = "#c47880"          // soft dusty rose — petal decorations
const TEXT     = "#4a1010"          // near-black maroon for body text
const TEXT_MUT = "rgba(74,16,16,0.52)"

// Static petal positions (no Math.random → no hydration mismatch)
const PETALS = [
  { left: "12%",  delay: "0s",   dur: "7s",   size: 5 },
  { left: "28%",  delay: "1.8s", dur: "6s",   size: 4 },
  { left: "48%",  delay: "0.6s", dur: "8.5s", size: 6 },
  { left: "65%",  delay: "3.1s", dur: "6.5s", size: 4 },
  { left: "80%",  delay: "2s",   dur: "7.5s", size: 5 },
  { left: "90%",  delay: "4.5s", dur: "6s",   size: 3 },
  { left: "38%",  delay: "5.2s", dur: "8s",   size: 4 },
]

// Static QR-like pattern (no Math.random → no hydration mismatch)
const QR_CELLS = [
  1,1,1,1,1,1,0,0,1,0,0,1,1,1,1,1,1,1,0,0,1,1,0,0,1,
  1,0,0,0,1,0,1,0,1,0,1,0,1,0,0,0,1,0,1,1,0,1,0,1,0,
  1,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,
  1,0,0,0,1,0,1,1,1,0,1,0,1,0,0,0,1,0,1,0,0,1,0,1,1,
  1,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,0,0,1,1,0,0,0,1,
  0,0,0,0,0,1,0,1,0,1,0,1,0,0,0,0,0,1,1,0,1,0,1,0,0,
  1,0,1,1,0,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,1,0,1,1,
]

const PROGRAM = [
  { label: "Ketibaan Tetamu", time: "8:30 pagi" },
  { label: "Akad Nikah",      time: "10:00 pagi" },
  { label: "Majlis Resepsi",  time: "12:00 tengah hari" },
  { label: "Majlis Berakhir", time: "3:00 petang" },
]

export function HomepagePhoneMockup() {
  const [idx, setIdx] = useState(0)
  const active: FeatureId = SEQUENCE[idx]
  const scrollRef = useRef<HTMLDivElement>(null)

  // Feature cycling
  useEffect(() => {
    const id = setInterval(() => setIdx(p => (p + 1) % SEQUENCE.length), DURATION)
    return () => clearInterval(id)
  }, [])

  // Auto-scroll — 1px every 30ms (matches "Sederhana"), loops back to top
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let paused = false
    const id = setInterval(() => {
      if (paused) return
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
        paused = true
        setTimeout(() => {
          el.scrollTop = 0
          setTimeout(() => { paused = false }, 300)
        }, 1500)
      } else {
        el.scrollTop += 1
      }
    }, 30)
    return () => clearInterval(id)
  }, [])

  const BUTTONS = [
    { id: "hubungi" as FeatureId, label: "Hubungi", Icon: Phone },
    { id: "muzik"   as FeatureId, label: "Muzik",   Icon: active === "muzik" ? CirclePause : CirclePlay },
    { id: "lokasi"  as FeatureId, label: "Lokasi",  Icon: MapPin },
    { id: "hadiah"  as FeatureId, label: "Hadiah",  Icon: Gift },
    { id: "rsvp"    as FeatureId, label: "RSVP",    Icon: Mail },
  ]

  return (
    <div className="relative float" style={{ width: "min(68vw, 270px)" }}>
      {/* Phone frame */}
      <div
        className="relative rounded-[40px] border-2 shadow-2xl overflow-hidden"
        style={{ aspectRatio: "9/19.5", background: BG, borderColor: `${MAROON}18` }}
      >
        {/* Status bar */}
        <div className="absolute top-0 left-0 right-0 h-7 flex items-center justify-between px-4 z-10" style={{ background: `${BG}e0` }}>
          <span className="text-[8px]" style={{ color: `${MAROON}70` }}>9:41</span>
          <div className="w-14 h-3 bg-black rounded-full" />
          <span className="text-[8px]" style={{ color: `${MAROON}70` }}>●●●</span>
        </div>
        <div className="absolute top-0 left-0 right-0 flex justify-center z-20 pointer-events-none">
          <div className="w-18 h-5 bg-black rounded-b-2xl" />
        </div>
        {/* Animated shimmer separator */}
        <div
          className="absolute top-7 left-0 right-0 h-px z-10"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${MAROON}50 35%, ${MAROON_A} 50%, ${MAROON}50 65%, transparent 100%)`,
            backgroundSize: "200% 100%",
            animation: "shimmer 3s infinite linear",
          }}
        />

        {/* Main card content */}
        <div className="absolute inset-0 pt-8 flex flex-col">

          {/* Content area: scrollable card + animation layer + sheet overlays */}
          <div className="flex-1 relative overflow-hidden">

            {/* ── Falling petal animation layer ── */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              {PETALS.map((p, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: p.left,
                    top: -10,
                    width: p.size,
                    height: p.size * 1.4,
                    borderRadius: "40% 60% 55% 45% / 45% 55% 50% 50%",
                    background: ROSE,
                    opacity: 0.22,
                    animation: `petal-drift ${p.dur} ${p.delay} infinite linear`,
                  }}
                />
              ))}
            </div>

            {/* ── Scrollable card content ── */}
            <div
              ref={scrollRef}
              className="absolute inset-0 overflow-y-auto z-1"
              style={{ scrollbarWidth: "none" }}
            >
              <style>{`div::-webkit-scrollbar{display:none}`}</style>
              <div className="px-4 pt-4 pb-8 flex flex-col items-center">

                {/* Animated shimmer divider */}
                <ShimmerLine />

                <p
                  className="text-[6px] tracking-[0.25em] uppercase mb-1"
                  style={{ color: TEXT_MUT, animation: "fade-up 0.8s 0.2s both" }}
                >
                  Dengan Hormat Menjemput
                </p>
                <p
                  className="text-[6px] tracking-[0.2em] mb-3"
                  style={{ color: `${MAROON}45`, animation: "fade-up 0.8s 0.4s both" }}
                >
                  Ke Majlis Walimatul Urus
                </p>

                {/* Names with entrance animation */}
                <p
                  className="font-great-vibes text-[22px] leading-tight"
                  style={{ color: MAROON, animation: "fade-up 0.9s 0.5s both" }}
                >
                  Ahmad Faris
                </p>
                <p
                  className="text-[10px] my-1"
                  style={{ color: ROSE, animation: "pulse-glow 2.5s 1s infinite" }}
                >
                  ✦
                </p>
                <p
                  className="font-great-vibes text-[22px] leading-tight mb-4"
                  style={{ color: MAROON, animation: "fade-up 0.9s 0.7s both" }}
                >
                  Nur Aisyah
                </p>

                <ShimmerLine faint />

                {/* Date / time / venue */}
                <div className="space-y-1.5 text-center mb-5 mt-3">
                  <div className="flex items-center justify-center gap-1 text-[6.5px]" style={{ color: TEXT_MUT }}>
                    <Calendar className="w-2 h-2 shrink-0" style={{ color: MAROON_A }} />
                    Sabtu, 14 Disember 2025
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[6.5px]" style={{ color: TEXT_MUT }}>
                    <Clock className="w-2 h-2 shrink-0" style={{ color: MAROON_A }} />
                    10:00am - 3:00pm
                  </div>
                  <div className="flex items-center justify-center gap-1 text-[6.5px]" style={{ color: TEXT_MUT }}>
                    <MapPin className="w-2 h-2 shrink-0" style={{ color: MAROON_A }} />
                    Dewan Seri Murni, Kuala Lumpur
                  </div>
                </div>

                {/* Program */}
                <SectionTitle>Atur Cara</SectionTitle>
                <div className="w-full space-y-1.5 mb-5">
                  {PROGRAM.map(({ label, time }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between px-2 py-1.5 rounded"
                      style={{ background: `${MAROON}0c`, border: `1px solid ${MAROON}20` }}
                    >
                      <p className="text-[6.5px]" style={{ color: TEXT }}>{label}</p>
                      <p className="text-[6px] font-medium" style={{ color: MAROON_A }}>{time}</p>
                    </div>
                  ))}
                </div>

                {/* Organizer */}
                <SectionTitle>Daripada</SectionTitle>
                <div className="w-full mb-5 space-y-1">
                  {[
                    { name: "Hj. Ahmad bin Abdul Razak", role: "Bapa Lelaki" },
                    { name: "Hjh. Fatimah binti Ismail", role: "Ibu Perempuan" },
                  ].map(({ name, role }) => (
                    <div key={name} className="text-center">
                      <p className="text-[7px]" style={{ color: TEXT }}>{name}</p>
                      <p className="text-[5.5px]" style={{ color: MAROON_A }}>{role}</p>
                    </div>
                  ))}
                </div>

                {/* Wishes */}
                <SectionTitle>Ucapan</SectionTitle>
                <div className="w-full space-y-1.5 mb-5">
                  {[
                    { name: "Zulaikha Rahim", msg: "Tahniah & semoga bahagia ke akhir hayat! 🌸" },
                    { name: "Hafiz Norizan",  msg: "Selamat pengantin baru, semoga kekal bersama." },
                  ].map(({ name, msg }) => (
                    <div
                      key={name}
                      className="rounded px-2 py-1.5"
                      style={{ background: `${MAROON}08`, border: `1px solid ${MAROON}18` }}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <Heart className="w-2 h-2" style={{ color: ROSE }} />
                        <p className="text-[6px] font-medium" style={{ color: MAROON }}>{name}</p>
                      </div>
                      <p className="text-[6px] leading-relaxed" style={{ color: TEXT_MUT }}>{msg}</p>
                    </div>
                  ))}
                </div>

                {/* Attendance */}
                <div className="flex items-center gap-1.5 mb-3">
                  <Users className="w-3 h-3" style={{ color: MAROON_A }} />
                  <p className="text-[6.5px]" style={{ color: TEXT_MUT }}>247 tetamu telah sahkan kehadiran</p>
                </div>

                {/* Verse footer */}
                <div className="w-full text-center px-2 pt-3 pb-1" style={{ borderTop: `1px solid ${MAROON}18` }}>
                  <p className="text-[5.5px] italic leading-relaxed" style={{ color: `${TEXT}45` }}>
                    &ldquo;Dan di antara tanda-tanda kekuasaanNya ialah Dia menciptakan untukmu pasangan dari jenismu sendiri&rdquo;
                  </p>
                  <p className="text-[5px] mt-0.5" style={{ color: `${MAROON}60` }}>— Surah Ar-Rum (30:21)</p>
                </div>
              </div>
            </div>

            {/* ── Music waveform badge (above scroll, below sheets) ── */}
            <div
              className="absolute top-2 right-3 z-10 flex items-center gap-1 transition-opacity duration-500 pointer-events-none"
              style={{ opacity: active === "muzik" ? 1 : 0 }}
            >
              <Music className="w-2 h-2" style={{ color: MAROON_A }} />
              <div className="flex items-end gap-0.5">
                {[5, 9, 13, 9, 7].map((h, i) => (
                  <div
                    key={i}
                    className="w-0.5 rounded-sm"
                    style={{
                      height: h,
                      background: MAROON_A,
                      animation: active === "muzik" ? `phonebar ${0.6 + i * 0.1}s ease-in-out infinite alternate` : "none",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ── Sheet overlays ── */}

            <Sheet show={active === "rsvp"} title="Kehadiran Anda">
              <Field label="Nama Anda" value="Ahmad Bin Omar" />
              <div className="flex gap-1 mb-2">
                <Pill active>✓ Hadir</Pill>
                <Pill>Tidak Hadir</Pill>
              </div>
              <div className="text-center text-[7px] font-semibold rounded py-1" style={{ background: MAROON, color: BG }}>
                Hantar RSVP
              </div>
            </Sheet>

            <Sheet show={active === "lokasi"} title="Lokasi Majlis">
              <div
                className="rounded mb-2 overflow-hidden flex items-center justify-center relative"
                style={{ height: 56, background: "#e8d4cc", border: `1px solid ${MAROON}20` }}
              >
                <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse at 45% 55%, #d4b8b0 0%, #e8d4cc 65%)" }} />
                <div
                  className="absolute w-2 h-2 rounded-full"
                  style={{ background: MAROON, boxShadow: `0 0 0 4px ${MAROON_A}35`, animation: "pulse-pin 1.5s ease-in-out infinite" }}
                />
              </div>
              <p className="text-[8px] font-medium mb-0.5" style={{ color: TEXT }}>Dewan Seri Murni</p>
              <p className="text-[6px] mb-2" style={{ color: TEXT_MUT }}>Jalan Ampang, 50450 Kuala Lumpur</p>
              <div className="flex gap-1">
                <Pill>🗺 Waze</Pill>
                <Pill>📍 Google Maps</Pill>
              </div>
            </Sheet>

            <Sheet show={active === "hadiah"} title="Info Hadiah">
              <div className="flex flex-col items-center gap-1.5">
                <div className="rounded p-1" style={{ background: "white", width: 56, height: 56, border: `1px solid ${MAROON}25` }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(25, 1fr)", gap: 0.5, width: "100%", height: "100%" }}>
                    {QR_CELLS.map((on, i) => (
                      <div key={i} style={{ background: on ? MAROON : "transparent", borderRadius: 0.5 }} />
                    ))}
                  </div>
                </div>
                <p className="text-[5.5px]" style={{ color: MAROON_A }}>Maybank</p>
                <p className="text-[8.5px] font-mono" style={{ color: TEXT, letterSpacing: 2 }}>1234-5678-9012</p>
                <p className="text-[5.5px]" style={{ color: TEXT_MUT }}>Tuan Hj. Ahmad bin Yusof</p>
              </div>
            </Sheet>

            <Sheet show={active === "hubungi"} title="Hubungi Kami">
              <div className="flex flex-col gap-1.5">
                <div className="rounded flex items-center gap-2 px-2 py-1.5" style={{ background: "#25D366" }}>
                  <span className="text-xs">💬</span>
                  <div>
                    <p className="text-[7.5px] font-semibold text-white">WhatsApp</p>
                    <p className="text-[6px] text-white/80">Encik Ahmad — +60 12-345 6789</p>
                  </div>
                </div>
                <div className="rounded flex items-center gap-2 px-2 py-1.5" style={{ background: `${MAROON}0c`, border: `1px solid ${MAROON}25` }}>
                  <Phone className="w-3 h-3" style={{ color: MAROON }} />
                  <div>
                    <p className="text-[7.5px] font-medium" style={{ color: TEXT }}>Telefon</p>
                    <p className="text-[6px]" style={{ color: TEXT_MUT }}>Puan Rohani — +60 12-987 6543</p>
                  </div>
                </div>
              </div>
            </Sheet>

            <Sheet show={active === "muzik"} title="Muzik Latar">
              <div className="flex flex-col items-center gap-2">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${MAROON}20, ${MAROON}08)`,
                    border: `1px solid ${MAROON}30`,
                    animation: "spin-slow 8s linear infinite",
                  }}
                >
                  <Music className="w-5 h-5" style={{ color: MAROON }} />
                </div>
                <div className="text-center">
                  <p className="text-[8px] font-medium" style={{ color: TEXT }}>Seribu Tahun Menanti</p>
                  <p className="text-[6.5px]" style={{ color: MAROON_A }}>Anuar Zain</p>
                </div>
                <div className="flex items-end gap-0.5" style={{ height: 16 }}>
                  {[5, 10, 14, 8, 12, 7, 11, 6].map((h, i) => (
                    <div
                      key={i}
                      className="rounded-sm"
                      style={{
                        width: 4,
                        height: h,
                        background: MAROON_A,
                        opacity: 0.8,
                        animation: `phonebar ${0.5 + i * 0.08}s ease-in-out infinite alternate`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </Sheet>
          </div>

          {/* Footer — always above sheets */}
          <div
            className="relative shrink-0 flex items-center justify-around px-3 py-2.5"
            style={{ background: BG, borderTop: `1px solid ${MAROON}25`, zIndex: 20 }}
          >
            {BUTTONS.map(({ id, label, Icon }) => {
              const on = active === id
              return (
                <div key={id} className="flex flex-col items-center gap-0.5 transition-all duration-300">
                  <Icon
                    className="w-4 h-4 transition-all duration-300"
                    style={{
                      color: on ? MAROON : `${MAROON}50`,
                      strokeWidth: 1.5,
                      filter: on ? `drop-shadow(0 0 4px ${MAROON_A}80)` : "none",
                    }}
                  />
                  <span
                    className="text-[6px] transition-all duration-300"
                    style={{ color: on ? MAROON : `${MAROON}60` }}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-1 left-0 right-0 flex justify-center z-30">
          <div className="w-12 h-0.5 rounded-full" style={{ background: `${MAROON}25` }} />
        </div>
      </div>

      {/* Floating badge — music */}
      <div
        className="absolute -right-1 sm:-right-8 top-[28%] rounded-2xl px-3 py-2 shadow-xl border"
        style={{ background: "var(--float)", borderColor: "var(--float-bd)" }}
      >
        <div className="flex items-center gap-1.5">
          <Music className="w-3 h-3 text-gold" />
          <span className="text-[11px] font-medium text-[var(--tx-2)]">Muzik aktif</span>
        </div>
      </div>

      {/* Floating badge — link */}
      <div
        className="absolute -left-1 sm:-left-8 bottom-[30%] rounded-2xl px-3 py-2 shadow-xl border border-gold/20"
        style={{ background: "var(--float)" }}
      >
        <p className="text-[9px] text-[var(--tx-3)] mb-0.5">Pautan dikongsi</p>
        <p className="text-[11px] text-gold font-mono font-semibold">ekadku.com/faris</p>
      </div>

      {/* All keyframes */}
      <style>{`
        @keyframes phonebar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
        @keyframes petal-drift {
          0%   { transform: translateY(-12px) rotate(0deg)   translateX(0px);  opacity: 0; }
          12%  { opacity: 0.22; }
          50%  { transform: translateY(220px) rotate(160deg) translateX(8px); }
          88%  { opacity: 0.22; }
          100% { transform: translateY(480px) rotate(290deg) translateX(-6px); opacity: 0; }
        }
        @keyframes shimmer {
          from { background-position: 200% 0; }
          to   { background-position: -200% 0; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50%       { opacity: 1;    transform: scale(1.25); }
        }
        @keyframes pulse-pin {
          0%, 100% { box-shadow: 0 0 0 2px ${MAROON_A}30; }
          50%       { box-shadow: 0 0 0 5px ${MAROON_A}15; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function ShimmerLine({ faint }: { faint?: boolean }) {
  return (
    <div className="flex items-center gap-2 w-full mb-3">
      <div
        className="h-px flex-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${MAROON_A}${faint ? "30" : "60"}, transparent)`,
          backgroundSize: "200% 100%",
          animation: "shimmer 4s infinite linear",
        }}
      />
      {!faint && (
        <span className="text-[7px]" style={{ color: ROSE, animation: "pulse-glow 2.5s infinite" }}>✦</span>
      )}
      {faint && (
        <div className="w-1 h-1 rounded-full" style={{ background: ROSE, opacity: 0.4 }} />
      )}
      <div
        className="h-px flex-1"
        style={{
          background: `linear-gradient(90deg, transparent, ${MAROON_A}${faint ? "30" : "60"}, transparent)`,
          backgroundSize: "200% 100%",
          animation: "shimmer 4s infinite linear",
        }}
      />
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 w-full mb-2">
      <div className="h-px flex-1" style={{ background: `${MAROON}20` }} />
      <p className="text-[6px] tracking-[0.2em] uppercase" style={{ color: MAROON_A }}>{children}</p>
      <div className="h-px flex-1" style={{ background: `${MAROON}20` }} />
    </div>
  )
}

function Sheet({ show, title, children }: { show: boolean; title: string; children: React.ReactNode }) {
  return (
    <div
      className="absolute left-0 right-0 bottom-0 transition-transform duration-500 ease-in-out"
      style={{
        background: SHEET_BG,
        borderTop: `1px solid ${MAROON}25`,
        transform: show ? "translateY(0)" : "translateY(110%)",
        zIndex: 15,
        paddingBottom: 4,
      }}
    >
      <div className="flex items-center px-3 pt-2 pb-1.5" style={{ borderBottom: `1px solid ${MAROON}15` }}>
        <p className="text-[7px] tracking-[0.2em] uppercase" style={{ color: MAROON }}>{title}</p>
      </div>
      <div className="px-3 pt-2">{children}</div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded mb-2 px-2 py-1.5" style={{ background: `${MAROON}08`, border: `1px solid ${MAROON}20` }}>
      <p className="text-[5.5px] mb-0.5" style={{ color: MAROON_A }}>{label}</p>
      <p className="text-[7.5px]" style={{ color: TEXT }}>{value}</p>
    </div>
  )
}

function Pill({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <div
      className="flex-1 text-center text-[6.5px] rounded py-1"
      style={{
        background: active ? `${MAROON}18` : `${MAROON}06`,
        border: active ? `1px solid ${MAROON}` : `1px solid ${MAROON}20`,
        color: active ? MAROON : TEXT_MUT,
      }}
    >
      {children}
    </div>
  )
}
