"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import {
  ArrowLeft, Download, Users, Eye, CheckCircle2,
  XCircle, HelpCircle, Search, MessageSquare,
  MapPin, Phone, Music, ExternalLink,
} from "lucide-react"

interface RSVP {
  id: string
  guestName: string
  attendance: "ATTENDING" | "NOT_ATTENDING" | "MAYBE"
  guestCount: number
  message: string | null
  phone: string | null
  createdAt: string
}

interface Props {
  slug: string
  displayName: string
  eventDate: string | null
  primaryColor: string
  bgColor: string
  language: string
  viewCount: number
  rsvps: RSVP[]
  counts: { attending: number; maybe: number; notAttending: number; totalGuests: number }
  analytics: Record<string, number>
}

const ATTENDANCE_LABEL: Record<string, string> = {
  ATTENDING: "Hadir",
  MAYBE: "Mungkin",
  NOT_ATTENDING: "Tidak Hadir",
}
const ATTENDANCE_LABEL_EN: Record<string, string> = {
  ATTENDING: "Attending",
  MAYBE: "Maybe",
  NOT_ATTENDING: "Not Attending",
}

function AttendanceBadge({ status, lang }: { status: string; lang: boolean }) {
  const labels = lang ? ATTENDANCE_LABEL : ATTENDANCE_LABEL_EN
  const cfg = {
    ATTENDING:     { bg: "bg-emerald-50",  text: "text-emerald-700",  border: "border-emerald-200", Icon: CheckCircle2 },
    MAYBE:         { bg: "bg-amber-50",    text: "text-amber-700",    border: "border-amber-200",   Icon: HelpCircle   },
    NOT_ATTENDING: { bg: "bg-red-50",      text: "text-red-600",      border: "border-red-200",     Icon: XCircle      },
  }[status] ?? { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", Icon: HelpCircle }

  const { Icon } = cfg
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon className="w-3 h-3" />
      {labels[status] ?? status}
    </span>
  )
}

export function ReportClient({
  slug, displayName, eventDate, primaryColor, language,
  viewCount, rsvps, counts, analytics,
}: Props) {
  const lang = language === "ms"
  const [search,     setSearch]     = useState("")
  const [filter,     setFilter]     = useState<"ALL" | "ATTENDING" | "MAYBE" | "NOT_ATTENDING">("ALL")
  const [activeTab,  setActiveTab]  = useState<"list" | "wishes">("list")

  const filtered = useMemo(() => {
    let list = rsvps
    if (filter !== "ALL") list = list.filter(r => r.attendance === filter)
    if (search.trim())    list = list.filter(r => r.guestName.toLowerCase().includes(search.toLowerCase()))
    return list
  }, [rsvps, filter, search])

  const wishes = useMemo(() => rsvps.filter(r => r.message?.trim()), [rsvps])

  const exportCsv = useCallback(() => {
    const header = ["Name", "Attendance", "Guests", "Phone", "Message", "Date"]
    const rows = rsvps.map(r => [
      `"${r.guestName.replace(/"/g, '""')}"`,
      r.attendance,
      String(r.guestCount),
      r.phone ?? "",
      `"${(r.message ?? "").replace(/"/g, '""')}"`,
      new Date(r.createdAt).toLocaleDateString("en-MY"),
    ])
    const csv = [header, ...rows].map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href     = url
    a.download = `rsvp-${slug}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [rsvps, slug])

  const statCard = (label: string, value: number | string, sub?: string, color = "text-gray-900") => (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard" className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0">
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </Link>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{displayName}</p>
              {eventDate && <p className="text-xs text-gray-400 truncate">{eventDate}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/invite/${slug}`}
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              {lang ? "Lihat Kad" : "View Card"}
            </Link>
            <button
              onClick={exportCsv}
              disabled={rsvps.length === 0}
              className="flex items-center gap-1.5 text-xs font-semibold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-6 space-y-6">

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statCard(lang ? "Jumlah Paparan" : "Total Views", viewCount)}
          {statCard(lang ? "Hadir" : "Attending", counts.attending, `+${counts.totalGuests} ${lang ? "tetamu" : "guests"}`, "text-emerald-700")}
          {statCard(lang ? "Mungkin" : "Maybe", counts.maybe, undefined, "text-amber-700")}
          {statCard(lang ? "Tidak Hadir" : "Not Attending", counts.notAttending, undefined, "text-red-600")}
        </div>

        {/* ── Analytics row ── */}
        {Object.keys(analytics).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
              {lang ? "Aktiviti" : "Activity"}
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {[
                { key: "RSVP_OPEN",       label: lang ? "Buka RSVP"   : "RSVP Opened",    Icon: Users },
                { key: "RSVP_SUBMIT",     label: lang ? "Hantar RSVP" : "RSVP Submitted",  Icon: CheckCircle2 },
                { key: "MAP_CLICK",       label: lang ? "Klik Peta"   : "Map Clicks",       Icon: MapPin },
                { key: "WHATSAPP_CLICK",  label: lang ? "Klik WhatsApp" : "WhatsApp Clicks", Icon: Phone },
                { key: "MUSIC_PLAY",      label: lang ? "Main Muzik"  : "Music Plays",      Icon: Music },
              ].map(({ key, label, Icon }) =>
                analytics[key] != null ? (
                  <div key={key} className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs font-bold text-gray-900">{analytics[key]}</span>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {(["list", "wishes"] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors ${
                activeTab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "list"
                ? `${lang ? "Senarai RSVP" : "RSVP List"} (${rsvps.length})`
                : `${lang ? "Ucapan" : "Wishes"} (${wishes.length})`}
            </button>
          ))}
        </div>

        {/* ── RSVP List tab ── */}
        {activeTab === "list" && (
          <div className="space-y-3">
            {/* Controls */}
            <div className="flex gap-2 flex-wrap">
              <div className="relative flex-1 min-w-40">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={lang ? "Cari nama..." : "Search name..."}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              </div>
              <select
                value={filter}
                onChange={e => setFilter(e.target.value as typeof filter)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option value="ALL">{lang ? "Semua" : "All"}</option>
                <option value="ATTENDING">{lang ? "Hadir" : "Attending"}</option>
                <option value="MAYBE">{lang ? "Mungkin" : "Maybe"}</option>
                <option value="NOT_ATTENDING">{lang ? "Tidak Hadir" : "Not Attending"}</option>
              </select>
            </div>

            {/* List */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <Users className="w-8 h-8 text-gray-200 mb-3" />
                <p className="text-sm text-gray-400">
                  {rsvps.length === 0
                    ? (lang ? "Belum ada RSVP." : "No RSVPs yet.")
                    : (lang ? "Tiada keputusan." : "No results.")}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden">
                {filtered.map((r, i) => (
                  <div key={r.id} className="px-4 py-3 flex items-start gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                      style={{ background: `${primaryColor}18`, color: primaryColor }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-gray-900">{r.guestName}</span>
                        <AttendanceBadge status={r.attendance} lang={lang} />
                        {r.attendance !== "NOT_ATTENDING" && (
                          <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                            <Users className="w-3 h-3" />{r.guestCount}
                          </span>
                        )}
                      </div>
                      {r.phone && (
                        <p className="text-xs text-gray-400 flex items-center gap-1 mb-0.5">
                          <Phone className="w-3 h-3" />{r.phone}
                        </p>
                      )}
                      {r.message && (
                        <p className="text-xs text-gray-500 italic mt-1 leading-relaxed">
                          &ldquo;{r.message}&rdquo;
                        </p>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-300 shrink-0 pt-0.5">
                      {new Date(r.createdAt).toLocaleDateString("en-MY", { day: "numeric", month: "short" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Wishes tab ── */}
        {activeTab === "wishes" && (
          <div className="space-y-3">
            {wishes.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <MessageSquare className="w-8 h-8 text-gray-200 mb-3" />
                <p className="text-sm text-gray-400">{lang ? "Belum ada ucapan." : "No wishes yet."}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {wishes.map(r => (
                  <div
                    key={r.id}
                    className="bg-white rounded-2xl border border-gray-100 px-5 py-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-semibold text-gray-900">{r.guestName}</span>
                      <AttendanceBadge status={r.attendance} lang={lang} />
                    </div>
                    <p className="text-sm text-gray-600 italic leading-relaxed">
                      &ldquo;{r.message}&rdquo;
                    </p>
                    <p className="text-[10px] text-gray-300 mt-2">
                      {new Date(r.createdAt).toLocaleDateString("en-MY", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
