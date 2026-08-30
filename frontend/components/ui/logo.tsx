import { lusitana } from "@/lib/fonts";
import { cn } from "@/lib/utils";

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <div
      className={cn(
        lusitana.className,
        "flex flex-row items-center leading-none",
        light ? "text-white" : "text-gray-900",
        className,
      )}
    >
      <p className="text-[32px]">Invoice Extractor</p>
    </div>
  );
}
