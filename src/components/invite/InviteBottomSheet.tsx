"use client"

import { motion, AnimatePresence } from "framer-motion"

interface InviteBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  contained?: boolean
  children: React.ReactNode
}

const SHEET_SPRING = { type: "spring" as const, damping: 28, stiffness: 320 }

export function InviteBottomSheet({ isOpen, onClose, contained, children }: InviteBottomSheetProps) {
  const positionClass = contained ? "absolute" : "fixed"

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${positionClass} inset-0 z-60`}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={SHEET_SPRING}
            className={`${positionClass} bottom-16 left-0 right-0 z-61 flex justify-center px-4`}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
