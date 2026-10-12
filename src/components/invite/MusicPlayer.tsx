"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import type { MediaConfig } from "@/types/invitation"
import { getYoutubeEmbedUrl } from "@/lib/youtube"

interface MusicPlayerProps {
  media: MediaConfig
  onAnalytic?: (event: string) => void
  toggleRef?: React.MutableRefObject<(() => void) | undefined>
  onMuteChange?: (muted: boolean) => void
  startSeconds?: number
}

export function MusicPlayer({ media, onAnalytic, toggleRef, onMuteChange, startSeconds = 0 }: MusicPlayerProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [playerReady, setPlayerReady] = useState(false)
  const [mounted, setMounted] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | undefined>(undefined)
  const analyticFiredRef = useRef(false)
  const retryTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  // Mirror of isMuted for event handlers; and whether the user explicitly muted.
  const mutedRef = useRef(true)
  const userMutedRef = useRef(false)
  // Reflects the LAST unmute/mute the user (or auto-logic) intended. Used so that
  // player state events we receive while muted don't get misread as a user action.
  const wantAudioRef = useRef(false)

  const { youtubeVideoId, audioEnabled, volume, loopAudio } = media

  useEffect(() => { setMounted(true) }, [])

  const origin = useMemo(() => (mounted ? window.location.origin : ""), [mounted])

  const sendCommand = useCallback((func: string, args?: unknown[]) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: args ?? [] }),
      "*"
    )
  }, [])

  // Ask YouTube to start streaming state events (infoDelivery) back to us. Without
  // this handshake the embed is silent about its real mute/playing state, so we can
  // never tell whether an unMute command actually took effect.
  const startListening = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "listening", id: "ekad-music", channel: "widget" }),
      "*"
    )
  }, [])

  const clearRetries = useCallback(() => {
    retryTimersRef.current.forEach(clearTimeout)
    retryTimersRef.current = []
  }, [])

  // Unmute is best-effort: the iframe may not have finished initialising when the
  // command is first posted (YouTube silently drops commands sent too early), so we
  // re-send play + unmute + setVolume on a short retry schedule. We also explicitly
  // playVideo because autoplay can be blocked outright (not merely muted), in which
  // case unmuting a still-paused video produces no sound.
  const unmute = useCallback(() => {
    const vol = Math.round((volume ?? 0.5) * 100)
    const push = () => {
      sendCommand("playVideo")
      sendCommand("unMute")
      sendCommand("setVolume", [vol])
    }
    wantAudioRef.current = true
    clearRetries()
    push()
    retryTimersRef.current = [250, 600, 1200, 2000].map((ms) => setTimeout(push, ms))
    setIsMuted(false)
    if (!analyticFiredRef.current) {
      analyticFiredRef.current = true
      onAnalytic?.("MUSIC_PLAY")
    }
  }, [sendCommand, volume, onAnalytic, clearRetries])

  const mute = useCallback(() => {
    wantAudioRef.current = false
    userMutedRef.current = true
    clearRetries()
    sendCommand("mute")
    setIsMuted(true)
  }, [sendCommand, clearRetries])

  useEffect(() => { mutedRef.current = isMuted }, [isMuted])

  // Detect YouTube iframe API ready/state events and reconcile our icon with the
  // player's REAL mute state, so the toolbar never claims audio is playing when the
  // browser has actually blocked or muted it.
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data
        if (data?.event === "onReady") setPlayerReady(true)
        const info = data?.info
        if (info) {
          // playerState 1 = playing (video has started even if muted)
          if (info.playerState === 1) setPlayerReady(true)
          // Reconcile icon with the player's actual mute state. Only trust it once
          // we've asked for audio — before that the player is legitimately muted.
          if (typeof info.muted === "boolean" && wantAudioRef.current) {
            const reallyMuted = info.muted || info.volume === 0
            setIsMuted(reallyMuted)
          }
        }
      } catch {}
    }
    window.addEventListener("message", handleMessage)
    // Fallback in case postMessage events don't arrive (cross-origin timing)
    const fallback = setTimeout(() => setPlayerReady(true), 1000)
    return () => {
      window.removeEventListener("message", handleMessage)
      clearTimeout(fallback)
    }
  }, [])

  // Keep nudging the listening handshake until the player reports ready, so the
  // reconciliation above actually receives events.
  useEffect(() => {
    if (!mounted) return
    startListening()
    if (playerReady) return
    const id = setInterval(startListening, 400)
    return () => clearInterval(id)
  }, [mounted, playerReady, startListening])

  useEffect(() => () => clearRetries(), [clearRetries])

  // Auto-unmute on genuine user gestures. Browsers block audible playback until the
  // user interacts, so when there is no opening gate to tap (openingStyle "Tiada")
  // this is what starts the music. We deliberately do NOT listen to "scroll": the
  // card's auto-scroll fires programmatic scroll events that are not real user
  // gestures and would waste the unmute attempt before the user ever touches the
  // screen. We retry on each gesture until audio is actually playing, but stop once
  // the user has explicitly muted.
  useEffect(() => {
    if (!playerReady) return
    const handle = () => {
      if (userMutedRef.current) return  // respect an explicit mute
      if (!mutedRef.current) return     // already playing
      unmute()
    }
    const opts: AddEventListenerOptions = { passive: true }
    window.addEventListener("pointerdown", handle, opts)
    window.addEventListener("touchstart", handle, opts)
    window.addEventListener("wheel", handle, opts)
    window.addEventListener("keydown", handle, opts)
    return () => {
      window.removeEventListener("pointerdown", handle)
      window.removeEventListener("touchstart", handle)
      window.removeEventListener("wheel", handle)
      window.removeEventListener("keydown", handle)
    }
  }, [playerReady, unmute])

  // Unmute as soon as player is ready.
  // If the page already has user activation (SPA nav click, gate tap, etc.) we unmute
  // immediately. On a fresh external link open with no prior gesture the browser will
  // silently block the unMute — the interacted fallback below handles that case, and
  // the infoDelivery reconciliation keeps the icon honest until then.
  useEffect(() => {
    if (!playerReady) return
    const ua = typeof navigator !== "undefined" && "userActivation" in navigator
      ? (navigator.userActivation as { hasBeenActive?: boolean })
      : null
    if (ua?.hasBeenActive ?? true) unmute()
  }, [playerReady, unmute])

  const handleToggle = useCallback(() => {
    if (isMuted) {
      userMutedRef.current = false
      unmute()
    } else {
      mute()
    }
  }, [isMuted, unmute, mute])

  useEffect(() => {
    if (toggleRef) toggleRef.current = handleToggle
  }, [handleToggle, toggleRef])

  useEffect(() => {
    onMuteChange?.(isMuted)
  }, [isMuted, onMuteChange])

  if (!mounted || !youtubeVideoId || !audioEnabled) return null

  // autoplay=1 + mute=1 → browser allows playback; we unmute after first user gesture
  const embedUrl = getYoutubeEmbedUrl(youtubeVideoId, true, loopAudio, true, origin, startSeconds)

  return (
    <iframe
      ref={(el) => { if (el) iframeRef.current = el }}
      src={embedUrl}
      allow="autoplay"
      onLoad={startListening}
      className="absolute w-0 h-0 opacity-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
