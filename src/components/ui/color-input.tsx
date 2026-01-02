"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { ColorSwatch } from "@/components/ui/color-swatch";
import { cn } from "@/lib/utils";

export interface ColorInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showSwatch?: boolean;
  swatchPosition?: "left" | "right";
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
 * Input component that displays a color swatch when the value is a valid CSS color
 */
const ColorInput = forwardRef<HTMLInputElement, ColorInputProps>(
  ({ className, showSwatch = true, swatchPosition = "left", ...props }, ref) => {
    const value = props.value as string | undefined;
    const isValid = value && isValidColor(value);
    const shouldShowSwatch = showSwatch && isValid;

    return (
      <div className="relative flex items-center gap-2">
        {shouldShowSwatch && swatchPosition === "left" && (
          <ColorSwatch color={value} size="md" />
        )}
        <Input
          ref={ref}
          className={cn(className)}
          {...props}
        />
        {shouldShowSwatch && swatchPosition === "right" && (
          <ColorSwatch color={value} size="md" />
        )}
      </div>
    );
  }
);

ColorInput.displayName = "ColorInput";

export { ColorInput };

