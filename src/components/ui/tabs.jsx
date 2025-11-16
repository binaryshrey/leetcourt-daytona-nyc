import * as React from "react"
import { clsx } from "clsx"

const Tabs = ({ defaultValue, value: controlledValue, onValueChange, className, children, ...props }) => {
  const [value, setValue] = React.useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const currentValue = isControlled ? controlledValue : value

  const handleValueChange = (newValue) => {
    if (!isControlled) {
      setValue(newValue)
    }
    onValueChange?.(newValue)
  }

  return (
    <div className={clsx("w-full", className)} {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value: currentValue, onValueChange: handleValueChange })
        }
        return child
      })}
    </div>
  )
}

const TabsList = ({ className, children, ...props }) => (
  <div
    className={clsx(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  >
    {children}
  </div>
)

const TabsTrigger = ({ className, value: triggerValue, children, ...props }) => {
  const { value, onValueChange } = props
  const isActive = value === triggerValue

  return (
    <button
      type="button"
      className={clsx(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-background text-foreground shadow-sm",
        className
      )}
      onClick={() => onValueChange?.(triggerValue)}
      {...props}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ className, value: contentValue, children, ...props }) => {
  const { value } = props
  if (value !== contentValue) return null

  return (
    <div
      className={clsx(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
