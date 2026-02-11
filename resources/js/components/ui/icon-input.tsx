import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"

export interface IconInputProps extends React.ComponentProps<"input"> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  rightAction?: React.ReactNode
  helperText?: string
  inputClassName?: string
}

const IconInput = React.forwardRef<HTMLInputElement, IconInputProps>(
  ({ className, leftIcon, rightIcon, rightAction, helperText, inputClassName, ...props }, ref) => {
    return (
      <div className={cn("w-full", className)}>
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}
          <Input
            ref={ref}
            className={cn(
              leftIcon && "pl-10",
              (rightIcon || rightAction) && "pr-10",
              inputClassName
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {rightIcon}
            </div>
          )}
          {rightAction && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {rightAction}
            </div>
          )}
        </div>
        {helperText && (
          <p className="text-xs text-muted-foreground mt-1.5">{helperText}</p>
        )}
      </div>
    )
  }
)

IconInput.displayName = "IconInput"

export { IconInput }
