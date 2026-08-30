import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
  secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400",
  outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:text-gray-400",
  ghost: "text-gray-600 hover:bg-gray-100 disabled:text-gray-300",
  destructive: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}
