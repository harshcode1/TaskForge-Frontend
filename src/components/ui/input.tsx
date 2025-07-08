import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"

import { cn } from "@/lib/utils"

export interface InputProps {
  id?: string
  icon?: React.ReactNode
  error?: string
  className?: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  required?: boolean
  whileFocus?: HTMLMotionProps<"input">["whileFocus"]
  transition?: HTMLMotionProps<"input">["transition"]
  onFocus?: React.FocusEventHandler<HTMLInputElement>
  onBlur?: React.FocusEventHandler<HTMLInputElement>
  ref?: React.Ref<HTMLInputElement>
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, icon, error, whileFocus, transition, onFocus, onBlur, ...props },
    ref
  ) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <motion.input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
            icon && "pl-10",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          onFocus={onFocus}
          onBlur={onBlur}
          whileFocus={whileFocus || { scale: 1.01 }}
          transition={transition || { type: "spring", stiffness: 300, damping: 30 }}
          {...props}
        />
        {error && (
          <motion.p
            className="mt-1 text-sm text-destructive"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }

