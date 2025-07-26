import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer w-5 h-5 shrink-0 rounded border-2 border-coffee-border bg-coffee-surface shadow-sm transition-all duration-200 hover:border-coffee-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coffee-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-coffee-primary data-[state=checked]:border-coffee-primary data-[state=checked]:text-coffee-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-all duration-200"
      >
        <CheckIcon className="w-4 h-4 font-bold" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
