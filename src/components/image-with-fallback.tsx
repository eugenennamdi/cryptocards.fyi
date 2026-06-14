"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackIconSize?: number;
}

export function ImageWithFallback({ fallbackIconSize = 24, className, ...props }: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error || !props.src) {
    return (
      <div className={`flex items-center justify-center bg-muted/50 ${className}`}>
        <CreditCard size={fallbackIconSize} className="text-muted-foreground/50" />
      </div>
    );
  }

  return (
    <img
      {...props}
      className={className}
      onError={() => setError(true)}
    />
  );
}
