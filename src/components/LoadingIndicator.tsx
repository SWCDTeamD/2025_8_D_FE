import { Loader2 } from "lucide-react";
import React from "react";

interface LoadingIndicatorProps {
  label?: string;
  size?: "sm" | "md";
  variant?: "inline" | "centered";
  className?: string;
}

export function LoadingIndicator({
  label = "검색 중...",
  size = "sm",
  variant = "inline",
  className = "",
}: LoadingIndicatorProps) {
  const iconSize = size === "sm" ? "w-4 h-4" : "w-6 h-6";

  const content = (
    <div className={`flex items-center gap-2 text-muted-foreground ${className}`}>
      <Loader2 className={`${iconSize} animate-spin text-primary`} />
      <span className="animate-pulse">{label}</span>
    </div>
  );

  if (variant === "centered") {
    return (
      <div className="flex items-center justify-center py-8">
        {content}
      </div>
    );
  }

  return content;
}


