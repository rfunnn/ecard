interface Props {
  label: string
  required?: boolean
  hint?: string
  info?: boolean
}

export function FieldLabel({ label, required, hint, info }: Props) {
  return (
    <div className="mb-1.5">
      <span className="text-sm font-bold text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
        {info && (
          <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-yellow-400 text-[10px] font-bold text-gray-900 cursor-help">?</span>
        )}
      </span>
      {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
    </div>
  )
}
