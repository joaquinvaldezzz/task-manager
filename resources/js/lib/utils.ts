import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { InertiaLinkProps } from "@inertiajs/react";
import type { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps["href"]>): string {
  return typeof url === "string" ? url : url.url;
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
