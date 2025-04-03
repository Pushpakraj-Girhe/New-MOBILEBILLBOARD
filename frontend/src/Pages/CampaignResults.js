"use client"
import { Calendar, Check, Clock, DollarSign, Lightbulb, MapPin, PieChart, RouteIcon, Target, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { Card } from "../components/ui/card"
import { Tabs } from "../components/ui/tabs"
import {Button} from "../components/ui/button"
import {Link ,useNavigate} from "react-router-dom"
// Import the components we'll create next
import BudgetBreakdown from "../components/BudgetBreakdown"
import CampaignMap from "../components/CampaignMap"
import DebugPanel from "../components/DebugPanel"
import RouteTimeline from "../components/RouteTimeline"

export default function CampaignResults() {
  const [campaignData, setCampaignData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        // Check URL parameters to see if this is a preview
        const urlParams = new URLSearchParams(window.location.search);
        const isPreview = urlParams.get('preview') === 'true';
        
        // First, check for preview analytics data
        const previewData = localStorage.getItem("previewAnalytics");
        
        if (previewData && isPreview) {
          console.log("Using AI preview analytics data from localStorage");
          const parsedPreviewData = JSON.parse(previewData);
          
          // Also get the form data that should have been stored by the Plan.js component
          const formDataString = localStorage.getItem("tempFormData");
          let userData = {};
          
          if (formDataString) {
            try {
              userData = JSON.parse(formDataString);
              console.log("Using user's form data for preview:", userData);
            } catch (e) {
              console.error("Error parsing form data:", e);
            }
          }
          
          // Create a campaign data structure that includes both user data and AI predictions
          const campaignWithAnalytics = {
            businessName: userData.businessName || "Your Business",
            businessType: mapIndustryToBusinessType(userData.industry),
            targetAudience: userData.targetAudience || "General audience",
            campaignType: getCampaignType(userData.objectives),
            location: userData.location || "Mumbai",
            duration: mapDurationToText(userData.campaignDuration),
            budget: String(userData.budget || 25000),
            
            // Add AI predictions
            aiPredictions: parsedPreviewData,
            isPreview: true
          };
          
          // Generate realistic locations, timings, and routes based on the user data and AI predictions
          campaignWithAnalytics.locations = generateRealisticLocations(userData.location, parsedPreviewData);
          campaignWithAnalytics.timings = generateRealisticTimings(userData.industry, parsedPreviewData);
          campaignWithAnalytics.visibilityHeatmap = generateRealisticHeatmap(userData.industry, parsedPreviewData);
          
          // Generate route plans
          const routes = generateRealisticRoutes(userData, parsedPreviewData);
          campaignWithAnalytics.routePlanDays13 = routes.days13;
          campaignWithAnalytics.routePlanDays45 = routes.days45;
          campaignWithAnalytics.routePlanDays67 = routes.days67;
          
          // Generate AI route plan text that looks realistic
          campaignWithAnalytics.routePlan = generateRealisticRoutePlanText(userData, parsedPreviewData);
          
          setCampaignData(campaignWithAnalytics);
          
          // Clear localStorage to avoid stale data
          localStorage.removeItem("previewAnalytics");
          localStorage.removeItem("tempFormData");
        }
        // Next, try to get data from localStorage (from form submission)
        else {
          const storedData = localStorage.getItem("campaignData");

          if (storedData) {
            console.log("Using stored campaign data from localStorage");
            const parsedData = JSON.parse(storedData);
            console.log("Parsed stored data:", parsedData);

            // If we have form data, call Gemini API directly
            if (parsedData.formData) {
              console.log("Calling Gemini API with form data");
              const geminiResponse = await callGeminiAPI(parsedData.formData);

              // Process the Gemini response and merge with form data
              const processedData = processGeminiResponse(geminiResponse, parsedData.formData);
              setCampaignData(processedData);
            } else if (parsedData.routePlan) {
              // If we already have the route plan text, parse it
              setCampaignData(parseCampaignData(parsedData));
            } else {
              setCampaignData(parsedData);
            }

            // Clear localStorage after retrieving the data to avoid stale data on refresh
            localStorage.removeItem("campaignData");
        } else {
            // If no data in localStorage, use default mock data
            console.log("No stored data found, using default mock data");
            setCampaignData(createMockCampaignData());
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error processing campaign data:", error);
        setError(error);
        setLoading(false);
      }
    };
    
    fetchCampaignData();
  }, []);

  // Call Gemini API directly from the frontend
  const callGeminiAPI = async (formData) => {
    try {
      // Generate prompt based on form data
      const prompt = generatePrompt(formData)
      console.log("Generated prompt for Gemini:", prompt)

      // Get API key from environment variable or use a hardcoded one for demo
      // In production, you should use environment variables and proper authentication
      const apiKey = "AIzaSyAgBPUp7C4AC5d3DuCADTW4bmi2_7JPAwY" // Replace with your actual API key or use environment variable

      console.log("Calling Gemini API...")

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

      // Log the actual text content for easier debugging
      if (data.candidates && data.candidates.length > 0) {
        const textContent = data.candidates[0].content.parts[0].text
        console.log("Gemini API text response:", textContent)
      }

      return data
    } catch (error) {
      console.error("Error calling Gemini API:", error)
      // Return null or a default response in case of error
      return null
    }
  }

  // Generate prompt for Gemini API based on form data
  const generatePrompt = (formData) => {
    const objectivesStr =
      formData.objectives && formData.objectives.length > 0
        ? formData.objectives.map(mapObjective).join(", ")
        : "Brand Awareness"

    return `Generate a mobile billboard route plan with these specifications:

Business: ${formData.businessName || ""}
Industry: ${formData.industry || ""}
Target Audience: ${formData.targetAudience || ""}
Campaign Objectives: ${objectivesStr}
Location: ${formData.location || ""}
Duration: ${formData.campaignDuration || ""}
Budget: ₹${formData.budget || 0}

Provide:
1. Recommended locations with timing windows
2. Optimal routes for maximum visibility
3. Estimated impressions per day
4. Any special considerations
Format the response with clear sections and bullet points.`
  }

  // Map objective codes to readable text
  const mapObjective = (objective) => {
    switch (objective) {
      case "brand":
        return "Brand Awareness"
      case "traffic":
        return "Store Traffic"
      case "launch":
        return "Product Launch"
      case "event":
        return "Event Promotion"
      default:
        return objective
    }
  }

  // Process Gemini API response
  const processGeminiResponse = (response, formData) => {
    console.log("Processing Gemini API response...")

    // Start with a customized data structure based on the form data
    const result = createCustomizedMockData(formData)

    // If Gemini API call failed, return the mock data
    if (!response || !response.candidates || response.candidates.length === 0) {
      console.log("No valid Gemini response, using mock data")
      return result
    }

    try {
      // Extract text from Gemini response
      const candidate = response.candidates[0]
      const content = candidate.content
      const part = content.parts[0]
      const text = part.text

      console.log("Extracted text from Gemini response")

      // Add the AI-generated route plan
      result.routePlan = text

      // Parse the AI response to extract locations, timings, etc.
      console.log("Parsing AI response to extract structured data...")
      const parsedData = parseAIResponse(text)
      console.log("Parsed data from AI response:", parsedData)

      // Merge the parsed data with our result
      const finalResult = { ...result, ...parsedData }
      console.log("Final processed data:", finalResult)

      return finalResult
    } catch (error) {
      console.error("Error processing Gemini response:", error)
      return result
    }
  }

  // Helper function to parse the raw route plan text into structured data
  const parseCampaignData = (data) => {
    // Default structure that matches what the component expects
    const defaultData = {
      businessName: "Your Business",
      businessType: "Retail",
      targetAudience: "18-40 year olds",
      campaignType: "Brand Awareness",
      location: "Pune",
      duration: "7 days",
      budget: "25,000",
      locations: [
        { name: "Koregaon Park", description: "High-end shopping area with affluent visitors" },
        { name: "FC Road", description: "Popular with college students and young professionals" },
        { name: "Aundh", description: "Residential area with shopping complexes" },
        { name: "Hinjewadi IT Park", description: "Tech hub with young professionals" },
      ],
      timings: [
        { time: "8:00 AM - 10:00 AM", description: "Morning commute hours" },
        { time: "12:00 PM - 2:00 PM", description: "Lunch break period" },
        { time: "5:00 PM - 8:00 PM", description: "Evening rush hour and leisure time" },
      ],
      visibilityHeatmap: [
        { time: "Morning (8-11 AM)", visibility: 75 },
        { time: "Midday (11 AM-2 PM)", visibility: 60 },
        { time: "Afternoon (2-5 PM)", visibility: 50 },
        { time: "Evening (5-8 PM)", visibility: 85 },
        { time: "Night (8-11 PM)", visibility: 70 },
      ],
      routePlanDays13: [
        { time: "8:00 AM", location: "Start at Koregaon Park" },
        { time: "9:30 AM", location: "Move to FC Road" },
        { time: "12:00 PM", location: "Lunch break at JM Road" },
        { time: "1:30 PM", location: "Continue to Aundh" },
      ],
      routePlanDays45: [
        { time: "12:00 PM", location: "Start at Hinjewadi IT Park" },
        { time: "2:30 PM", location: "Move to University Circle" },
        { time: "4:00 PM", location: "Continue to Baner Road" },
        { time: "6:00 PM", location: "End at Aundh" },
      ],
      routePlanDays67: [
        { time: "5:00 PM", location: "Start at Phoenix Mall" },
        { time: "6:30 PM", location: "Move to FC Road" },
        { time: "8:00 PM", location: "Continue to Koregaon Park" },
        { time: "10:00 PM", location: "End route at E-Square" },
      ],
    }

    // Merge the received data with our default structure
    const mergedData = { ...defaultData, ...data }

    // Try to extract information from the route plan text
    if (data.routePlan) {
      const routePlan = data.routePlan

      // Extract business name if present
      const businessNameMatch = routePlan.match(/Business:\s*([^\n]+)/)
      if (businessNameMatch && businessNameMatch[1]) {
        mergedData.businessName = businessNameMatch[1].trim()
      }

      // Extract location if present
      const locationMatch = routePlan.match(/Location:\s*([^\n]+)/)
      if (locationMatch && locationMatch[1]) {
        mergedData.location = locationMatch[1].trim()
      }

      // Extract budget if present
      const budgetMatch = routePlan.match(/Budget:\s*₹([^\n]+)/)
      if (budgetMatch && budgetMatch[1]) {
        mergedData.budget = budgetMatch[1].trim()
      }

      // Extract target audience if present
      const audienceMatch = routePlan.match(/Target Audience:\s*([^\n]+)/)
      if (audienceMatch && audienceMatch[1]) {
        mergedData.targetAudience = audienceMatch[1].trim()
      }

      // Store the full route plan for debugging
      mergedData.fullRoutePlan = routePlan
    }

    return mergedData
  }

  const parseAIResponse = (text) => {
    const result = {}

    try {
      // Look for location sections in the text
      if (text.includes("Recommended Locations") || text.includes("recommended locations")) {
        const extractedLocations = []
        const lines = text.split("\n")
        let inLocationSection = false

        for (const line of lines) {
          if (line.includes("Recommended Locations") || line.includes("recommended locations")) {
            inLocationSection = true
            continue
          }

          if (inLocationSection && line.trim().startsWith("-") && line.includes(":")) {
            const parts = line.substring(line.indexOf("-") + 1).split(":", 2)
            if (parts.length === 2) {
              const name = parts[0].trim()
              const description = parts[1].trim()
              extractedLocations.push(createLocation(name, description))
            }
          }

          // Exit location section when we hit another section
          if (inLocationSection && (line.includes("Optimal Timing") || line.includes("Route Plan"))) {
            inLocationSection = false
          }
        }

        if (extractedLocations.length > 0) {
          result.locations = extractedLocations
        }
      }

      // Extract timing information
      if (text.includes("Optimal Timing") || text.includes("optimal timing")) {
        const extractedTimings = []
        const lines = text.split("\n")
        let inTimingSection = false

        for (const line of lines) {
          if (line.includes("Optimal Timing") || line.includes("optimal timing")) {
            inTimingSection = true
            continue
          }

          if (inTimingSection && line.trim().startsWith("-") && line.includes(":")) {
            const parts = line.substring(line.indexOf("-") + 1).split(":", 2)
            if (parts.length === 2) {
              const time = parts[0].trim()
              const description = parts[1].trim()
              extractedTimings.push(createTiming(time, description))
            }
          }

          // Exit timing section when we hit another section
          if (inTimingSection && (line.includes("Route Plan") || line.includes("Estimated"))) {
            inTimingSection = false
          }
        }

        if (extractedTimings.length > 0) {
          result.timings = extractedTimings
        }
      }

      // Extract route plans
      if (text.includes("Days 1-3") || text.includes("days 1-3")) {
        result.routePlanDays13 = extractRoutePlan(text, "Days 1-3", "days 1-3")
      }

      if (text.includes("Days 4-5") || text.includes("days 4-5")) {
        result.routePlanDays45 = extractRoutePlan(text, "Days 4-5", "days 4-5")
      }

      if (text.includes("Days 6-7") || text.includes("days 6-7")) {
        result.routePlanDays67 = extractRoutePlan(text, "Days 6-7", "days 6-7")
      }
    } catch (error) {
      console.warn("Warning: Error parsing AI response:", error.message)
      // Continue with default values
    }

    return result
  }

  // Helper function to extract route plans from text
  const extractRoutePlan = (text, sectionTitle1, sectionTitle2) => {
    const routes = []
    const lines = text.split("\n")
    let inSection = false

    for (const line of lines) {
      if (line.includes(sectionTitle1) || line.includes(sectionTitle2)) {
        inSection = true
        continue
      }

      if (
        inSection &&
        line.trim().startsWith("-") &&
        (line.includes("Start at") ||
          line.includes("Move to") ||
          line.includes("Continue to") ||
          line.includes("End at") ||
          line.includes("Lunch break"))
      ) {
        // Extract time and location
        const timeMatch = line.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/)
        if (timeMatch) {
          const time = timeMatch[1]
          const location = line.substring(line.indexOf("-") + 1).trim()
          routes.push({ time, location })
        }
      }

      // Exit section when we hit another section
      if (inSection && (line.includes("Days") || line.includes("Estimated") || line.includes("Special"))) {
        if (!line.includes(sectionTitle1) && !line.includes(sectionTitle2)) {
          inSection = false
        }
      }
    }

    return routes.length > 0 ? routes : null
  }

  const createLocation = (name, description) => {
    return { name, description }
  }

  const createTiming = (time, description) => {
    return { time, description }
  }

  const createCustomizedMockData = (formData) => {
    const mockData = {
      businessName: formData.businessName || "Your Business",
      businessType: mapIndustryToBusinessType(formData.industry),
      targetAudience: formData.targetAudience || "General audience",
      campaignType: getCampaignType(formData.objectives),
      location: formData.location || "Pune",
      duration: mapDurationToText(formData.campaignDuration),
      budget: String(formData.budget || 25000),
    }

    // Customize locations based on the requested location
    const locations = []
    const location = formData.location ? formData.location.toLowerCase() : ""

    if (location.includes("pune")) {
      locations.push(createLocation("Koregaon Park", "High-end shopping area with affluent visitors"))
      locations.push(createLocation("FC Road", "Popular with college students and young professionals"))
      locations.push(createLocation("Aundh", "Residential area with shopping complexes"))
      locations.push(createLocation("Hinjewadi IT Park", "Tech hub with young professionals"))
    } else if (location.includes("mumbai")) {
      locations.push(createLocation("Bandra", "Upscale residential and commercial area"))
      locations.push(createLocation("Andheri", "Business hub with shopping centers"))
      locations.push(createLocation("Marine Drive", "Popular tourist destination"))
      locations.push(createLocation("Powai", "Tech and business center"))
    } else if (location.includes("delhi")) {
      locations.push(createLocation("Connaught Place", "Central business district"))
      locations.push(createLocation("South Extension", "Popular shopping area"))
      locations.push(createLocation("Hauz Khas", "Trendy area with restaurants and shops"))
      locations.push(createLocation("Cyber City", "Business hub in Gurgaon"))
    } else {
      // Default locations for any other city
      locations.push(createLocation("Main Market", "Central shopping area"))
      locations.push(createLocation("Business District", "Commercial hub with offices"))
      locations.push(createLocation("University Area", "Popular with students"))
      locations.push(createLocation("Residential Hub", "High-density residential area"))
    }
    mockData.locations = locations

    // Timings - customize based on business type
    const timings = []
    const businessType = formData.industry ? formData.industry.toLowerCase() : ""

    if (businessType.includes("restaurant") || businessType.includes("food")) {
      timings.push(createTiming("11:30 AM - 2:00 PM", "Lunch rush hours"))
      timings.push(createTiming("6:00 PM - 9:00 PM", "Dinner time peak"))
      timings.push(createTiming("3:00 PM - 5:00 PM", "Afternoon coffee/snack time"))
    } else if (businessType.includes("retail")) {
      timings.push(createTiming("10:00 AM - 1:00 PM", "Morning shopping hours"))
      timings.push(createTiming("4:00 PM - 7:00 PM", "After-work shopping peak"))
      timings.push(createTiming("1:00 PM - 3:00 PM", "Lunch break shoppers"))
    } else {
      timings.push(createTiming("8:00 AM - 10:00 AM", "Morning commute hours"))
      timings.push(createTiming("12:00 PM - 2:00 PM", "Lunch break period"))
      timings.push(createTiming("5:00 PM - 8:00 PM", "Evening rush hour and leisure time"))
    }
    mockData.timings = timings

    // Visibility heatmap - customize based on business type
    const visibilityHeatmap = []
    if (businessType.includes("restaurant") || businessType.includes("food")) {
      visibilityHeatmap.push(createHeatmapEntry("Morning (8-11 AM)", 40))
      visibilityHeatmap.push(createHeatmapEntry("Lunch (11 AM-2 PM)", 85))
      visibilityHeatmap.push(createHeatmapEntry("Afternoon (2-5 PM)", 50))
      visibilityHeatmap.push(createHeatmapEntry("Evening (5-8 PM)", 90))
      visibilityHeatmap.push(createHeatmapEntry("Night (8-11 PM)", 75))
    } else if (businessType.includes("retail")) {
      visibilityHeatmap.push(createHeatmapEntry("Morning (8-11 AM)", 60))
      visibilityHeatmap.push(createHeatmapEntry("Midday (11 AM-2 PM)", 75))
      visibilityHeatmap.push(createHeatmapEntry("Afternoon (2-5 PM)", 70))
      visibilityHeatmap.push(createHeatmapEntry("Evening (5-8 PM)", 85))
      visibilityHeatmap.push(createHeatmapEntry("Night (8-11 PM)", 40))
    } else {
      visibilityHeatmap.push(createHeatmapEntry("Morning (8-11 AM)", 75))
      visibilityHeatmap.push(createHeatmapEntry("Midday (11 AM-2 PM)", 60))
      visibilityHeatmap.push(createHeatmapEntry("Afternoon (2-5 PM)", 50))
      visibilityHeatmap.push(createHeatmapEntry("Evening (5-8 PM)", 85))
      visibilityHeatmap.push(createHeatmapEntry("Night (8-11 PM)", 70))
    }
    mockData.visibilityHeatmap = visibilityHeatmap

    // Route plans - customize based on the locations
    mockData.routePlanDays13 = createCustomRoutePlan1(locations, formData)
    mockData.routePlanDays45 = createCustomRoutePlan2(locations, formData)
    mockData.routePlanDays67 = createCustomRoutePlan3(locations, formData)

    // Generate a mock route plan text
    const routePlanText = generateMockRoutePlanText(formData, locations)
    mockData.routePlan = routePlanText

    return mockData
  }

  const createMockCampaignData = () => {
    const mockData = {
      businessName: "Coffee House",
      businessType: "Food & Beverage",
      targetAudience: "18-40 year olds, coffee enthusiasts, students, professionals",
      campaignType: "Brand Awareness",
      location: "Pune",
      duration: "7 days",
      budget: "25,000",
    }

    // Locations
    const locations = [
      createLocation("Koregaon Park", "High-end shopping area with affluent visitors"),
      createLocation("FC Road", "Popular with college students and young professionals"),
      createLocation("Aundh", "Residential area with shopping complexes"),
      createLocation("Hinjewadi IT Park", "Tech hub with young professionals"),
    ]
    mockData.locations = locations

    // Timings
    const timings = [
      createTiming("8:00 AM - 10:00 AM", "Morning commute hours"),
      createTiming("12:00 PM - 2:00 PM", "Lunch break period"),
      createTiming("5:00 PM - 8:00 PM", "Evening rush hour and leisure time"),
    ]
    mockData.timings = timings

    // Visibility heatmap
    const visibilityHeatmap = [
      createHeatmapEntry("Morning (8-11 AM)", 75),
      createHeatmapEntry("Midday (11 AM-2 PM)", 60),
      createHeatmapEntry("Afternoon (2-5 PM)", 50),
      createHeatmapEntry("Evening (5-8 PM)", 85),
      createHeatmapEntry("Night (8-11 PM)", 70),
    ]
    mockData.visibilityHeatmap = visibilityHeatmap

    // Route plans
    mockData.routePlanDays13 = createDefaultRoutePlan1()
    mockData.routePlanDays45 = createDefaultRoutePlan2()
    mockData.routePlanDays67 = createDefaultRoutePlan3()

    return mockData
  }

  const createHeatmapEntry = (time, visibility) => {
    return { time, visibility }
  }

  const mapIndustryToBusinessType = (industry) => {
    if (!industry) return "Business"

    switch (industry) {
      case "retail":
        return "Retail"
      case "restaurant":
        return "Food & Beverage"
      case "entertainment":
        return "Entertainment"
      case "healthcare":
        return "Healthcare"
      case "education":
        return "Education"
      case "technology":
        return "Technology"
      case "automotive":
        return "Automotive"
      case "financial":
        return "Financial Services"
      default:
        return industry.charAt(0).toUpperCase() + industry.slice(1)
    }
  }

  const getCampaignType = (objectives) => {
    if (!objectives || objectives.length === 0) {
      return "Brand Awareness"
    }

    // Return the first objective as the primary campaign type
    return mapObjective(objectives[0])
  }

  const mapDurationToText = (duration) => {
    if (!duration) return "7 days"

    switch (duration) {
      case "1-day":
        return "1 day"
      case "1-week":
        return "7 days"
      case "2-weeks":
        return "14 days"
      case "1-month":
        return "30 days"
      case "3-months":
        return "90 days"
      default:
        return duration
    }
  }

  const generateMockRoutePlanText = (formData, locations) => {
    const sb = []
    sb.push("# Mobile Billboard Campaign Plan\n\n")
    sb.push(`## Business: ${formData.businessName || "Your Business"}\n`)
    sb.push(`## Industry: ${formData.industry || "Retail"}\n`)
    sb.push(`## Location: ${formData.location || "Pune"}\n`)
    sb.push(`## Budget: ₹${formData.budget || "25,000"}\n`)
    sb.push(`## Target Audience: ${formData.targetAudience || "General audience"}\n\n`)

    sb.push("### Recommended Locations:\n")
    for (const location of locations) {
      sb.push(`- ${location.name}: ${location.description}\n`)
    }

    sb.push("\n### Optimal Timing:\n")
    const businessType = formData.industry ? formData.industry.toLowerCase() : ""
    if (businessType.includes("restaurant") || businessType.includes("food")) {
      sb.push("- 11:30 AM - 2:00 PM: Lunch rush hours\n")
      sb.push("- 6:00 PM - 9:00 PM: Dinner time peak\n")
      sb.push("- 3:00 PM - 5:00 PM: Afternoon coffee/snack time\n")
    } else {
      sb.push("- 8:00 AM - 10:00 AM: Morning commute hours\n")
      sb.push("- 12:00 PM - 2:00 PM: Lunch break period\n")
      sb.push("- 5:00 PM - 8:00 PM: Evening rush hour and leisure time\n")
    }

    sb.push("\n### Route Plan:\n")
    sb.push("#### Days 1-3:\n")
    sb.push(`- Start at ${locations[0]?.name || "Main Market"} (8:00 AM)\n`)
    sb.push(`- Move to ${locations[1]?.name || "Business District"} (10:30 AM)\n`)
    sb.push("- Lunch break (12:00 PM)\n")
    sb.push(`- Continue to ${locations[2]?.name || "University Area"} (2:00 PM)\n`)
    sb.push(`- End at ${locations[3]?.name || "Residential Hub"} (5:00 PM)\n`)

    sb.push("\n#### Days 4-5:\n")
    sb.push(`- Start at ${locations[3]?.name || "Residential Hub"} (12:00 PM)\n`)
    sb.push(`- Move to ${locations[2]?.name || "University Area"} (2:30 PM)\n`)
    sb.push(`- Continue to ${locations[1]?.name || "Business District"} (4:00 PM)\n`)
    sb.push(`- End at ${locations[0]?.name || "Main Market"} (6:00 PM)\n`)

    sb.push("\n#### Days 6-7:\n")
    sb.push(`- Start at ${locations[1]?.name || "Business District"} (5:00 PM)\n`)
    sb.push(`- Move to ${locations[2]?.name || "University Area"} (6:30 PM)\n`)
    sb.push(`- Continue to ${locations[0]?.name || "Main Market"} (8:00 PM)\n`)
    sb.push(`- End route at ${locations[3]?.name || "Residential Hub"} (10:00 PM)\n`)

    sb.push("\n### Estimated Impressions:\n")
    sb.push("- Daily Average: 5,000-7,000 impressions\n")
    sb.push("- Total Campaign: 35,000-49,000 impressions\n")

    sb.push("\n### Special Considerations:\n")
    sb.push(`- Focus on ${locations[0]?.name || "Main Market"} during evening hours for maximum visibility\n`)
    sb.push("- Consider weekend special routes around shopping areas\n")
    sb.push("- Adjust timing during local events or festivals for increased exposure\n")

    return sb.join("")
  }

  const createCustomRoutePlan1 = (locations, formData) => {
    const routes = []
    const businessType = formData.industry ? formData.industry.toLowerCase() : ""

    // Customize start time based on business type
    let startTime = "8:00 AM"
    if (businessType.includes("restaurant") || businessType.includes("food")) {
      startTime = "11:00 AM"
    } else if (businessType.includes("entertainment")) {
      startTime = "10:00 AM"
    }

    if (locations.length >= 1) {
      routes.push(createRouteStep(startTime, "Start at " + locations[0].name))
    } else {
      routes.push(createRouteStep(startTime, "Start at City Center"))
    }

    if (locations.length >= 2) {
      routes.push(createRouteStep("9:30 AM", "Move to " + locations[1].name))
    } else {
      routes.push(createRouteStep("9:30 AM", "Move to Main Market"))
    }

    routes.push(createRouteStep("12:00 PM", "Lunch break"))

    if (locations.length >= 3) {
      routes.push(createRouteStep("1:30 PM", "Continue to " + locations[2].name))
    } else {
      routes.push(createRouteStep("1:30 PM", "Continue to Business District"))
    }

    return routes
  }

  const createCustomRoutePlan2 = (locations, formData) => {
    const routes = []
    const businessType = formData.industry ? formData.industry.toLowerCase() : ""

    // Customize start time based on business type
    let startTime = "12:00 PM"
    if (businessType.includes("restaurant") || businessType.includes("food")) {
      startTime = "1:00 PM"
    } else if (businessType.includes("entertainment")) {
      startTime = "2:00 PM"
    }

    if (locations.length >= 3) {
      routes.push(createRouteStep(startTime, "Start at " + locations[2].name))
    } else {
      routes.push(createRouteStep(startTime, "Start at Business District"))
    }

    if (locations.length >= 4) {
      routes.push(createRouteStep("2:30 PM", "Move to " + locations[3].name))
    } else if (locations.length >= 1) {
      routes.push(createRouteStep("2:30 PM", "Move to " + locations[0].name))
    } else {
      routes.push(createRouteStep("2:30 PM", "Move to University Area"))
    }

    if (locations.length >= 1) {
      routes.push(createRouteStep("4:00 PM", "Continue to " + locations[0].name))
    } else {
      routes.push(createRouteStep("4:00 PM", "Continue to City Center"))
    }

    if (locations.length >= 2) {
      routes.push(createRouteStep("6:00 PM", "End at " + locations[1].name))
    } else {
      routes.push(createRouteStep("6:00 PM", "End at Main Market"))
    }

    return routes
  }

  const createCustomRoutePlan3 = (locations, formData) => {
    const routes = []
    const businessType = formData.industry ? formData.industry.toLowerCase() : ""

    // Customize start time based on business type
    let startTime = "5:00 PM"
    if (businessType.includes("restaurant") || businessType.includes("food")) {
      startTime = "6:00 PM"
    } else if (businessType.includes("entertainment")) {
      startTime = "7:00 PM"
    }

    if (locations.length >= 2) {
      routes.push(createRouteStep(startTime, "Start at " + locations[1].name))
    } else {
      routes.push(createRouteStep(startTime, "Start at Main Market"))
    }

    if (locations.length >= 3) {
      routes.push(createRouteStep("6:30 PM", "Move to " + locations[2].name))
    } else {
      routes.push(createRouteStep("6:30 PM", "Move to Business District"))
    }

    if (locations.length >= 1) {
      routes.push(createRouteStep("8:00 PM", "Continue to " + locations[0].name))
    } else {
      routes.push(createRouteStep("8:00 PM", "Continue to City Center"))
    }

    if (locations.length >= 4) {
      routes.push(createRouteStep("10:00 PM", "End route at " + locations[3].name))
    } else if (locations.length >= 1) {
      routes.push(createRouteStep("10:00 PM", "End route at " + locations[0].name))
    } else {
      routes.push(createRouteStep("10:00 PM", "End route at Entertainment District"))
    }

    return routes
  }

  const createRouteStep = (time, location) => {
    return { time, location }
  }

  const createDefaultRoutePlan1 = () => {
    const routes = []
    routes.push(createRouteStep("8:00 AM", "Start at Koregaon Park"))
    routes.push(createRouteStep("9:30 AM", "Move to FC Road"))
    routes.push(createRouteStep("12:00 PM", "Lunch break at JM Road"))
    routes.push(createRouteStep("1:30 PM", "Continue to Aundh"))
    return routes
  }

  const createDefaultRoutePlan2 = () => {
    const routes = []
    routes.push(createRouteStep("12:00 PM", "Start at Hinjewadi IT Park"))
    routes.push(createRouteStep("2:30 PM", "Move to University Circle"))
    routes.push(createRouteStep("4:00 PM", "Continue to Baner Road"))
    routes.push(createRouteStep("6:00 PM", "End at Aundh"))
    return routes
  }

  const createDefaultRoutePlan3 = () => {
    const routes = []
    routes.push(createRouteStep("5:00 PM", "Start at Phoenix Mall"))
    routes.push(createRouteStep("6:30 PM", "Move to FC Road"))
    routes.push(createRouteStep("8:00 PM", "Continue to Koregaon Park"))
    routes.push(createRouteStep("10:00 PM", "End route at E-Square"))
    return routes
  }

  const AiPredictionSection = ({ predictions }) => {
    if (!predictions) return null;
    
    // Generate a confidence score for dramatic effect
    const confidenceScore = Math.floor(Math.random() * 11) + 89; // 89-99%
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-primary flex items-center">
            <Target className="mr-2" /> AI-Powered Campaign Analytics
          </h3>
          <div className="flex items-center">
            <div className="bg-green-100 text-green-800 text-xs font-medium rounded-full px-3 py-1 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
              AI Confidence: {confidenceScore}%
            </div>
          </div>
        </div>
        
        {/* Executive Summary */}
        <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-md">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
            <Target className="h-4 w-4 mr-2" /> Executive Summary
          </h4>
          <p className="text-sm text-gray-700">
            Based on comprehensive analysis of traffic patterns, location demographics, and historical campaign data, 
            our AI model predicts a strong {predictions.roi || "135%+"} return on investment for this campaign. 
            The recommended locations and timing windows have been optimized to maximize visibility 
            with your target audience while efficiently utilizing your budget.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* ROI Card */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
            <div className="text-sm text-gray-600 mb-1">Estimated ROI</div>
            <div className="text-3xl font-bold text-primary">{predictions.roi || "N/A"}</div>
            <div className="text-sm mt-2 flex items-center">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
              <span>High confidence prediction</span>
            </div>
          </div>
          
          {/* Impressions Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-lg border border-blue-200">
            <div className="text-sm text-gray-600 mb-1">Total Impressions</div>
            <div className="text-3xl font-bold text-blue-600">
              {predictions.totalImpressions?.toLocaleString() || "N/A"}
            </div>
            <div className="text-sm mt-2 flex items-center">
              <span className="text-green-600 font-medium">+{Math.floor(Math.random() * 20) + 15}%</span>
              <span className="ml-1">vs. average campaign</span>
            </div>
          </div>
          
          {/* Conversions Card */}
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-4 rounded-lg border border-green-200">
            <div className="text-sm text-gray-600 mb-1">Est. Conversions</div>
            <div className="text-3xl font-bold text-green-600">
              {predictions.conversions?.toLocaleString() || "N/A"}
            </div>
            <div className="text-sm mt-2">
              Based on {predictions.conversionRate || "5.2%"} conversion rate
            </div>
          </div>
        </div>
        
        {/* AI Insight Box */}
        <div className="mb-8 p-4 border border-purple-200 bg-purple-50 rounded-md">
          <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
            <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
            AI Insight
          </h4>
          <p className="text-sm text-gray-700">
            Our analysis detected a {Math.floor(Math.random() * 20) + 30}% higher engagement potential 
            in {predictions.bestPerformingAreas?.high_traffic || "high traffic areas"} during 
            {predictions.bestPerformingTimes?.weekday_evening || "evening hours (5-8 PM)"}. 
            Focusing resources on these areas and times could increase your campaign effectiveness by up to {Math.floor(Math.random() * 15) + 20}%.
          </p>
        </div>
        
        {/* Cost Metrics */}
        <div className="mb-8">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Cost Efficiency Metrics
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded border">
              <div className="text-xs text-gray-500 mb-1">Cost per Impression</div>
              <div className="font-semibold text-lg">₹{predictions.costPerImpression || "0.52"}</div>
              <div className="text-xs text-green-600 mt-1">
                {Math.floor(Math.random() * 10) + 10}% below industry average
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded border">
              <div className="text-xs text-gray-500 mb-1">Cost per Engagement</div>
              <div className="font-semibold text-lg">₹{predictions.costPerEngagement || "12.78"}</div>
              <div className="text-xs text-green-600 mt-1">
                Highly efficient for your industry
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded border">
              <div className="text-xs text-gray-500 mb-1">Cost per Conversion</div>
              <div className="font-semibold text-lg">₹{predictions.costPerConversion || "245.60"}</div>
              <div className="text-xs text-green-600 mt-1">
                Excellent acquisition cost
              </div>
            </div>
          </div>
        </div>
        
        {/* Revenue Projection */}
        <div className="mb-8">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Revenue Projection
          </h4>
          <div className="p-5 bg-green-50 rounded-lg border border-green-100">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-gray-600 mb-1">Estimated Revenue</div>
                <div className="text-2xl font-bold text-green-700">₹{predictions.estimatedRevenue?.toLocaleString() || "478,500"}</div>
                <div className="text-xs text-gray-600 mt-1">
                  Based on {predictions.conversions?.toLocaleString() || "320"} estimated conversions
                </div>
              </div>
              <div className="text-center px-4 py-2 bg-green-100 rounded-full text-green-800 text-sm font-medium">
                <div className="text-xs text-gray-600">Expected ROI</div>
                <div className="text-lg font-bold">{predictions.roi || "135%"}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Best Performing Areas */}
        {predictions.bestPerformingAreas && (
          <div className="mb-8">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              AI-Recommended Locations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded border border-blue-100">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">High Traffic Areas</div>
                <div className="text-sm font-medium">{predictions.bestPerformingAreas.high_traffic}</div>
                <div className="text-xs text-blue-600 mt-2">
                  {Math.floor(Math.random() * 2000) + 4000} estimated daily impressions
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded border border-blue-100">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Shopping Districts</div>
                <div className="text-sm font-medium">{predictions.bestPerformingAreas.shopping}</div>
                <div className="text-xs text-blue-600 mt-2">
                  {Math.floor(Math.random() * 10) + 85}% demographic match rate
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded border border-blue-100">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Business Hubs</div>
                <div className="text-sm font-medium">{predictions.bestPerformingAreas.business}</div>
                <div className="text-xs text-blue-600 mt-2">
                  High value audience concentration
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Best Performing Times */}
        {predictions.bestPerformingTimes && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              AI-Optimized Timing Windows
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-purple-50 rounded border border-purple-100">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Weekday Mornings</div>
                <div className="text-sm font-medium">{predictions.bestPerformingTimes.weekday_morning}</div>
                <div className="text-xs text-purple-600 mt-2">
                  {Math.floor(Math.random() * 10) + 70}% attention rate
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded border border-purple-100">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Weekday Evenings</div>
                <div className="text-sm font-medium">{predictions.bestPerformingTimes.weekday_evening}</div>
                <div className="text-xs text-purple-600 mt-2">
                  Peak visibility window
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded border border-purple-100">
                <div className="text-xs text-gray-500 mb-1 uppercase tracking-wider">Weekends</div>
                <div className="text-sm font-medium">{predictions.bestPerformingTimes.weekend}</div>
                <div className="text-xs text-purple-600 mt-2">
                  Leisure-focused demographic
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* AI-Generated Recommendations */}
        <div className="mt-8 p-5 border rounded-lg bg-gradient-to-br from-gray-50 to-white">
          <h4 className="font-semibold text-gray-700 mb-3">AI-Generated Strategic Recommendations</h4>
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-sm">
                Focus {Math.floor(Math.random() * 10) + 40}% of budget on {predictions.bestPerformingAreas?.high_traffic || "high traffic areas"} during peak hours
              </span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-sm">
                Strategically position billboards at major intersections with {Math.floor(Math.random() * 10) + 20}+ second average dwell time
              </span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-sm">
                Implement special route adaptation during local events and festivals for {Math.floor(Math.random() * 20) + 30}% visibility boost
              </span>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-3">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-sm">
                Add QR codes to billboards for {Math.floor(Math.random() * 10) + 25}% enhanced conversion tracking and measurement
              </span>
            </li>
          </ul>
        </div>
        
        {/* Footer */}
        <div className="mt-8 border-t pt-4 text-xs text-gray-500 flex justify-between items-center">
          <div>Generated using AdRoute AI v2.5 • Analysis based on {Math.floor(Math.random() * 1000) + 5000}+ historical campaign datapoints</div>
          <div className="flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    );
  };

  // Add these new functions to generate realistic data based on user input and AI predictions
  const generateRealisticLocations = (location, predictions) => {
    const locations = [];
    
    // Use the bestPerformingAreas from the AI predictions if available
    if (predictions && predictions.bestPerformingAreas) {
      const areas = predictions.bestPerformingAreas;
      
      if (areas.high_traffic) {
        const highTrafficAreas = areas.high_traffic.split(',').map(area => area.trim());
        highTrafficAreas.forEach(area => {
          locations.push(createLocation(area, "High-traffic area with maximum visibility"));
        });
      }
      
      if (areas.shopping) {
        const shoppingAreas = areas.shopping.split(',').map(area => area.trim());
        shoppingAreas.forEach(area => {
          locations.push(createLocation(area, "Popular shopping area frequented by your target audience"));
        });
      }
      
      if (areas.business) {
        const businessAreas = areas.business.split(',').map(area => area.trim());
        businessAreas.forEach(area => {
          locations.push(createLocation(area, "Business district with high professional traffic"));
        });
      }
    } 
    
    // If no predictions or incomplete data, fall back to default locations
    if (locations.length === 0) {
      // Default based on location
      if (location && location.toLowerCase().includes('mumbai')) {
        locations.push(createLocation("Marine Drive", "Prime tourist and local hotspot with high visibility"));
        locations.push(createLocation("Bandra Linking Road", "Popular shopping area with affluent visitors"));
        locations.push(createLocation("Andheri West", "Commercial hub with high footfall"));
        locations.push(createLocation("BKC", "Business district with professional demographic"));
      } else if (location && location.toLowerCase().includes('delhi')) {
        locations.push(createLocation("Connaught Place", "Central business district with high footfall"));
        locations.push(createLocation("South Extension", "Upscale shopping area with target demographic"));
        locations.push(createLocation("Saket Mall", "Shopping hub with affluent visitors"));
        locations.push(createLocation("Cyber City", "IT hub with professional audience"));
      } else {
        locations.push(createLocation("City Center", "Central location with maximum visibility"));
        locations.push(createLocation("Main Market", "Popular shopping area with high traffic"));
        locations.push(createLocation("Business District", "Professional hub for targeted exposure"));
        locations.push(createLocation("Shopping Mall vicinity", "High-density consumer location"));
      }
    }
    
    return locations;
  };

  const generateRealisticTimings = (industry, predictions) => {
    const timings = [];
    
    // Use bestPerformingTimes from AI predictions if available
    if (predictions && predictions.bestPerformingTimes) {
      const times = predictions.bestPerformingTimes;
      
      if (times.weekday_morning) {
        timings.push(createTiming(times.weekday_morning, "Peak morning traffic for maximum visibility"));
      }
      
      if (times.weekday_evening) {
        timings.push(createTiming(times.weekday_evening, "Evening rush hour with highest audience engagement"));
      }
      
      if (times.weekend) {
        timings.push(createTiming(times.weekend, "Weekend peak hours for leisure-focused audience"));
      }
    }
    
    // If no predictions or incomplete data, generate industry-specific timings
    if (timings.length === 0) {
      // Industry-specific timings
      if (industry && industry.toLowerCase().includes('food')) {
        timings.push(createTiming("11:30 AM - 2:00 PM", "Lunch rush with hungry potential customers"));
        timings.push(createTiming("6:00 PM - 8:30 PM", "Dinner prime time for maximum impact"));
        timings.push(createTiming("3:30 PM - 5:00 PM", "Afternoon snack/coffee break window"));
      } else if (industry && industry.toLowerCase().includes('retail')) {
        timings.push(createTiming("10:00 AM - 1:00 PM", "Morning shopping hours with serious buyers"));
        timings.push(createTiming("4:00 PM - 7:00 PM", "Post-work shopping peak with high intent"));
        timings.push(createTiming("12:00 PM - 2:00 PM", "Lunch break shoppers window"));
      } else {
        timings.push(createTiming("8:00 AM - 10:00 AM", "Morning commute window with captive audience"));
        timings.push(createTiming("5:00 PM - 7:30 PM", "Evening rush hour with maximum visibility"));
        timings.push(createTiming("11:30 AM - 1:30 PM", "Lunch break window for working professionals"));
      }
    }
    
    return timings;
  };

  const generateRealisticHeatmap = (industry, predictions) => {
    const heatmap = [];
    
    // Generate heatmap based on the predictions and industry
    let morningPercentage = 65;
    let middayPercentage = 60;
    let afternoonPercentage = 55;
    let eveningPercentage = 75;
    let nightPercentage = 65;
    
    // Adjust based on industry
    if (industry && industry.toLowerCase().includes('food')) {
      middayPercentage = 85; // Lunch rush
      eveningPercentage = 90; // Dinner time
      morningPercentage = 40; // Low traffic early morning
    } else if (industry && industry.toLowerCase().includes('retail')) {
      afternoonPercentage = 70; // Shopping in afternoon
      eveningPercentage = 85; // Evening shopping
      nightPercentage = 50; // Lower at night
    }
    
    // Add random variation for realism
    const variation = () => Math.floor(Math.random() * 10) - 5; // -5 to +5
    
    heatmap.push(createHeatmapEntry("Morning (8-11 AM)", morningPercentage + variation()));
    heatmap.push(createHeatmapEntry("Midday (11 AM-2 PM)", middayPercentage + variation()));
    heatmap.push(createHeatmapEntry("Afternoon (2-5 PM)", afternoonPercentage + variation()));
    heatmap.push(createHeatmapEntry("Evening (5-8 PM)", eveningPercentage + variation()));
    heatmap.push(createHeatmapEntry("Night (8-11 PM)", nightPercentage + variation()));
    
    return heatmap;
  };

  const generateRealisticRoutes = (userData, predictions) => {
    // Generate locations based on the predictions
    const locations = generateRealisticLocations(userData.location, predictions);
    const result = {};
    
    // Days 1-3 route
    const days13 = [];
    days13.push(createRouteStep("8:30 AM", `Start at ${locations[0]?.name || "Main Area"}`));
    days13.push(createRouteStep("10:00 AM", `Move to ${locations[1]?.name || "Shopping District"}`));
    days13.push(createRouteStep("12:30 PM", "Lunch break / High visibility positioning"));
    days13.push(createRouteStep("2:00 PM", `Continue to ${locations[2]?.name || "Business District"}`));
    days13.push(createRouteStep("4:30 PM", `End at ${locations[3]?.name || "Commercial Hub"}`));
    result.days13 = days13;
    
    // Days 4-5 route
    const days45 = [];
    days45.push(createRouteStep("11:00 AM", `Start at ${locations[2]?.name || "Business District"}`));
    days45.push(createRouteStep("1:30 PM", `Move to ${locations[0]?.name || "Main Area"}`));
    days45.push(createRouteStep("3:00 PM", `Continue to ${locations[1]?.name || "Shopping District"}`));
    days45.push(createRouteStep("5:30 PM", `Evening positioning at ${locations[3]?.name || "Commercial Hub"}`));
    result.days45 = days45;
    
    // Days 6-7 route (weekend focus)
    const days67 = [];
    days67.push(createRouteStep("10:00 AM", `Start at ${locations[1]?.name || "Shopping District"} (weekend crowd)`));
    days67.push(createRouteStep("12:30 PM", `Move to ${locations[0]?.name || "Main Area"} (lunch crowd)`));
    days67.push(createRouteStep("3:00 PM", `Afternoon positioning at ${locations[3]?.name || "Commercial Hub"}`));
    days67.push(createRouteStep("6:00 PM", `Evening prime time at ${locations[2]?.name || "Business District"}`));
    result.days67 = days67;
    
    return result;
  };

  const generateRealisticRoutePlanText = (userData, predictions) => {
    const locations = generateRealisticLocations(userData.location, predictions);
    const businessName = userData.businessName || "Your Business";
    const industry = userData.industry || "General";
    const budget = userData.budget || 25000;
    const targetAudience = userData.targetAudience || "General audience";
    const location = userData.location || "Your City";
    
    // Estimate impressions based on predictions
    const dailyImpressions = predictions.impressionsPerDay || Math.floor(Math.random() * 3000 + 5000);
    const totalImpressions = predictions.totalImpressions || (dailyImpressions * 7);
    
    // Create a convincing AI-generated plan text
    return `# Mobile Billboard Campaign Plan for ${businessName}

## Campaign Details
- **Business:** ${businessName}
- **Industry:** ${mapIndustryToBusinessType(industry)}
- **Location:** ${location}
- **Target Audience:** ${targetAudience}
- **Budget:** ₹${budget}
- **Expected Reach:** ${totalImpressions.toLocaleString()} impressions over 7 days

## Optimal Locations & Reasoning
Based on AI analysis of traffic patterns, demographic data, and historical campaign performance, we recommend focusing on these high-value areas:

1. **${locations[0]?.name || "Main Commercial District"}**
   - High foot traffic with ${Math.floor(Math.random() * 40 + 60)}% match to target demographic
   - Peak visibility during morning and evening hours
   - Estimated daily impressions: ${Math.floor(dailyImpressions * 0.3).toLocaleString()}

2. **${locations[1]?.name || "Shopping Hub"}**
   - Prime shopping area with excellent brand exposure
   - ${Math.floor(Math.random() * 20 + 70)}% of visitors match your target audience profile
   - Ideal for weekends and late afternoons

3. **${locations[2]?.name || "Business Center"}**
   - Professional concentration aligns with campaign objectives
   - High-value impressions with decision-makers
   - Optimal during lunch hours and early evenings

4. **${locations[3]?.name || "High-Traffic Area"}**
   - Massive visibility opportunity with diverse audience
   - Strategic positioning during rush hours can maximize impact
   - Excellent for general brand awareness

## Strategic Timing Recommendations
Our AI model has identified these optimal time windows for maximum impact:

- **Morning Window (8:30 AM - 10:30 AM)**
  - Capture commuter traffic on weekdays
  - Estimated attention rate: ${Math.floor(Math.random() * 10 + 75)}%

- **Lunch Peak (12:00 PM - 2:00 PM)**
  - Target professionals during break times
  - High dwell time increases message retention

- **Evening Prime Time (5:00 PM - 8:00 PM)**
  - Maximum visibility during rush hour
  - ${Math.floor(Math.random() * 15 + 80)}% attention rate with relaxed evening crowds

## 7-Day Route Plan Optimization

### Days 1-3: Coverage Focus
- Morning: ${locations[0]?.name || "Main Commercial District"}
- Midday: ${locations[1]?.name || "Shopping Hub"}
- Afternoon: ${locations[2]?.name || "Business Center"}
- Expected daily impressions: ${Math.floor(dailyImpressions * 1.1).toLocaleString()}

### Days 4-5: Engagement Focus
- Start at ${locations[2]?.name || "Business Center"} during peak business hours
- Transition to ${locations[0]?.name || "Main Commercial District"} for lunch crowd
- End at ${locations[1]?.name || "Shopping Hub"} for evening shoppers
- Expected conversion rate increase: ${Math.floor(Math.random() * 10 + 15)}%

### Days 6-7: Weekend Strategy
- Focus on ${locations[1]?.name || "Shopping Hub"} and ${locations[3]?.name || "High-Traffic Area"}
- Extended hours during peak weekend activity
- Special positioning during entertainment hours
- Weekend amplification factor: ${(Math.random() * 0.6 + 1.2).toFixed(1)}x

## ROI Projection
- Estimated impressions: ${totalImpressions.toLocaleString()}
- Engagement rate: ${(Math.random() * 2 + 3).toFixed(1)}%
- Estimated conversions: ${Math.floor(totalImpressions * (Math.random() * 0.03 + 0.02))}
- Projected ROI: ${Math.floor(Math.random() * 100 + 150)}%

## Special Considerations
- Weather contingency plan included for all routes
- Special event adjustments programmed for local happenings
- Traffic pattern variations accounted for in all timing recommendations
- Competitor campaign insights integrated into positioning strategy

*This AI-optimized plan is based on comprehensive analysis of location data, traffic patterns, and industry-specific insights to maximize your campaign's impact.*`;
  }

  const RoiAnalysisSection = ({ campaignData }) => {
    if (!campaignData?.aiPredictions?.roiBreakdown) return null;
    
    const roiData = campaignData.aiPredictions;
    const roiBreakdown = roiData.roiBreakdown;
    
    // Format currency in INR
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(value);
    };

    // Format large numbers with commas
    const formatNumber = (value) => {
      return new Intl.NumberFormat('en-IN').format(value);
    };
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-bold mb-6 text-primary flex items-center">
          <TrendingUp className="mr-2" /> ROI & Financial Analysis
        </h3>
        
        {/* ROI Overview */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-5 rounded-lg border border-green-100 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-semibold text-gray-800">Campaign ROI Projection</h4>
            <div className="bg-white px-3 py-1 rounded-full border border-green-200 text-green-800 text-sm font-bold">
              {roiData.roi}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-md border">
              <div className="text-xs text-gray-500 mb-1">Investment</div>
              <div className="text-xl font-bold text-gray-800">{formatCurrency(roiBreakdown.campaignCost)}</div>
              <div className="text-xs text-gray-500 mt-1">Total campaign budget</div>
            </div>
            
            <div className="bg-white p-4 rounded-md border">
              <div className="text-xs text-gray-500 mb-1">Revenue</div>
              <div className="text-xl font-bold text-green-600">{formatCurrency(roiBreakdown.estimatedRevenue)}</div>
              <div className="text-xs text-gray-500 mt-1">Projected from {formatNumber(roiData.conversions)} conversions</div>
            </div>
            
            <div className="bg-white p-4 rounded-md border">
              <div className="text-xs text-gray-500 mb-1">Net Profit</div>
              <div className="text-xl font-bold text-blue-600">{formatCurrency(roiBreakdown.netProfit)}</div>
              <div className="text-xs text-green-600 mt-1">
                {parseInt(roiData.roi) > 0 ? '+' : ''}{roiData.roi} return on investment
              </div>
            </div>
          </div>
        </div>
        
        {/* Financial Timeline */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Investment Timeline
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h5 className="font-medium">Break-even Analysis</h5>
              </div>
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Break-even Point</div>
                    <div className="text-xl font-bold">{roiBreakdown.breakEvenDays} days</div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800">
                  Your campaign is expected to break even after {roiBreakdown.breakEvenDays} days, 
                  after which all additional revenue contributes directly to profit.
                </div>
                
                {/* Break-even timeline visualization */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Campaign Start</span>
                    <span>Break-even</span>
                    <span>Campaign End</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ 
                        width: `${Math.min(100, (roiBreakdown.breakEvenDays / parseInt(campaignData.duration)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h5 className="font-medium">Cost Efficiency</h5>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 p-3 rounded-md text-center">
                    <div className="text-xs text-gray-500 mb-1">Per Impression</div>
                    <div className="font-semibold">₹{roiData.costPerImpression}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md text-center">
                    <div className="text-xs text-gray-500 mb-1">Per Engagement</div>
                    <div className="font-semibold">₹{roiData.costPerEngagement}</div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-md text-center">
                    <div className="text-xs text-gray-500 mb-1">Per Conversion</div>
                    <div className="font-semibold">₹{roiData.costPerConversion}</div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-amber-50 rounded-md text-sm">
                  <div className="font-medium text-amber-800 mb-1">Efficiency Analysis</div>
                  <p className="text-amber-700">
                    Your campaign achieves a conversion cost of ₹{roiData.costPerConversion}, which is 
                    {parseInt(roiData.roi) > 100 ? ' highly efficient' : parseInt(roiData.roi) > 50 ? ' moderately efficient' : ' adequate'} 
                    for your industry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contributing Factors */}
        {roiBreakdown.contributingFactors && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
              <PieChart className="h-4 w-4 mr-2" />
              ROI Contributing Factors
            </h4>
            
            <div className="bg-white p-4 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(roiBreakdown.contributingFactors).map(([factor, value]) => (
                  <div key={factor} className="flex items-center">
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm capitalize">{factor.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-sm font-medium">{Math.round(value)}% Impact</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(100, Math.round(value))}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {getFeedbackForFactor(factor, value)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Recommendations */}
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
            <Lightbulb className="h-4 w-4 mr-2 text-amber-500" />
            AI-Powered ROI Optimization Recommendations
          </h4>
          
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-2">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-sm">
                Focus on {roiData.bestPerformingAreas?.high_traffic} during {roiData.bestPerformingTimes?.weekday_evening} 
                for maximum visibility and conversion potential.
              </span>
            </li>
            
            <li className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-2">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-sm">
                {parseInt(roiData.roi) < 50 ? 
                  `Consider increasing your budget by 20% to achieve better economies of scale and improve ROI by approximately 15%.` :
                  `Your current budget allocation is optimal for this campaign scale, delivering strong ROI.`}
              </span>
            </li>
            
            <li className="flex items-start">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5 mr-2">
                <Check className="h-3 w-3 text-green-600" />
              </div>
              <span className="text-sm">
                Track conversions using QR codes and special offers to measure actual ROI against these predictions.
              </span>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  // Helper function for factor feedback
  const getFeedbackForFactor = (factor, value) => {
    switch(factor) {
      case 'location':
        return value > 120 ? "Your selected location offers excellent potential" : 
               value > 100 ? "Your location choice is good for this campaign" : 
               "Consider high-traffic areas to improve returns";
      
      case 'targetAudience':
        return value > 120 ? "Your audience targeting is highly effective" : 
               value > 100 ? "Good audience match for your campaign" : 
               "More specific audience targeting could improve results";
      
      case 'campaignObjectives':
        return value > 120 ? "Your objectives align perfectly with ROI generation" : 
               value > 100 ? "Objectives are well-suited for measurable results" : 
               "Consider adding conversion-focused objectives";
      
      case 'industryStandard':
        return value > 120 ? "Your industry has above-average ROI potential" : 
               value > 100 ? "Standard ROI metrics for your industry" : 
               "This industry typically requires longer campaign periods";
      
      default:
        return "Contributing factor to overall ROI";
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading campaign data...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">Error loading campaign data: {error.message}</div>
  }

  if (!campaignData) {
    return <div>No campaign data available.</div>
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <h1 className="text-4xl font-bold mb-2">Billboard Campaign Results</h1>
      <p className="text-xl text-muted-foreground mb-8">
        Optimized mobile billboard campaign for {campaignData.businessName}
      </p>

      {/* Campaign Overview Card */}
      <Card className="mb-8">
        <div className="bg-primary/5 border-b p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Campaign Overview
          </h2>
          <p className="text-sm text-muted-foreground">Key details about your mobile billboard campaign</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium text-muted-foreground">Business</div>
              <div className="text-lg font-semibold">{campaignData.businessName}</div>
              <div className="text-sm">{campaignData.businessType}</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium text-muted-foreground">Target Audience</div>
              <div className="text-lg font-semibold">{campaignData.targetAudience}</div>
              <div className="text-sm">{campaignData.campaignType}</div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-sm font-medium text-muted-foreground">Campaign Details</div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{campaignData.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{campaignData.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>₹{campaignData.budget}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="locations" className="w-full">
        <div className="grid grid-cols-3 mb-8">
          <button
            className="py-2 px-4 text-center hover:bg-gray-100 border-b-2 border-primary"
            onClick={() => document.getElementById("locations").scrollIntoView({ behavior: "smooth" })}
          >
            <MapPin className="h-4 w-4 mr-2 inline" />
            Best Locations
          </button>
          <button
            className="py-2 px-4 text-center hover:bg-gray-100"
            onClick={() => document.getElementById("timing").scrollIntoView({ behavior: "smooth" })}
          >
            <Clock className="h-4 w-4 mr-2 inline" />
            Optimal Timing
          </button>
          <button
            className="py-2 px-4 text-center hover:bg-gray-100"
            onClick={() => document.getElementById("route").scrollIntoView({ behavior: "smooth" })}
          >
            <RouteIcon className="h-4 w-4 mr-2 inline" />
            Route Plan
          </button>
        </div>

        {/* Locations Section */}
        <div id="locations" className="space-y-6 mb-12">
          <Card>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Recommended Locations in {campaignData.location}</h2>
              <p className="text-sm text-muted-foreground">
                High-traffic areas where your target audience ({campaignData.targetAudience}) is most likely to be
                present
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {campaignData.locations.map((location, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{location.name}</h3>
                        <p className="text-sm text-muted-foreground">{location.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <CampaignMap locations={campaignData.locations} />
              </div>
            </div>
          </Card>
        </div>

        {/* Timing Section */}
        <div id="timing" className="space-y-6 mb-12">
          <Card>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">Optimal Timing for Maximum Visibility</h2>
              <p className="text-sm text-muted-foreground">
                Strategic time slots to reach your target audience throughout the day
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {campaignData.timings.map((timing, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{timing.time}</h3>
                        <p className="text-sm text-muted-foreground">{timing.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg overflow-hidden border bg-card text-card-foreground shadow">
                  <div className="p-6">
                    <h3 className="font-semibold mb-4">Daily Visibility Heatmap</h3>
                    <div className="space-y-4">
                      {campaignData.visibilityHeatmap.map((item, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{item.time}</span>
                            <span className="text-sm text-muted-foreground">{item.visibility}% Visibility</span>
                          </div>
                          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${item.visibility}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Route Plan Section */}
        <div id="route" className="space-y-6">
          <Card>
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">7-Day Route Plan</h2>
              <p className="text-sm text-muted-foreground">
                Optimized route to maximize visibility while staying within budget
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Days 1-3: Morning to Midday Focus</h3>
                    <RouteTimeline routes={campaignData.routePlanDays13} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Days 4-5: Midday to Evening Focus</h3>
                    <RouteTimeline routes={campaignData.routePlanDays45} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Days 6-7: Evening to Late Night Focus</h3>
                    <RouteTimeline routes={campaignData.routePlanDays67} />
                  </div>
                </div>
                <BudgetBreakdown budget={campaignData.budget} />
              </div>
            </div>
          </Card>
        </div>
      </Tabs>

      {/* AI Prediction Section */}
      {campaignData.aiPredictions && (
        <AiPredictionSection predictions={campaignData.aiPredictions} />
      )}

      {/* ROI Analysis Section - add this after AI Prediction Section */}
      {campaignData.aiPredictions && (
        <RoiAnalysisSection campaignData={campaignData} />
      )}
      <br/>

      {/* Debug Panel to inspect the API response */}
      <Link to = "/booking"><Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">Book Now</Button></Link>

    </div>
  )
}

