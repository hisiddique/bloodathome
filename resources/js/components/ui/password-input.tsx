import { useState, forwardRef } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    showIcon?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, showIcon = true, value, onChange, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);

        return (
            <div className="relative">
                {showIcon && (
                    <Lock
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
                        aria-hidden="true"
                    />
                )}
                <input
                    type={showPassword ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    className={cn(
                        "w-full py-4 bg-card border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary",
                        showIcon ? "pl-12 pr-12" : "pl-4 pr-12",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    {showPassword ? (
                        <EyeOff className="w-5 h-5" aria-hidden="true" />
                    ) : (
                        <Eye className="w-5 h-5" aria-hidden="true" />
                    )}
                </button>
            </div>
        );
    }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
