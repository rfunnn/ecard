"use client"

import { useState, FormEvent } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("")
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/auth/forgot-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ email }),
    })

    setLoading(false)

    if (!res.ok) {
      const body = await res.json()
      setError(body.error ?? "Sesuatu telah berlaku. Cuba lagi.")
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Semak E-mel Anda</h2>
          <p className="text-sm text-gray-500 mb-6">
            Kami telah menghantar pautan tetapan semula kata laluan ke{" "}
            <span className="font-semibold text-gray-800">{email}</span>.
            Pautan sah selama 1 jam.
          </p>
          <Link href="/login" className="text-sm text-gray-900 font-semibold hover:underline">
            Kembali ke Log Masuk
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Lupa Kata Laluan?</h1>
        <p className="text-sm text-gray-500 mb-6">
          Masukkan e-mel anda dan kami akan hantar pautan untuk menetapkan semula kata laluan.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mel</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="anda@contoh.com"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Menghantar…" : "Hantar Pautan Tetapan Semula"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="text-gray-900 font-semibold hover:underline">
            ← Kembali ke Log Masuk
          </Link>
        </p>
      </div>
    </div>
  )
}
