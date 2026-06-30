"use client"

import { useEffect, useRef } from "react"

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
  // Saved selection range — needed because clicking a <select> blurs the editor.
  const savedRangeRef  = useRef<Range | null>(null)

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

  function emit() {
    if (!editorRef.current) return
    const html = isEmptyHtml(editorRef.current.innerHTML) ? "" : editorRef.current.innerHTML
    lastEmittedRef.current = html
    onChange(html)
  }

  // Toolbar button: execCommand keeps focus & selection because onMouseDown
  // calls preventDefault(), so this is safe to call without restoring.
  function execCmd(cmd: string) {
    editorRef.current?.focus()
    document.execCommand(cmd, false)
    emit()
  }

  // Save the current selection when the editor is blurred so it can be
  // restored before a <select> onChange fires (clicking a select blurs editor).
  function handleBlur() {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      if (editorRef.current?.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange()
      }
    }
  }

  // Wrap the saved selection in a span with a CSS property. Used for font-size
  // and font-family because execCommand("fontSize") only accepts the archaic
  // 1–7 scale and doesn't support pixel values.
  function applySpanStyle(cssProp: "fontSize" | "fontFamily", val: string) {
    if (!val) return
    const ed = editorRef.current
    if (!ed) return

    const range = savedRangeRef.current
    if (!range || range.collapsed) return   // nothing was selected

    // Restore focus + selection
    ed.focus()
    const sel = window.getSelection()
    if (!sel) return
    sel.removeAllRanges()
    sel.addRange(range)

    const span = document.createElement("span")
    if (cssProp === "fontSize") span.style.fontSize = val + "px"
    else span.style.fontFamily = val

    // surroundContents fails when the selection crosses element boundaries;
    // extractContents + insertNode is the reliable fallback.
    try {
      range.surroundContents(span)
    } catch {
      const frag = range.extractContents()
      span.appendChild(frag)
      range.insertNode(span)
    }

    // Leave the newly wrapped text selected
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

        {/* Font size — pixel values, applied via span style */}
        <select
          className="text-xs border border-gray-200 rounded px-1 py-0.5 text-gray-600 ml-1 bg-white"
          onChange={(e) => { applySpanStyle("fontSize", e.target.value); e.target.value = "" }}
        >
          <option value="">px</option>
          {[10, 12, 14, 16, 18, 20, 24, 28, 32, 36].map((s) => (
            <option key={s} value={s}>{s}px</option>
          ))}
        </select>

        {/* Font family — applied via span style */}
        <select
          className="text-xs border border-gray-200 rounded px-1 py-0.5 text-gray-600 ml-1 bg-white"
          onChange={(e) => { applySpanStyle("fontFamily", e.target.value); e.target.value = "" }}
        >
          <option value="">Fon</option>
          <option value="serif">Serif</option>
          <option value="sans-serif">Sans</option>
          <option value="Cormorant Garamond">Cormorant</option>
          <option value="Cinzel">Cinzel</option>
        </select>
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
