"use client"

import { useState, useRef, useEffect } from "react"

export function Slider({ min = 0, max = 100, step = 1, value = [0], onValueChange, className = "", ...props }) {
  const [localValue, setLocalValue] = useState(value)
  const trackRef = useRef(null)
  const isDragging = useRef(false)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleMouseDown = (e) => {
    isDragging.current = true
    updateValue(e)
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleMouseMove = (e) => {
    if (isDragging.current) {
      updateValue(e)
    }
  }

  const handleMouseUp = () => {
    isDragging.current = false
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }

  const updateValue = (e) => {
    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect()
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const newValue = Math.round((min + percent * (max - min)) / step) * step
      setLocalValue([newValue])
      onValueChange && onValueChange([newValue])
    }
  }

  const percentValue = ((localValue[0] - min) / (max - min)) * 100

  return (
    <div className={`relative flex w-full touch-none select-none items-center ${className}`} {...props}>
      <div
        ref={trackRef}
        className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute h-full bg-primary" style={{ width: `${percentValue}%` }} />
      </div>
      <div
        className="absolute h-5 w-5 rounded-full border-2 border-primary bg-background"
        style={{ left: `calc(${percentValue}% - 10px)` }}
        onMouseDown={handleMouseDown}
      />
    </div>
  )
}
