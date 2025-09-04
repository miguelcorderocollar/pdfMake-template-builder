"use client";

import * as React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, ...props }, ref
) {
  return (
    <input
      ref={ref}
      className={[
        "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm",
        "placeholder:text-muted-foreground focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
});


