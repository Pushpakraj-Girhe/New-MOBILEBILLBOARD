"use client"

import React, { useState } from "react"

export function Tabs({ defaultValue, children, className = "", ...props }) {
  const [activeTab, setActiveTab] = useState(defaultValue)

  const updatedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        activeTab,
        setActiveTab,
      })
    }
    return child
  })

  return (
    <div className={className} {...props}>
      {updatedChildren}
    </div>
  )
}

export function TabsList({ children, activeTab, setActiveTab, className = "", ...props }) {
  const updatedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        activeTab,
        setActiveTab,
      })
    }
    return child
  })

  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}
      {...props}
    >
      {updatedChildren}
    </div>
  )
}

export function TabsTrigger({ children, value, activeTab, setActiveTab, className = "", ...props }) {
  const isActive = activeTab === value

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
        isActive ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50 hover:text-foreground"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ children, value, activeTab, className = "", ...props }) {
  if (activeTab !== value) return null

  return (
    <div
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
