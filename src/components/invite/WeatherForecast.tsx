"use client"

import { useEffect, useState, type ReactNode } from "react"
import type { WizardConfig } from "@/types/config"

// ── Coordinate extraction ─────────────────────────────────────────────────────
// The venue's lat/lng is derived, in priority order, from the explicit GPS field,
// then a Google Maps URL (?q=lat,lng or @lat,lng), then a Waze URL (ll=lat,lng).
export function parseVenueCoords(
  cfg: Pick<WizardConfig, "gpsCoordinates" | "googleMapsUrl" | "wazeUrl"> | undefined | null
): { lat: number; lng: number } | null {
  if (!cfg) return null

  const pair = (a?: string, b?: string) => {
    const lat = Number(a)
    const lng = Number(b)
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return { lat, lng }
    }
    return null
  }

  const gps = cfg.gpsCoordinates?.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/)
  if (gps) { const c = pair(gps[1], gps[2]); if (c) return c }

  const maps = cfg.googleMapsUrl ?? ""
  const mq = maps.match(/[?&]q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/) || maps.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (mq) { const c = pair(mq[1], mq[2]); if (c) return c }

  const waze = cfg.wazeUrl ?? ""
  const wz = waze.match(/ll=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/) || waze.match(/to=ll\.(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/)
  if (wz) { const c = pair(wz[1], wz[2]); if (c) return c }

  return null
}

// ── WMO weather code → icon + label ───────────────────────────────────────────
const WMO: Record<number, { ms: string; en: string; icon: string }> = {
  0:  { ms: "Cerah",                 en: "Clear sky",       icon: "☀️" },
  1:  { ms: "Cerah berjerebu",       en: "Mainly clear",    icon: "🌤️" },
  2:  { ms: "Berawan sebahagian",    en: "Partly cloudy",   icon: "⛅" },
  3:  { ms: "Mendung",               en: "Overcast",        icon: "☁️" },
  45: { ms: "Berkabus",              en: "Fog",             icon: "🌫️" },
  48: { ms: "Berkabus",              en: "Rime fog",        icon: "🌫️" },
  51: { ms: "Gerimis ringan",        en: "Light drizzle",   icon: "🌦️" },
  53: { ms: "Gerimis",               en: "Drizzle",         icon: "🌦️" },
  55: { ms: "Gerimis lebat",         en: "Dense drizzle",   icon: "🌦️" },
  56: { ms: "Gerimis sejuk",         en: "Freezing drizzle",icon: "🌧️" },
  57: { ms: "Gerimis sejuk",         en: "Freezing drizzle",icon: "🌧️" },
  61: { ms: "Hujan ringan",          en: "Light rain",      icon: "🌦️" },
  63: { ms: "Hujan",                 en: "Rain",            icon: "🌧️" },
  65: { ms: "Hujan lebat",           en: "Heavy rain",      icon: "🌧️" },
  66: { ms: "Hujan sejuk",           en: "Freezing rain",   icon: "🌧️" },
  67: { ms: "Hujan sejuk",           en: "Freezing rain",   icon: "🌧️" },
  71: { ms: "Salji ringan",          en: "Light snow",      icon: "🌨️" },
  73: { ms: "Salji",                 en: "Snow",            icon: "🌨️" },
  75: { ms: "Salji lebat",           en: "Heavy snow",      icon: "❄️" },
  77: { ms: "Butiran salji",         en: "Snow grains",     icon: "🌨️" },
  80: { ms: "Hujan renyai",          en: "Rain showers",    icon: "🌦️" },
  81: { ms: "Hujan",                 en: "Rain showers",    icon: "🌧️" },
  82: { ms: "Hujan lebat",           en: "Heavy showers",   icon: "⛈️" },
  85: { ms: "Hujan salji",           en: "Snow showers",    icon: "🌨️" },
  86: { ms: "Hujan salji lebat",     en: "Snow showers",    icon: "❄️" },
  95: { ms: "Ribut petir",           en: "Thunderstorm",    icon: "⛈️" },
  96: { ms: "Ribut petir + hujan batu", en: "Thunderstorm, hail", icon: "⛈️" },
  99: { ms: "Ribut petir + hujan batu", en: "Thunderstorm, hail", icon: "⛈️" },
}

interface Forecast {
  code: number
  tmax: number
  tmin: number
  rainText: string | null
}

const pad = (n: number) => String(n).padStart(2, "0")
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

interface Props {
  lat: number
  lng: number
  eventDate?: string
  language: string
  bodyColor: string
  primaryColor: string
  headFont: string
  bodyFont: string
  venueName?: string
  divider?: ReactNode
}

// Venue weather for the wedding day. Uses Open-Meteo (no API key, CORS-enabled).
// Within the 16-day forecast horizon it shows the real forecast; beyond that it
// falls back to the same calendar date last year as a seasonal estimate.
// Results are cached in sessionStorage so scrolling / remounting doesn't refetch,
// and the section stays hidden until data is ready (no loading flash).
export function WeatherForecast({
  lat, lng, eventDate, language, bodyColor, primaryColor, headFont, bodyFont, venueName, divider,
}: Props) {
  const isMs = language === "ms"
  const [data, setData] = useState<Forecast | null>(null)

  useEffect(() => {
    if (!eventDate) return
    const target = new Date(eventDate)
    if (isNaN(target.getTime())) return

    const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
    const daysAhead = Math.round((startOf(target) - startOf(new Date())) / 86_400_000)
    if (daysAhead < 0) return // event already passed

    const withinForecast = daysAhead <= 15
    const day = withinForecast
      ? ymd(target)
      : ymd(new Date(target.getFullYear() - 1, target.getMonth(), target.getDate()))
    const cacheKey = `wx:${lat.toFixed(3)},${lng.toFixed(3)}:${withinForecast ? "f" : "e"}:${day}:${isMs ? "ms" : "en"}`

    // Session cache — avoids refetching on scroll / gate-open / remount.
    try {
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) { setData(JSON.parse(cached) as Forecast); return }
    } catch { /* sessionStorage unavailable — ignore */ }

    const url = withinForecast
      ? `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&timezone=auto&start_date=${day}&end_date=${day}`
      : `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum` +
        `&timezone=auto&start_date=${day}&end_date=${day}`

    const controller = new AbortController()
    fetch(url, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => {
        const d = json?.daily
        const code = d?.weather_code?.[0]
        const tmax = d?.temperature_2m_max?.[0]
        const tmin = d?.temperature_2m_min?.[0]
        if (code == null || tmax == null || tmin == null) return

        let rainText: string | null = null
        if (withinForecast) {
          const p = d?.precipitation_probability_max?.[0]
          if (p != null) rainText = isMs ? `${p}% kemungkinan hujan` : `${p}% chance of rain`
        } else {
          const mm = d?.precipitation_sum?.[0]
          if (mm != null && mm >= 1) rainText = isMs ? "Hujan direkodkan" : "Rain recorded"
        }

        const fc: Forecast = {
          code, tmax: Math.round(tmax), tmin: Math.round(tmin), rainText,
        }
        setData(fc)
        try { sessionStorage.setItem(cacheKey, JSON.stringify(fc)) } catch { /* ignore quota */ }
      })
      .catch(() => { /* network/abort — stay hidden */ })

    return () => controller.abort()
  }, [lat, lng, eventDate, isMs])

  // Stay hidden until there's real data — no loading spinner / layout flash.
  if (!data) return null
  const info = WMO[data.code] ?? { ms: "Cuaca", en: "Weather", icon: "🌡️" }

  // "Forecast on <event date>" caption (date only — no time)
  const eventLabel = (() => {
    if (!eventDate) return null
    const d = new Date(eventDate)
    if (isNaN(d.getTime())) return null
    const locale = isMs ? "ms-MY" : "en-MY"
    return d.toLocaleDateString(locale, { weekday: "short", day: "numeric", month: "short", year: "numeric" })
  })()

  return (
    <div className="pb-4 text-center">
      {divider}
      <p
        className={`${headFont} text-[10px] tracking-[0.35em] uppercase opacity-90 mb-3`}
        style={{ color: bodyColor }}
      >
        {isMs ? "Ramalan Cuaca" : "Weather Forecast"}
      </p>

      {venueName && (
        <p className={`${bodyFont} text-xs opacity-60 mb-3`} style={{ color: bodyColor }}>
          {venueName}
        </p>
      )}

      <div className="flex flex-col items-center gap-1">
        <span className="text-4xl leading-none" role="img" aria-label={isMs ? info.ms : info.en}>
          {info.icon}
        </span>
        <p className={`${bodyFont} text-sm font-medium`} style={{ color: bodyColor }}>
          {isMs ? info.ms : info.en}
        </p>
        <p className={`${headFont} text-lg font-bold leading-none`} style={{ color: primaryColor }}>
          {data.tmin}° – {data.tmax}°C
        </p>
        {data.rainText && (
          <p className={`${bodyFont} text-xs opacity-70`} style={{ color: bodyColor }}>
            💧 {data.rainText}
          </p>
        )}
        {eventLabel && (
          <p className={`${bodyFont} text-[10px] opacity-45 mt-1`} style={{ color: bodyColor }}>
            {isMs ? "Ramalan pada " : "Forecast on "}{eventLabel}
          </p>
        )}
      </div>
    </div>
  )
}
