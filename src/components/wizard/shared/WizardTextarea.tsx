import { cn } from "@/lib/utils"

type WizardTextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function WizardTextarea({ className, ...props }: WizardTextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm text-gray-800",
        "outline-none resize-none focus:ring-2 focus:ring-blue-500",
        className
      )}
      {...props}
    />
  )
}
