import { cn } from "@/lib/utils";

interface ConfirmButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
}

export function ConfirmButton({
  onClick,
  disabled,
  children,
  type = "button",
}: ConfirmButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full py-4 rounded-2xl font-semibold text-base transition-all duration-200",
        disabled
          ? "bg-muted text-muted-foreground cursor-not-allowed"
          : "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]"
      )}
    >
      {children}
    </button>
  );
}

export default ConfirmButton;
