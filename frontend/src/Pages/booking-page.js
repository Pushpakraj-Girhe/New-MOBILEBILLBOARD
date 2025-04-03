"use client"

import { useState, useEffect } from "react"
import { useLocation, Link } from "react-router-dom"
import {
  Star,
  MapPin,
  Phone,
  DollarSign,
  Filter,
  Search,
  ArrowUpDown,
  Calendar,
  Clock,
  ChevronLeft,
} from "lucide-react"

const BookingPage = () => {
  const location = useLocation()
  const { state } = location
  const userLocation = state?.location || "Pune"
  const businessType = state?.businessType || "Retail"

  const [rentalCompanies, setRentalCompanies] = useState([])
  const [filteredCompanies, setFilteredCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("rating")
  const [priceFilter, setPriceFilter] = useState("all")

  // Make actual API call to Gemini
  useEffect(() => {
    const fetchRentalCompanies = async () => {
      setLoading(true)
      try {
        // API key provided by the user
        const apiKey = "AIzaSyAgBPUp7C4AC5d3DuCADTW4bmi2_7JPAwY"

        // Create a prompt for Gemini to get billboard rental companies
        const prompt = `Generate a detailed list of 5-8 mobile billboard rental companies near ${userLocation}, India that would be suitable for a ${businessType} business.

For each company, provide the following information in a structured format:
1. Company name
2. Location within ${userLocation}
3. Distance from city center (in km)
4. Rating (out of 5)
5. Number of reviews
6. Price range (in ₹ per day)
7. Price category (budget, standard, or premium)
8. Availability status
9. Brief description of services
10. 2-4 special features or services they offer

Format the response as JSON that can be parsed directly. Use this exact structure:
{
  "companies": [
    {
      "id": 1,
      "name": "Company Name",
      "location": "Area in ${userLocation}",
      "distance": "X.X km",
      "rating": "4.X",
      "reviews": XXX,
      "priceRange": "₹XX,XXX-XX,XXX/day",
      "priceCategory": "budget|standard|premium",
      "availability": "Available|Limited Availability",
      "description": "Brief description of their services",
      "features": ["Feature 1", "Feature 2", "Feature 3"]
    },
    ...more companies
  ]
}

Make sure the data is realistic for ${userLocation}, India with appropriate area names, pricing, and services.`

        console.log("Calling Gemini API with prompt:", prompt)

        // Call Gemini API
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
            }),
          },
        )

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Gemini API error response:", errorText)
          throw new Error(`Gemini API error: ${response.status} - ${errorText}`)
        }

        const data = await response.json()
        console.log("Gemini API response received:", data)

        // Extract the text content from the response
        if (data.candidates && data.candidates.length > 0) {
          const textContent = data.candidates[0].content.parts[0].text
          console.log("Gemini API text response:", textContent)

          // Parse the JSON from the text content
          try {
            // Find JSON in the response (in case there's additional text)
            const jsonMatch = textContent.match(/\{[\s\S]*\}/)
            const jsonString = jsonMatch ? jsonMatch[0] : textContent

            const parsedData = JSON.parse(jsonString)
            console.log("Parsed JSON data:", parsedData)

            if (parsedData.companies && Array.isArray(parsedData.companies)) {
              // Add image URLs to each company
              const companiesWithImages = parsedData.companies.map((company) => ({
                ...company,
                image: `/placeholder.svg?height=200&width=300&text=${encodeURIComponent(company.name)}`,
              }))

              setRentalCompanies(companiesWithImages)
              setFilteredCompanies(companiesWithImages)
            } else {
              throw new Error("Invalid data format: 'companies' array not found")
            }
          } catch (parseError) {
            console.error("Error parsing JSON from API response:", parseError)
            console.log("Raw text content:", textContent)
            throw new Error("Failed to parse API response")
          }
        } else {
          throw new Error("No content in API response")
        }
      } catch (error) {
        console.error("Error fetching rental companies:", error)
        setError(error.message)
        // Fallback to empty array if API fails
        setRentalCompanies([])
        setFilteredCompanies([])
      } finally {
        setLoading(false)
      }
    }

    fetchRentalCompanies()
  }, [userLocation, businessType])

  // Filter and sort companies
  useEffect(() => {
    let results = [...rentalCompanies]

    // Apply search filter
    if (searchTerm) {
      results = results.filter(
        (company) =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.location.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply price filter
    if (priceFilter !== "all") {
      results = results.filter((company) => company.priceCategory === priceFilter)
    }

    // Apply sorting
    if (sortBy === "rating") {
      results.sort((a, b) => Number.parseFloat(b.rating) - Number.parseFloat(a.rating))
    } else if (sortBy === "distance") {
      results.sort((a, b) => {
        const aDistance = Number.parseFloat(a.distance.replace(" km", ""))
        const bDistance = Number.parseFloat(b.distance.replace(" km", ""))
        return aDistance - bDistance
      })
    } else if (sortBy === "price-low") {
      results.sort((a, b) => {
        const aPrice = Number.parseInt(a.priceRange.match(/₹(\d+),/)[1])
        const bPrice = Number.parseInt(b.priceRange.match(/₹(\d+),/)[1])
        return aPrice - bPrice
      })
    } else if (sortBy === "price-high") {
      results.sort((a, b) => {
        const aPrice = Number.parseInt(a.priceRange.match(/₹(\d+),/)[1])
        const bPrice = Number.parseInt(b.priceRange.match(/₹(\d+),/)[1])
        return bPrice - aPrice
      })
    }

    setFilteredCompanies(results)
  }, [rentalCompanies, searchTerm, sortBy, priceFilter])

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  // Handle sort change
  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  // Handle price filter change
  const handlePriceFilterChange = (e) => {
    setPriceFilter(e.target.value)
  }

  // Render star rating
  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-4 h-4 text-yellow-400" />
          <div className="absolute top-0 left-0 overflow-hidden w-1/2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>,
      )
    }

    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-yellow-400" />)
    }

    return <div className="flex">{stars}</div>
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Campaign Results
        </Link>
        <h1 className="text-3xl font-bold mb-2">Mobile Billboard Rentals</h1>
        <p className="text-gray-600">
          Find the best mobile billboard providers near {userLocation} for your {businessType.toLowerCase()} business
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or location"
              className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <ArrowUpDown className="h-4 w-4 text-gray-400" />
              </div>
              <select
                className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="rating">Sort by: Rating</option>
                <option value="distance">Sort by: Distance</option>
                <option value="price-low">Sort by: Price (Low to High)</option>
                <option value="price-high">Sort by: Price (High to Low)</option>
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={priceFilter}
                onChange={handlePriceFilterChange}
              >
                <option value="all">All Price Ranges</option>
                <option value="budget">Budget-Friendly</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{filteredCompanies.length} Billboard Providers Available</h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Error loading billboard providers</h3>
            <p>{error}</p>
            <button className="mt-2 text-blue-500 hover:text-blue-700" onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-gray-500 mb-4">No billboard providers found matching your criteria</div>
            <button
              className="text-blue-500 hover:text-blue-700"
              onClick={() => {
                setSearchTerm("")
                setPriceFilter("all")
                setSortBy("rating")
              }}
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredCompanies.map((company) => (
              <div key={company.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 p-4">
                    <img
                      src={company.image || "/placeholder.svg"}
                      alt={company.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>

                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold">{company.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          company.availability === "Available"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {company.availability}
                      </span>
                    </div>

                    <div className="flex items-center mb-4">
                      {renderStars(Number.parseFloat(company.rating))}
                      <span className="ml-2 text-gray-600">
                        {company.rating} ({company.reviews} reviews)
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4">{company.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4 mb-4">
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 text-gray-500 mr-2" />
                        <span>
                          {company.location} ({company.distance})
                        </span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
                        <span>{company.priceRange}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-5 h-5 text-gray-500 mr-2" />
                        <span>+91 {Math.floor(Math.random() * 9000000000) + 1000000000}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-gray-500 mr-2" />
                        <span>Response time: 2-4 hours</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {company.features.map((feature, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md flex items-center justify-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Book Now
                      </button>
                      <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-6 rounded-md flex items-center justify-center gap-2">
                        <Phone className="w-5 h-5" />
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Tips Section */}
      <div className="bg-blue-50 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-3">Tips for Booking Mobile Billboards</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-2">
              <span className="text-blue-600 text-xs font-bold">1</span>
            </div>
            <span>Book at least 2 weeks in advance for the best availability and rates</span>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-2">
              <span className="text-blue-600 text-xs font-bold">2</span>
            </div>
            <span>Consider booking multiple days for better pricing and campaign effectiveness</span>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-2">
              <span className="text-blue-600 text-xs font-bold">3</span>
            </div>
            <span>Ask about route customization options to target specific neighborhoods</span>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 mr-2">
              <span className="text-blue-600 text-xs font-bold">4</span>
            </div>
            <span>Request analytics and reporting to measure your campaign's effectiveness</span>
          </li>
        </ul>
      </div>

      {/* Need Help Section */}
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Need Help Finding the Right Billboard Provider?</h3>
        <p className="text-gray-600 mb-4">Our team can help you find the perfect match for your campaign needs</p>
        <button className="bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-6 rounded-md">
          Get Expert Assistance
        </button>
      </div>
    </div>
  )
}

export default BookingPage

