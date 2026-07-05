import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

const dateTimeFormatter = new Intl.DateTimeFormat("en", {
  timeZone: "UTC",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) return "Not available";
  return dateTimeFormatter.format(new Date(value));
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function redactSecret(value: string | undefined) {
  if (!value) return "not configured";
  if (value.length <= 8) return "configured";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}
