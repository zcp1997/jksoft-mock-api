"use client"

import React from "react"
import { Loader2 } from "lucide-react"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function Loading({ size = "md", text = "Loading...", className = "" }: LoadingProps): React.ReactElement {
  const sizeClass = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Loader2 className={`animate-spin text-indigo-600 ${sizeClass[size]}`} />
      {text && <p className="mt-4 text-gray-500 text-sm">{text}</p>}
    </div>
  )
} 