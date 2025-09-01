import * as React from "react"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-700 bg-slate-900/50 backdrop-blur-sm ${className}`}
      {...props}
    />
  )
}

export function CardHeader({ className = "", ...props }: CardProps) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
  )
}

export function CardTitle({ className = "", ...props }: CardProps) {
  return (
    <h3 className={`text-xl font-semibold leading-none tracking-tight text-white ${className}`} {...props} />
  )
}

export function CardContent({ className = "", ...props }: CardProps) {
  return (
    <div className={`p-6 pt-0 ${className}`} {...props} />
  )
}
