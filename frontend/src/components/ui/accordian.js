"use client"

import React, { useState } from "react"

export function Accordion({ type = "single", collapsible = false, children, className = "", ...props }) {
  const [openItems, setOpenItems] = useState([])

  const toggleItem = (value) => {
    if (type === "single") {
      setOpenItems(openItems.includes(value) && collapsible ? [] : [value])
    } else {
      setOpenItems(openItems.includes(value) ? openItems.filter((item) => item !== value) : [...openItems, value])
    }
  }

  const updatedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        openItems,
        toggleItem,
      })
    }
    return child
  })

  return (
    <div className={`space-y-1 ${className}`} {...props}>
      {updatedChildren}
    </div>
  )
}

export function AccordionItem({ children, value, openItems, toggleItem, className = "", ...props }) {
  const isOpen = openItems?.includes(value)

  const updatedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        isOpen,
        value,
        toggleItem,
      })
    }
    return child
  })

  return (
    <div className={`border-b ${className}`} {...props}>
      {updatedChildren}
    </div>
  )
}

export function AccordionTrigger({ children, isOpen, value, toggleItem, className = "", ...props }) {
  return (
    <div
      onClick={() => toggleItem(value)}
      className={`flex items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180 cursor-pointer ${className}`}
      {...props}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  )
}

export function AccordionContent({ children, isOpen, className = "", ...props }) {
  return (
    <div
      className={`overflow-hidden text-sm transition-all ${isOpen ? "max-h-screen pb-4 pt-0" : "max-h-0"} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
