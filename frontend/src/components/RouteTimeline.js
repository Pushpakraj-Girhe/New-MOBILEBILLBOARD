export default function RouteTimeline({ routes }) {
  // If no routes are provided or routes is empty, show a placeholder
  if (!routes || routes.length === 0) {
    return (
      <div className="text-muted-foreground text-sm p-4 border rounded-md">
        No route data available for this time period.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {routes.map((route, index) => (
        <div key={index} className="relative pl-6 pb-4">
          {/* Timeline connector */}
          {index < routes.length - 1 && <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-border"></div>}

          {/* Timeline dot */}
          <div className="absolute left-0 top-1.5 h-5 w-5 rounded-full border-2 border-primary bg-background"></div>

          <div className="space-y-1">
            <div className="font-medium">{route.time}</div>
            <div className="font-semibold">{route.location}</div>
            {route.description && <div className="text-sm text-muted-foreground">{route.description}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

