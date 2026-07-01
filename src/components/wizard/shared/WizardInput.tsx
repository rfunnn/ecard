import { cn } from "@/lib/utils"

type WizardInputProps = React.InputHTMLAttributes<HTMLInputElement>

export function WizardInput({ className, ...props }: WizardInputProps) {
  return (
    <input
      className={cn(
        "w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-800",
        "outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
      {...props}
    />
  )
}
