"use client"

import { useEffect, useRef } from "react"

interface Props {
  effect: string
  color: string
  contained?: boolean
  sizeScale?: number
}

interface Particle {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  drift: number        // max horizontal oscillation px per frame
  driftPhase: number   // current sin phase
  rotation: number     // radians
  rotationSpeed: number
  colorIndex: number   // for multi-colour effects
  // Bubble-specific
  angleWander?: number  // current free-movement angle (radians)
  blinkPhase?: number   // sin phase for opacity pulse
  blinkSpeed?: number   // how fast the blink cycles
  blinks?: boolean      // whether this particle blinks
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "").padStart(6, "0")
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function clamp(v: number) { return Math.max(0, Math.min(255, v)) }

// Colour offsets for Bunga #2 and Confetti multi-colour particles
const COLOR_OFFSETS: [number, number, number][] = [
  [  0,   0,   0],
  [ 70, -30, -30],
  [-20,  60, -20],
  [-30, -20,  80],
  [ 60,  40, -50],
  [-50,  20,  60],
]

function spawn(effect: string, w: number, h: number, spreadY = true, sizeScale = 1): Particle {
  const iSnow   = effect.startsWith("Salji")
  const isConf  = effect === "Confetti"
  const isBuih  = effect.startsWith("Buih")
  const isBuih2 = effect === "Buih #2"
  const isBuih13 = effect === "Buih #1" || effect === "Buih #3"
  const baseSize =
    isConf            ? 3  + Math.random() * 5
    : effect === "Salji #1" ? 2  + Math.random() * 4
    : effect === "Salji #2" ? 4  + Math.random() * 9
    : isBuih          ? 3  + Math.random() * 13
    : 6  + Math.random() * 10
  return {
    x: Math.random() * w,
    y: spreadY
      ? Math.random() * h
      : isBuih2
        ? h + baseSize * sizeScale + 10
        : -(5 + Math.random() * 20),
    size: baseSize * sizeScale,
    speed:
      isConf   ? 1.8 + Math.random() * 2.2
      : iSnow  ? (effect === "Salji #1" ? 0.55 + Math.random() * 1.1 : 0.4 + Math.random() * 0.85)
      : isBuih ? 0.18 + Math.random() * 0.52
      : 0.65 + Math.random() * 0.95,
    opacity:    isBuih ? 0.22 + Math.random() * 0.52 : 0.35 + Math.random() * 0.55,
    drift:      (Math.random() - 0.5) * (isConf ? 2.2 : isBuih ? 0.7 : 1.4),
    driftPhase: Math.random() * Math.PI * 2,
    rotation:   Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * (isConf ? 0.11 : 0.035),
    colorIndex: Math.floor(Math.random() * COLOR_OFFSETS.length),
    angleWander: isBuih13 ? Math.random() * Math.PI * 2 : undefined,
    blinkPhase:  isBuih   ? Math.random() * Math.PI * 2 : undefined,
    blinkSpeed:  isBuih   ? 0.007 + Math.random() * 0.016 : undefined,
    blinks:
      isBuih2         ? Math.random() > 0.48
      : effect === "Buih #3" ? Math.random() > 0.32
      : false,
  }
}

function makeParticles(effect: string, w: number, h: number, sizeScale = 1): Particle[] {
  const count =
    effect === "Confetti"  ? 80
    : effect === "Salji #1" ? 55
    : effect === "Salji #2" ? 38
    : effect === "Buih #1"  ? 32
    : effect === "Buih #2"  ? 28
    : effect === "Buih #3"  ? 30
    : 24
  // First batch: scattered across screen so it doesn't start empty
  return Array.from({ length: count }, (_, i) =>
    spawn(effect, w, h, i < count * 0.6, sizeScale)
  )
}

// ── Draw functions ───────────────────────────────────────────────────────────

function drawSnow1(
  ctx: CanvasRenderingContext2D,
  p: Particle,
  r: number, g: number, b: number
) {
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(${r},${g},${b},${p.opacity})`
  ctx.fill()
}

function drawSnow2(
  ctx: CanvasRenderingContext2D,
  p: Particle,
  r: number, g: number, b: number
) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rotation)
  ctx.strokeStyle = `rgba(${r},${g},${b},${p.opacity})`
  ctx.lineWidth = Math.max(0.8, p.size * 0.13)
  ctx.lineCap = "round"
  for (let arm = 0; arm < 6; arm++) {
    ctx.rotate(Math.PI / 3)
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(0, -p.size)
    const br = p.size * 0.48
    ctx.moveTo(0, -br)
    ctx.lineTo( p.size * 0.24, -br - p.size * 0.2)
    ctx.moveTo(0, -br)
    ctx.lineTo(-p.size * 0.24, -br - p.size * 0.2)
    ctx.stroke()
  }
  ctx.restore()
}

function drawPetal1(
  ctx: CanvasRenderingContext2D,
  p: Particle,
  r: number, g: number, b: number
) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rotation)
  ctx.fillStyle = `rgba(${r},${g},${b},${p.opacity})`
  // Teardrop petal using two bezier curves
  ctx.beginPath()
  ctx.moveTo(0, -p.size)
  ctx.bezierCurveTo( p.size * 0.65, -p.size * 0.2,  p.size * 0.65,  p.size * 0.45, 0, p.size * 0.55)
  ctx.bezierCurveTo(-p.size * 0.65,  p.size * 0.45, -p.size * 0.65, -p.size * 0.2, 0, -p.size)
  ctx.fill()
  ctx.restore()
}

function drawPetal2(
  ctx: CanvasRenderingContext2D,
  p: Particle,
  r: number, g: number, b: number
) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rotation)
  const [dr, dg, db] = COLOR_OFFSETS[p.colorIndex]
  const pr = clamp(r + dr)
  const pg = clamp(g + dg)
  const pb = clamp(b + db)
  // 5-petal flower (each petal is an ellipse rotated around centre)
  for (let i = 0; i < 5; i++) {
    ctx.save()
    ctx.rotate((i * Math.PI * 2) / 5)
    ctx.fillStyle = `rgba(${pr},${pg},${pb},${p.opacity})`
    ctx.beginPath()
    ctx.ellipse(0, -p.size * 0.58, p.size * 0.3, p.size * 0.52, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  ctx.restore()
}

function drawConfetti(
  ctx: CanvasRenderingContext2D,
  p: Particle,
  r: number, g: number, b: number
) {
  ctx.save()
  ctx.translate(p.x, p.y)
  ctx.rotate(p.rotation)
  const [dr, dg, db] = COLOR_OFFSETS[p.colorIndex]
  ctx.fillStyle = `rgba(${clamp(r + dr)},${clamp(g + dg)},${clamp(b + db)},${p.opacity})`
  // Thin rectangle — looks like a real confetti strip
  ctx.fillRect(-p.size * 0.45, -p.size * 1.5, p.size * 0.9, p.size * 3)
  ctx.restore()
}

function drawBubble(
  ctx: CanvasRenderingContext2D,
  p: Particle,
  r: number, g: number, b: number
) {
  let op = p.opacity
  if (p.blinks && p.blinkPhase !== undefined) {
    op = p.opacity * (0.25 + 0.75 * Math.abs(Math.sin(p.blinkPhase)))
  }
  // Translucent fill
  ctx.beginPath()
  ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(${r},${g},${b},${op * 0.13})`
  ctx.fill()
  // Ring
  ctx.strokeStyle = `rgba(${r},${g},${b},${op * 0.65})`
  ctx.lineWidth = Math.max(0.7, p.size * 0.09)
  ctx.stroke()
  // Specular highlight
  ctx.beginPath()
  ctx.arc(p.x - p.size * 0.27, p.y - p.size * 0.27, p.size * 0.17, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(255,255,255,${op * 0.55})`
  ctx.fill()
}

// ── Component ────────────────────────────────────────────────────────────────

export function EffectAnimation({ effect, color, contained, sizeScale = 1 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (effect === "Tiada") return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let animId: number
    let particles: Particle[]

    // For contained mode use the parent element's size — avoids feedback loops
    // that happen when setting canvas.width/height triggers its own ResizeObserver.
    const dims = () => {
      if (contained) {
        const p = canvas.parentElement
        return { w: p?.clientWidth ?? 0, h: p?.clientHeight ?? 0 }
      }
      return {
        w: window.innerWidth,
        h: window.innerHeight,
      }
    }

    let lastW = 0, lastH = 0
    const setup = () => {
      const raw = dims()
      if (!raw.w || !raw.h) return
      const w = Math.min(raw.w, 1440)
      const h = Math.min(raw.h, 2800)
      if (w === lastW && h === lastH) return
      lastW = w; lastH = h
      canvas.width  = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = makeParticles(effect, w, h, sizeScale)
    }

    setup()

    const [r, g, b] = hexToRgb(color)

    const tick = () => {
      const { w: rw, h: rh } = dims()
      if (!rw || !rh || !particles) { animId = requestAnimationFrame(tick); return }
      const w = Math.min(rw, 1440)
      const h = Math.min(rh, 2800)
      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        if (effect === "Buih #1" || effect === "Buih #3") {
          // Free wandering movement
          p.angleWander = ((p.angleWander ?? 0) + (Math.random() - 0.5) * 0.04)
          p.x += Math.cos(p.angleWander) * p.speed
          p.y += Math.sin(p.angleWander) * p.speed
          if (p.blinkPhase !== undefined) p.blinkPhase += (p.blinkSpeed ?? 0.012)
          // Wrap all edges
          if (p.x < -p.size)     p.x = w + p.size
          if (p.x > w + p.size)  p.x = -p.size
          if (p.y < -p.size)     p.y = h + p.size
          if (p.y > h + p.size)  p.y = -p.size
          drawBubble(ctx, p, r, g, b)
        } else if (effect === "Buih #2") {
          // Rise upward with gentle sway
          p.driftPhase += 0.014
          p.x += Math.sin(p.driftPhase) * p.drift
          p.y -= p.speed
          if (p.blinkPhase !== undefined) p.blinkPhase += (p.blinkSpeed ?? 0.012)
          if (p.x < -p.size)    p.x = w + p.size
          if (p.x > w + p.size) p.x = -p.size
          if (p.y < -p.size * 2) Object.assign(p, spawn(effect, w, h, false, sizeScale))
          drawBubble(ctx, p, r, g, b)
        } else {
          // Existing fall-down behaviour
          p.driftPhase += 0.02
          p.x         += Math.sin(p.driftPhase) * p.drift
          p.y         += p.speed
          p.rotation  += p.rotationSpeed

          if (p.y  >  h + p.size * 2) Object.assign(p, spawn(effect, w, h, false, sizeScale))
          if (p.x  >  w + p.size * 2) p.x = -p.size * 2
          if (p.x  < -p.size * 2)     p.x =  w + p.size * 2

          if      (effect === "Salji #1")  drawSnow1(ctx, p, r, g, b)
          else if (effect === "Salji #2")  drawSnow2(ctx, p, r, g, b)
          else if (effect === "Bunga #1")  drawPetal1(ctx, p, r, g, b)
          else if (effect === "Bunga #2")  drawPetal2(ctx, p, r, g, b)
          else if (effect === "Confetti") drawConfetti(ctx, p, r, g, b)
        }
      }

      animId = requestAnimationFrame(tick)
    }

    tick()

    let stopResize: () => void
    if (contained) {
      // Observe the parent so resizing the phone frame triggers a redraw
      // without the canvas attribute changes feeding back into the observer.
      const target = canvas.parentElement ?? canvas
      const ro = new ResizeObserver(setup)
      ro.observe(target)
      stopResize = () => ro.disconnect()
    } else {
      window.addEventListener("resize", setup)
      stopResize = () => window.removeEventListener("resize", setup)
    }

    return () => {
      cancelAnimationFrame(animId)
      stopResize()
    }
  }, [effect, color, contained, sizeScale])

  if (effect === "Tiada") return null

  return (
    <canvas
      ref={canvasRef}
      className={`${contained ? "absolute" : "fixed"} inset-0 pointer-events-none`}
      style={{ zIndex: 25, width: "100%", height: "100%" }}
    />
  )
}
