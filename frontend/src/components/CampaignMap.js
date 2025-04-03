"use client"
import { useState, useEffect, useRef } from "react"
import { MapPin } from "lucide-react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix for Leaflet marker icons in Next.js
const fixLeafletIcon = () => {
  delete L.Icon.Default.prototype._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  })
}

// Custom marker icon
const createCustomIcon = (color = "#4f46e5") => {
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  })
}

export default function CampaignMap({ locations }) {
  const [isMounted, setIsMounted] = useState(false)
  const [isMapVisible, setIsMapVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [routeData, setRouteData] = useState(null)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const routeLayerRef = useRef(null)

  // Use default locations if none provided
  const locationData = locations || [
    { name: "Default Location 1", description: "No locations provided", lat: 18.5204, lng: 73.8567 },
    { name: "Default Location 2", description: "No locations provided", lat: 18.5314, lng: 73.8446 },
  ]

  // Add coordinates to locations if not present
  const locationsWithCoords = locationData.map((loc, index) => {
    if (loc.lat && loc.lng) return loc

    // For Pune, use these approximate coordinates for demo
    const puneCoords = [
      { lat: 18.5204, lng: 73.8567 }, // Koregaon Park
      { lat: 18.5314, lng: 73.8446 }, // FC Road
      { lat: 18.5642, lng: 73.7769 }, // Aundh
      { lat: 18.5893, lng: 73.7362 }, // Hinjewadi IT Park
      { lat: 18.5074, lng: 73.8077 }, // Shivaji Nagar
      { lat: 18.4529, lng: 73.8507 }, // Swargate
      { lat: 18.5679, lng: 73.9143 }, // Viman Nagar
      { lat: 18.4634, lng: 73.8323 }, // Bibwewadi
    ]

    return {
      ...loc,
      lat: puneCoords[index % puneCoords.length].lat,
      lng: puneCoords[index % puneCoords.length].lng,
    }
  })

  useEffect(() => {
    setIsMounted(true)
    fixLeafletIcon()

    return () => {
      // Clean up map on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (isMounted && isMapVisible && mapRef.current && !mapInstanceRef.current) {
      initMap()
    }
  }, [isMounted, isMapVisible])

  useEffect(() => {
    if (mapInstanceRef.current && locationsWithCoords.length > 0) {
      updateMapMarkers()
      fetchRoute()
    }
  }, [locationsWithCoords, mapInstanceRef.current])

  const initMap = () => {
    // Initialize map
    const map = L.map(mapRef.current).setView([18.5204, 73.8567], 12)

    // Add tile layer (OpenStreetMap)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map
    setIsLoading(false)

    // Add markers and fetch route
    if (locationsWithCoords.length > 0) {
      updateMapMarkers()
      fetchRoute()
    }
  }

  const updateMapMarkers = () => {
    // Clear existing markers
    if (markersRef.current.length > 0) {
      markersRef.current.forEach((marker) => {
        if (mapInstanceRef.current) marker.remove()
      })
      markersRef.current = []
    }

    // Add new markers
    locationsWithCoords.forEach((location, index) => {
      if (!location.lat || !location.lng) return

      const marker = L.marker([location.lat, location.lng], {
        icon: createCustomIcon(),
        title: location.name,
      }).addTo(mapInstanceRef.current)

      marker.bindPopup(`<b>${location.name}</b><br>${location.description || ""}`)
      markersRef.current.push(marker)
    })

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const group = new L.featureGroup(markersRef.current)
      mapInstanceRef.current.fitBounds(group.getBounds(), { padding: [30, 30] })
    }
  }

  const fetchRoute = async () => {
    if (locationsWithCoords.length < 2) return

    try {
      // Clear existing route
      if (routeLayerRef.current && mapInstanceRef.current) {
        routeLayerRef.current.remove()
        routeLayerRef.current = null
      }

      // Get API key - in production, use environment variables
      const apiKey = "d3b4f982637b48539370523386495cbb" // Replace with your actual Geoapify API key

      // Prepare waypoints (first 10 locations max, as API might have limits)
      const waypoints = locationsWithCoords
        .slice(0, 10)
        .map((loc) => `${loc.lng},${loc.lat}`)
        .join("|")

      // Fetch route from Geoapify
      const response = await fetch(
        `https://api.geoapify.com/v1/routing?waypoints=${waypoints}&mode=drive&apiKey=${apiKey}`,
      )

      if (!response.ok) {
        throw new Error(`Geoapify API error: ${response.status}`)
      }

      const data = await response.json()
      setRouteData(data)

      // Draw route on map
      if (data.features && data.features.length > 0) {
        const routeLayer = L.geoJSON(data, {
          style: {
            color: "#4f46e5",
            weight: 5,
            opacity: 0.7,
            dashArray: "10, 10",
            lineJoin: "round",
          },
        }).addTo(mapInstanceRef.current)

        routeLayerRef.current = routeLayer
      }
    } catch (error) {
      console.error("Error fetching route:", error)

      // Fallback: draw straight lines between points
      drawFallbackRoute()
    }
  }

  const drawFallbackRoute = () => {
    if (!mapInstanceRef.current || locationsWithCoords.length < 2) return

    // Clear existing route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove()
      routeLayerRef.current = null
    }

    // Create a polyline between all points
    const points = locationsWithCoords.map((loc) => [loc.lat, loc.lng])
    const polyline = L.polyline(points, {
      color: "#4f46e5",
      weight: 4,
      opacity: 0.7,
      dashArray: "10, 10",
    }).addTo(mapInstanceRef.current)

    routeLayerRef.current = polyline
  }

  const toggleMap = () => {
    setIsMapVisible(!isMapVisible)
  }

  if (!isMounted) {
    return (
      <div className="h-[400px] rounded-lg border bg-card flex items-center justify-center">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    )
  }

  return (
    <div className="h-[400px] rounded-lg border bg-card overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 z-10 bg-white/90 p-2 border-b flex justify-between items-center">
        <div className="text-sm font-medium">Mobile Billboard Route</div>
        <button onClick={toggleMap} className="text-xs text-primary underline">
          {isMapVisible ? "Hide Map" : "Show Map"}
        </button>
      </div>

      {isMapVisible && (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="text-muted-foreground">Loading map...</div>
            </div>
          )}
          <div
            ref={mapRef}
            className="w-full h-full z-0"
            style={{ visibility: isLoading ? "hidden" : "visible" }}
          ></div>
        </>
      )}

      {!isMapVisible && (
        <div className="p-4 flex flex-col items-center justify-center h-full">
          <MapPin className="h-8 w-8 text-primary mb-2" />
          <h3 className="font-semibold text-lg">Map Hidden</h3>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Click "Show Map" to display the interactive route map
          </p>
          <div className="mt-4">
            <div className="font-medium mb-2">Recommended Locations:</div>
            <ul className="list-disc list-inside">
              {locationsWithCoords.map((location, index) => (
                <li key={index} className="text-sm">
                  {location.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

