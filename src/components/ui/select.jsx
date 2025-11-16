import * as React from "react"
import { clsx } from "clsx"

const Select = ({ value, onValueChange, children, ...props }) => {
  return (
    <div className="relative" {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value, onValueChange })
        }
        return child
      })}
    </div>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, value, onValueChange, ...props }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <button
        ref={ref}
        type="button"
        className={clsx(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        {children}
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1">
          {React.Children.map(props.children, (child) => {
            if (React.isValidElement(child) && child.type === SelectContent) {
              return React.cloneElement(child, { 
                value, 
                onValueChange: (val) => {
                  onValueChange?.(val)
                  setIsOpen(false)
                }
              })
            }
            return null
          })}
        </div>
      )}
    </>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder, ...props }) => {
  const { value } = props
  return <span>{value || placeholder}</span>
}

const SelectContent = ({ className, children, value, onValueChange, ...props }) => (
  <div
    className={clsx(
      "relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md",
      className
    )}
    {...props}
  >
    <div className="p-1">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value, onValueChange })
        }
        return child
      })}
    </div>
  </div>
)

const SelectItem = ({ className, children, value: itemValue, ...props }) => {
  const { value, onValueChange } = props
  const isSelected = value === itemValue

  return (
    <div
      className={clsx(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground",
        className
      )}
      onClick={() => onValueChange?.(itemValue)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
