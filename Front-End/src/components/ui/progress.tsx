import * as React from "react"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

export function Progress({ value = 0, className = "", ...props }: ProgressProps) {
  return (
    <div className={`relative w-full h-2 bg-gray-200 rounded-full ${className}`} {...props}>
      <div
        className="absolute left-0 top-0 h-2 bg-blue-500 rounded-full transition-all duration-300"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}
