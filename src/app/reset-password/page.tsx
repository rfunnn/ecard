"use client"

import { useState, FormEvent, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"

function ResetForm() {
  const params  = useSearchParams()
  const router  = useRouter()
  const token   = params.get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirm,  setConfirm]  = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-600 text-sm mb-4">Pautan tidak sah. Sila minta pautan baharu.</p>
        <Link href="/forgot-password" className="text-gray-900 font-semibold hover:underline text-sm">
          Minta Pautan Baharu
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirm) {
      setError("Kata laluan tidak sepadan.")
      return
    }

    setLoading(true)

    const res = await fetch("/api/auth/reset-password", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token, password }),
    })

    setLoading(false)

    if (!res.ok) {
      const body = await res.json()
      setError(body.error ?? "Gagal menetapkan semula kata laluan.")
      return
    }

    setDone(true)
    setTimeout(() => router.push("/login"), 2500)
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Kata Laluan Diubah!</h2>
        <p className="text-sm text-gray-500">Mengalihkan ke log masuk…</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kata Laluan Baharu</label>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="Sekurang-kurangnya 8 aksara"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sahkan Kata Laluan</label>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          placeholder="Taip semula kata laluan"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Menyimpan…" : "Tetapkan Semula Kata Laluan"}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Kata Laluan Baharu</h1>
        <p className="text-sm text-gray-500 mb-6">Pilih kata laluan baharu untuk akaun anda.</p>
        <Suspense fallback={<div className="text-center text-sm text-gray-400">Memuatkan…</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}
