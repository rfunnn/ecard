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
  const [interacted, setInteracted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | undefined>(undefined)
  const analyticFiredRef = useRef(false)
  const interactedRef = useRef(false)

  const { youtubeVideoId, audioEnabled, volume, loopAudio } = media

  useEffect(() => { setMounted(true) }, [])

  const origin = useMemo(() => (mounted ? window.location.origin : ""), [mounted])

  const sendCommand = useCallback((func: string, args?: unknown[]) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args: args ?? [] }),
      "*"
    )
  }, [])

  const unmute = useCallback(() => {
    sendCommand("unMute")
    sendCommand("setVolume", [Math.round((volume ?? 0.5) * 100)])
    setIsMuted(false)
    if (!analyticFiredRef.current) {
      analyticFiredRef.current = true
      onAnalytic?.("MUSIC_PLAY")
    }
  }, [sendCommand, volume, onAnalytic])

  // Detect YouTube iframe API ready event
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === "string" ? JSON.parse(e.data) : e.data
        if (data?.event === "onReady") setPlayerReady(true)
        // playerState 1 = playing (video has started even if muted)
        if (data?.info?.playerState === 1) setPlayerReady(true)
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

  // Catch ANY first user gesture — fallback for browsers that block audio without gesture
  useEffect(() => {
    const handle = () => {
      if (interactedRef.current) return
      interactedRef.current = true
      setInteracted(true)
    }
    document.addEventListener("click", handle)
    document.addEventListener("touchstart", handle, { passive: true })
    document.addEventListener("scroll", handle, { capture: true, passive: true })
    window.addEventListener("wheel", handle, { passive: true })
    return () => {
      document.removeEventListener("click", handle)
      document.removeEventListener("touchstart", handle)
      document.removeEventListener("scroll", handle, { capture: true })
      window.removeEventListener("wheel", handle)
    }
  }, [])

  // Unmute as soon as player is ready.
  // If the page already has user activation (SPA nav click, gate tap, etc.) we unmute
  // immediately. On a fresh external link open with no prior gesture the browser will
  // silently block the unMute — the interacted fallback below handles that case.
  useEffect(() => {
    if (!playerReady) return
    const ua = typeof navigator !== "undefined" && "userActivation" in navigator
      ? (navigator.userActivation as { hasBeenActive?: boolean })
      : null
    if (ua?.hasBeenActive ?? true) unmute()
  }, [playerReady, unmute])

  // Fallback: unmute on first user gesture (mobile browsers that block without gesture)
  useEffect(() => {
    if (interacted && playerReady) unmute()
  }, [interacted, playerReady, unmute])

  const handleToggle = useCallback(() => {
    if (isMuted) {
      interactedRef.current = true
      setInteracted(true)
      unmute()
    } else {
      sendCommand("mute")
      setIsMuted(true)
    }
  }, [isMuted, unmute, sendCommand])

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
      className="absolute w-0 h-0 opacity-0 pointer-events-none"
      aria-hidden="true"
    />
  )
}
