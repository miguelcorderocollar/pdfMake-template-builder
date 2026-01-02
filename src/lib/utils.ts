import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Detects if the user is on a Mac
 */
export function isMac(): boolean {
  if (typeof window === "undefined") return false;
  // Use userAgentData if available (modern browsers), otherwise fall back to userAgent
  const nav = navigator as Navigator & { userAgentData?: { platform: string } };
  if (nav.userAgentData) {
    return nav.userAgentData.platform === "macOS";
  }
  return /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
}

/**
 * Formats a keyboard shortcut hint for the current platform
 * @param key The key to display (e.g., "\\", "K", etc.)
 * @returns Formatted shortcut string (e.g., "⌘\\" on Mac, "Ctrl+\\" on Windows)
 */
export function formatKeyboardShortcut(key: string): string {
  const modifier = isMac() ? "⌘" : "Ctrl";
  return `${modifier}${key}`;
}
