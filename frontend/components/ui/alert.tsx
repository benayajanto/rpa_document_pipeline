import type { HTMLAttributes } from "react";
import { AlertCircle, Info } from "lucide-react";

import { cn } from "@/lib/utils";

type Variant = "error" | "info";

const variantClasses: Record<Variant, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

const variantIcons: Record<Variant, typeof AlertCircle> = {
  error: AlertCircle,
  info: Info,
};

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

export function Alert({ variant = "info", className, children, ...props }: AlertProps) {
  const Icon = variantIcons[variant];
  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
