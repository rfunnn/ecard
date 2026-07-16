"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const WORDS = ["PERKAHWINAN", "HARI LAHIR", "PERAYAAN", "MAJLIS"]

export function AnimatedWord() {
  const [i, setI] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % WORDS.length), 2800)
    return () => clearInterval(t)
  }, [])

  const word = WORDS[i]

  return (
    <div className="flex flex-col items-center w-full mb-4">

      {/* cycling word - letter-by-letter rise */}
      <div
        className="overflow-hidden flex items-end justify-center w-full"
        style={{ height: "clamp(3rem, 10vw, 6.5rem)" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={word}
            className="flex items-end justify-center"
            exit={{ opacity: 0, y: -16, transition: { duration: 0.18, ease: "easeIn" as const } }}
          >
            {word.split("").map((letter, j) =>
              letter === " " ? (
                <span
                  key={j}
                  style={{ display: "inline-block", minWidth: "0.35em" }}
                />
              ) : (
                <motion.span
                  key={j}
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{
                    delay: j * 0.045,
                    duration: 0.48,
                    ease: "easeOut" as const,
                  }}
                  className="font-playfair shimmer leading-none"
                  style={{ fontSize: "clamp(2.4rem, 9vw, 6rem)", letterSpacing: "0.05em" }}
                >
                  {letter}
                </motion.span>
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* sweeping underline */}
      <div
        className="relative overflow-hidden mt-3"
        style={{ width: "clamp(80px, 32vw, 190px)", height: "1px" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={`ul-${i}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.55, ease: "easeOut" as const }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/55 to-transparent"
            style={{ transformOrigin: "left center" }}
          />
        </AnimatePresence>
      </div>

      {/* progress pills */}
      <div className="flex items-center gap-1.5 mt-4">
        {WORDS.map((_, idx) => (
          <motion.div
            key={idx}
            animate={{
              width: idx === i ? "22px" : "6px",
              opacity: idx === i ? 1 : 0.25,
            }}
            transition={{ duration: 0.38, ease: "easeOut" as const }}
            className="h-[3px] rounded-full bg-gold"
          />
        ))}
      </div>

    </div>
  )
}
