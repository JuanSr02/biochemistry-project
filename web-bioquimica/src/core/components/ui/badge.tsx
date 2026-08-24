import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/core/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:text-white",
        secondary:
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100",
        outline:
          "text-slate-950 dark:text-slate-50 border-slate-200 dark:border-slate-800",
        success:
          "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800",
        warning:
          "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800",
        destructive:
          "border-transparent bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
