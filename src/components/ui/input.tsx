import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-10 w-full rounded-xl border border-[#eae2f0] bg-white px-3.5 py-2 text-sm text-[#21182b] placeholder:text-[#aa97b0] transition-all duration-200 hover:border-[#d6b9df] focus:outline-none focus:ring-2 focus:ring-[#e83ead]/20 focus:border-[#e83ead] disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                ref={ref}
                {...props}
            />
        )
    },
)
Input.displayName = "Input"

export { Input }
