"use client"

import { useRef } from "react"

interface Props {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  rows?: number
}

const TOOLBAR_BUTTONS = [
  { cmd: "bold",          label: <strong>B</strong> },
  { cmd: "italic",        label: <em>I</em> },
  { cmd: "underline",     label: <u>U</u> },
  { cmd: "strikeThrough", label: <s>S</s> },
  { cmd: "insertUnorderedList", label: "≡" },
  { cmd: "insertOrderedList",   label: "1." },
  { cmd: "justifyLeft",   label: "⬅" },
  { cmd: "justifyCenter", label: "☰" },
  { cmd: "justifyRight",  label: "➡" },
]

export function SimpleRichText({ value, onChange, placeholder, rows = 4 }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)

  function execCmd(cmd: string) {
    editorRef.current?.focus()
    document.execCommand(cmd, false)
    if (editorRef.current) onChange(editorRef.current.innerText)
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
        <select
          className="text-xs border border-gray-200 rounded px-1 py-0.5 text-gray-600 ml-1 bg-white"
          onChange={(e) => { document.execCommand("fontSize", false, e.target.value); e.target.value = "" }}
        >
          <option value="">px</option>
          {[10,12,14,16,18,20,24,28,32,36].map(s => (
            <option key={s} value={s}>{s}px</option>
          ))}
        </select>
        <select
          className="text-xs border border-gray-200 rounded px-1 py-0.5 text-gray-600 ml-1 bg-white"
          onChange={(e) => { document.execCommand("fontName", false, e.target.value); e.target.value = "" }}
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
        onInput={(e) => onChange((e.target as HTMLDivElement).innerText)}
        className="px-3 py-2 text-sm text-gray-800 outline-none min-h-[80px]"
        style={{ minHeight: `${rows * 24}px` }}
        dangerouslySetInnerHTML={{ __html: value.replace(/\n/g, "<br/>") }}
        data-placeholder={placeholder}
      />
    </div>
  )
}
