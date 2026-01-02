"use client";

import { cn } from "@/lib/utils";

interface ColorSwatchProps {
  color: string;
  size?: "sm" | "md" | "lg";
  shape?: "square" | "circle";
  className?: string;
}

/**
 * Normalizes a hex color by adding # if missing (only for hex colors)
 */
function normalizeHexColor(color: string): string {
  const trimmed = color.trim();
  if (!trimmed) return trimmed;
  // Only normalize if it looks like a hex color (starts with # or is hex digits)
  const hexPattern = /^#?([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i;
  if (hexPattern.test(trimmed)) {
    return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
  }
  return trimmed;
}

/**
 * Checks if a string is a valid CSS color (hex, named colors, rgb, rgba, hsl, etc.)
 */
function isValidColor(color: string): boolean {
  if (!color) return false;
  const trimmed = color.trim();
  
  // Check if it's a hex color (with or without #)
  const hexPattern = /^#?([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i;
  if (hexPattern.test(trimmed)) {
    return true;
  }
  
  // Check if it's a valid CSS color by testing with the browser
  // Create a temporary element and check if the color is valid
  const s = new Option().style;
  s.color = trimmed;
  return s.color !== '';
}

/**
 * Color swatch component that displays a small square or circle
 * showing the color for hex color codes and CSS color names
 */
export function ColorSwatch({ 
  color, 
  size = "md", 
  shape = "square",
  className 
}: ColorSwatchProps) {
  const isValid = isValidColor(color);
  
  if (!isValid) {
    return null;
  }

  // Normalize hex colors, but keep CSS color names as-is
  const displayColor = normalizeHexColor(color);

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const shapeClasses = {
    square: "rounded",
    circle: "rounded-full",
  };

  return (
    <div
      className={cn(
        "inline-block border border-border/50 flex-shrink-0",
        sizeClasses[size],
        shapeClasses[shape],
        className
      )}
      style={{ backgroundColor: displayColor }}
      title={displayColor}
      aria-label={`Color: ${displayColor}`}
    />
  );
}

