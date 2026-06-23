import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatEventDate(date: string | Date, locale = "ms-MY"): string {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date))
}

export function buildWhatsAppUrl(phone: string, message?: string): string {
  const cleaned = phone.replace(/\D/g, "")
  const normalized = cleaned.startsWith("0") ? `60${cleaned.slice(1)}` : cleaned
  const params = message ? `?text=${encodeURIComponent(message)}` : ""
  return `https://wa.me/${normalized}${params}`
}
