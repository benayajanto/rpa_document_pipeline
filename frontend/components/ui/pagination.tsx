"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { generatePagination, cn } from "@/lib/utils";

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <div className="inline-flex">
      <PaginationArrow
        direction="left"
        onClick={() => onPageChange(currentPage - 1)}
        isDisabled={currentPage <= 1}
      />

      <div className="flex -space-x-px">
        {allPages.map((page, index) => {
          let position: "first" | "last" | "single" | "middle" | undefined;
          if (index === 0) position = "first";
          if (index === allPages.length - 1) position = "last";
          if (allPages.length === 1) position = "single";
          if (page === "...") position = "middle";

          return (
            <PaginationNumber
              key={`${page}-${index}`}
              page={page}
              position={position}
              isActive={currentPage === page}
              onClick={() => typeof page === "number" && onPageChange(page)}
            />
          );
        })}
      </div>

      <PaginationArrow
        direction="right"
        onClick={() => onPageChange(currentPage + 1)}
        isDisabled={currentPage >= totalPages}
      />
    </div>
  );
}

function PaginationArrow({
  direction,
  isDisabled,
  onClick,
}: {
  direction: "left" | "right";
  isDisabled?: boolean;
  onClick: () => void;
}) {
  const className = cn(
    "flex h-10 w-10 items-center justify-center rounded-md border",
    isDisabled ? "pointer-events-none text-gray-300" : "hover:bg-gray-100",
    direction === "left" ? "mr-2 md:mr-4" : "ml-2 md:ml-4",
  );
  const Icon = direction === "left" ? ArrowLeft : ArrowRight;

  return (
    <button className={className} disabled={isDisabled} onClick={onClick} aria-label={`${direction} page`}>
      <Icon className="w-4" />
    </button>
  );
}

function PaginationNumber({
  page,
  isActive,
  position,
  onClick,
}: {
  page: number | "...";
  position?: "first" | "last" | "middle" | "single";
  isActive: boolean;
  onClick: () => void;
}) {
  const className = cn(
    "flex h-10 w-10 items-center justify-center text-sm border",
    (position === "first" || position === "single") && "rounded-l-md",
    (position === "last" || position === "single") && "rounded-r-md",
    isActive && "z-10 bg-blue-600 border-blue-600 text-white",
    !isActive && position !== "middle" && "hover:bg-gray-100",
    position === "middle" && "text-gray-300",
  );

  if (isActive || position === "middle") {
    return <div className={className}>{page}</div>;
  }

  return (
    <button className={className} onClick={onClick}>
      {page}
    </button>
  );
}
