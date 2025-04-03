"use client"
import { useEffect, useState } from "react"

// This component dynamically loads Leaflet CSS to avoid SSR issues
export default function LeafletMapLoader() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Check if Leaflet CSS is already loaded
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      link.crossOrigin = ""

      link.onload = () => setLoaded(true)
      document.head.appendChild(link)
    } else {
      setLoaded(true)
    }
  }, [])

  return null
}

