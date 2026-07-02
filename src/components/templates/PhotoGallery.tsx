/* eslint-disable @next/next/no-img-element */
"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { PhotoItem } from "@/types/invitation"

interface Props {
  photos: PhotoItem[]
  bodyColor: string
  headFont: string
  bodyFont: string
  isMs: boolean
}

export function PhotoGallery({ photos, bodyColor, headFont, bodyFont, isMs }: Props) {
  const [idx, setIdx] = useState(0)
  const [direction, setDirection] = useState(1)

  const next = useCallback(() => {
    setDirection(1)
    setIdx((i) => (i + 1) % photos.length)
  }, [photos.length])

  const prev = useCallback(() => {
    setDirection(-1)
    setIdx((i) => (i - 1 + photos.length) % photos.length)
  }, [photos.length])

  // Auto-advance every 3.5 s
  useEffect(() => {
    if (photos.length <= 1) return
    const id = setInterval(next, 3500)
    return () => clearInterval(id)
  }, [next, photos.length])

  if (photos.length === 0) return null

  const current = photos[idx]

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center:              ({ x: 0, opacity: 1 }),
    exit:  (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  }

  return (
    <div className="w-full">
      <p className={`${headFont} text-[10px] uppercase tracking-[0.4em] opacity-35 mb-4 text-center`} style={{ color: bodyColor }}>
        {isMs ? "Galeri Foto" : "Photo Gallery"}
      </p>

      {/* slide area */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black/5">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={idx}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={current.imageUrl}
              alt={current.caption ?? ""}
              className="w-full h-full object-cover"
            />
            {current.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-4 pt-8 pb-3">
                <p className={`${bodyFont} text-xs text-white/90 text-center`}>{current.caption}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* prev / next tap zones */}
        {photos.length > 1 && (
          <>
            <button onClick={prev} className="absolute inset-y-0 left-0 w-1/4" aria-label="Previous" />
            <button onClick={next} className="absolute inset-y-0 right-0 w-1/4" aria-label="Next" />
          </>
        )}
      </div>

      {/* dots */}
      {photos.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > idx ? 1 : -1); setIdx(i) }}
              className="rounded-full transition-all"
              style={{
                width: i === idx ? "16px" : "6px",
                height: "6px",
                background: bodyColor,
                opacity: i === idx ? 0.7 : 0.2,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
