import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline focus:outline-2 focus:outline-offset-1 focus:outline-blue-200",
          error && "border-red-400 focus:border-red-500 focus:outline-red-200",
          className,
        )}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
