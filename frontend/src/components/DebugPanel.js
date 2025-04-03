"use client"
import { useState } from "react"
import { ChevronDown, ChevronUp, Code } from "lucide-react"

export default function DebugPanel({ data }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="mt-12 border rounded-lg overflow-hidden">
      <div
        className="p-4 bg-gray-100 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <Code className="h-5 w-5 mr-2" />
          <h3 className="font-semibold">Debug Panel (Developer View)</h3>
        </div>
        {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </div>
      {isOpen && (
        <div className="p-4 bg-gray-50 overflow-auto max-h-96">
          <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

