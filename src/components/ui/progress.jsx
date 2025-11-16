import * as React from "react"
import { clsx } from "clsx"

const Progress = React.forwardRef(({ className, value = 0, max = 100, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <div
      className="h-full w-full flex-1 transition-all"
      style={{
        transform: `translateX(-${100 - (value / max) * 100}%)`,
        backgroundColor: props.style?.["--progress-color"] || "hsl(var(--primary))"
      }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }
