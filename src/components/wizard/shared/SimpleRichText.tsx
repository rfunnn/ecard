"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"

interface Props {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  rows?: number
}

const TOOLBAR_BUTTONS = [
  { cmd: "bold",                label: <strong>B</strong> },
  { cmd: "italic",              label: <em>I</em> },
  { cmd: "underline",           label: <u>U</u> },
  { cmd: "strikeThrough",       label: <s>S</s> },
  { cmd: "insertUnorderedList", label: "≡" },
  { cmd: "insertOrderedList",   label: "1." },
  { cmd: "justifyLeft",         label: "⬅" },
  { cmd: "justifyCenter",       label: "☰" },
  { cmd: "justifyRight",        label: "➡" },
]

const FONT_FAMILIES = [
  { label: "Lato",          cssVar: "var(--font-lato)",        cls: "font-lato" },
  { label: "Montserrat",    cssVar: "var(--font-montserrat)",   cls: "font-montserrat" },
  { label: "Raleway",       cssVar: "var(--font-raleway)",      cls: "font-raleway" },
  { label: "Open Sans",     cssVar: "var(--font-opensans)",     cls: "font-opensans" },
  { label: "Cormorant",     cssVar: "var(--font-cormorant)",    cls: "font-cormorant" },
  { label: "Cinzel",        cssVar: "var(--font-cinzel)",       cls: "font-cinzel" },
  { label: "Playfair",      cssVar: "var(--font-playfair)",     cls: "font-playfair" },
  { label: "Garamond",      cssVar: "var(--font-garamond)",     cls: "font-garamond" },
  { label: "Great Vibes",   cssVar: "var(--font-great-vibes)",  cls: "font-great-vibes" },
  { label: "Dancing Script",cssVar: "var(--font-dancing)",      cls: "font-dancing" },
  { label: "Sacramento",    cssVar: "var(--font-sacramento)",   cls: "font-sacramento" },
  { label: "Alex Brush",    cssVar: "var(--font-alex-brush)",   cls: "font-alex-brush" },
  { label: "Allura",        cssVar: "var(--font-allura)",       cls: "font-allura" },
  { label: "Parisienne",    cssVar: "var(--font-parisienne)",   cls: "font-parisienne" },
  { label: "Pinyon Script", cssVar: "var(--font-pinyon)",       cls: "font-pinyon" },
]

// Convert a legacy plain-text value to HTML for initialising the editor.
function toHtml(v: string): string {
  if (/<[a-z]/i.test(v)) return v          // already HTML
  return v.replace(/\n/g, "<br/>")
}

// Treat browser-generated "empty" markup as truly empty.
function isEmptyHtml(html: string): boolean {
  return html.replace(/<br\s*\/?>/gi, "").replace(/<[^>]+>/g, "").trim() === ""
}

export function SimpleRichText({ value, onChange, placeholder, rows = 4 }: Props) {
  const editorRef      = useRef<HTMLDivElement>(null)
  const lastEmittedRef = useRef<string>(value)
  // Saved selection range — needed because clicking a button blurs the editor.
  const savedRangeRef  = useRef<Range | null>(null)

  const [fontPickerOpen, setFontPickerOpen] = useState(false)
  const fontPickerRef  = useRef<HTMLDivElement>(null)

  const [sizePickerOpen, setSizePickerOpen] = useState(false)
  const sizePickerRef  = useRef<HTMLDivElement>(null)

  // Initialise innerHTML once on mount.
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = toHtml(value)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync external value changes (e.g. switching wizard pages) without
  // disturbing the cursor when the change came from this editor.
  useEffect(() => {
    if (editorRef.current && value !== lastEmittedRef.current) {
      editorRef.current.innerHTML = toHtml(value)
      lastEmittedRef.current = value
    }
  }, [value])

  useEffect(() => {
    if (!fontPickerOpen) return
    const handler = (e: MouseEvent) => {
      if (!fontPickerRef.current?.contains(e.target as Node)) setFontPickerOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [fontPickerOpen])

  useEffect(() => {
    if (!sizePickerOpen) return
    const handler = (e: MouseEvent) => {
      if (!sizePickerRef.current?.contains(e.target as Node)) setSizePickerOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [sizePickerOpen])

  function emit() {
    if (!editorRef.current) return
    const html = isEmptyHtml(editorRef.current.innerHTML) ? "" : editorRef.current.innerHTML
    lastEmittedRef.current = html
    onChange(html)
  }

  function execCmd(cmd: string) {
    editorRef.current?.focus()
    document.execCommand(cmd, false)
    emit()
  }

  function handleBlur() {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange()
      }
    }
  }

  function saveSelectionNow() {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange()
      }
    }
  }

  function applySpanStyle(cssProp: "fontSize" | "fontFamily", val: string) {
    if (!val) return
    const ed = editorRef.current
    if (!ed) return

    ed.focus()
    const sel = window.getSelection()
    if (!sel) return

    // With an active selection, style just that text. With no (or a collapsed)
    // selection, apply to the whole editor content so users don't have to
    // highlight everything first.
    let range = savedRangeRef.current
    if (!range || range.collapsed) {
      range = document.createRange()
      range.selectNodeContents(ed)
    }
    sel.removeAllRanges()
    sel.addRange(range)

    const span = document.createElement("span")
    if (cssProp === "fontSize") span.style.fontSize = val + "px"
    else span.style.fontFamily = val

    // Always wrap via extractContents: it handles multi-node selections
    // (e.g. whole-content spanning text + <br>) that surroundContents rejects
    // with an InvalidStateError.
    try {
      const frag = range.extractContents()
      // Drop any pre-existing value for this property inside the selection so
      // the new wrapper actually takes effect — otherwise a nested inner style
      // (from an earlier change) would win and nothing would appear to change.
      frag.querySelectorAll<HTMLElement>("*").forEach((el) => {
        if (cssProp === "fontSize") el.style.fontSize = ""
        else el.style.fontFamily = ""
      })
      span.appendChild(frag)
      range.insertNode(span)
    } catch {
      savedRangeRef.current = null
      return
    }

    sel.removeAllRanges()
    const newRange = document.createRange()
    newRange.selectNodeContents(span)
    sel.addRange(newRange)
    savedRangeRef.current = null

    emit()
  }

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        {TOOLBAR_BUTTONS.map(({ cmd, label }) => (
          <button
            key={cmd}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); execCmd(cmd) }}
            className="w-7 h-7 flex items-center justify-center text-sm rounded hover:bg-gray-200 text-gray-700"
          >
            {label}
          </button>
        ))}

        {/* Font size — custom dropdown so mousedown can preventDefault and keep
            the editor focused (a native <select> blurs the editor, losing the
            text selection the size must be applied to). */}
        <div className="relative ml-1" ref={sizePickerRef}>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              saveSelectionNow()
              setSizePickerOpen((o) => !o)
            }}
            className="flex items-center gap-1 text-xs border border-gray-200 rounded px-2 h-[22px] text-gray-600 bg-white hover:border-gray-400 transition-colors"
          >
            px
            <ChevronDown className={`w-3 h-3 transition-transform ${sizePickerOpen ? "rotate-180" : ""}`} />
          </button>

          {sizePickerOpen && (
            <div className="absolute left-0 top-full mt-0.5 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-20 max-h-56 overflow-y-auto">
              {[10, 12, 14, 16, 18, 20, 24, 28, 32, 36].map((s) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    applySpanStyle("fontSize", String(s))
                    setSizePickerOpen(false)
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-amber-50 text-sm text-gray-800"
                >
                  {s}px
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Custom font family picker */}
        <div className="relative ml-1" ref={fontPickerRef}>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              saveSelectionNow()
              setFontPickerOpen((o) => !o)
            }}
            className="flex items-center gap-1 text-xs border border-gray-200 rounded px-2 h-[22px] text-gray-600 bg-white hover:border-gray-400 transition-colors"
          >
            Fon
            <ChevronDown className={`w-3 h-3 transition-transform ${fontPickerOpen ? "rotate-180" : ""}`} />
          </button>

          {fontPickerOpen && (
            <div className="absolute left-0 top-full mt-0.5 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-44 max-h-56 overflow-y-auto">
              {FONT_FAMILIES.map(({ label, cssVar, cls }) => (
                <button
                  key={cssVar}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    applySpanStyle("fontFamily", cssVar)
                    setFontPickerOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-amber-50 text-sm text-gray-800 ${cls}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={handleBlur}
        className="px-3 py-2 text-sm text-gray-800 outline-none min-h-[80px]"
        style={{ minHeight: `${rows * 24}px` }}
        data-placeholder={placeholder}
      />
    </div>
  )
}
