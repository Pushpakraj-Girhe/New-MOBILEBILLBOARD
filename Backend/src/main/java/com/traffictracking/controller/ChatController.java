package com.traffictracking.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;
import java.io.PrintStream;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST})
public class ChatController {

    // Using System.out and System.err instead of SLF4J
    private static final PrintStream console = System.out;
    private static final PrintStream errorConsole = System.err;

    private static final int MIN_BUDGET = 1000;
    private static final int MAX_BUDGET = 50000;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/generateRoute")
    public ResponseEntity<Map<String, Object>> getDefaultRoutePlan() {
        // This endpoint returns mock data for testing or when no form data is submitted
        Map<String, Object> mockData = createMockCampaignData();
        return ResponseEntity.ok(mockData);
    }

    @PostMapping("/generateRoute")
    public ResponseEntity<Map<String, Object>> generateRoutePlan(@RequestBody CampaignRequest request) {
        try {
            // Log the received request for debugging
            console.println("Received request: " + request.getBusinessName() + ", " +
                    request.getIndustry() + ", Budget: " + request.getBudget());

            // Validate request
            ResponseEntity<Map<String, Object>> validationResponse = validateRequest(request);
            if (validationResponse != null) {
                return validationResponse;
            }

            // Generate prompt
            String prompt = generatePrompt(request);
            console.println("Generated prompt: " + prompt);

            // IMPORTANT: Always use customized data based on the request
            Map<String, Object> customizedData = createCustomizedMockData(request);

            // Check if Gemini API key is available
            if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
                console.println("Warning: Gemini API key is not set. Using customized mock data instead.");
                return ResponseEntity.ok(customizedData);
            }

            try {
                // Call Gemini API
                Map<String, Object> geminiResponse = callGeminiAPI(prompt);

                // Process and return response
                Map<String, Object> processedResponse = processGeminiResponse(geminiResponse, request);
                return ResponseEntity.ok(processedResponse);
            } catch (Exception e) {
                errorConsole.println("Error calling Gemini API: " + e.getMessage());
                e.printStackTrace(errorConsole);

                // Fallback to customized mock data if API call fails
                console.println("Falling back to customized mock data due to API error");
                return ResponseEntity.ok(customizedData);
            }

        } catch (Exception e) {
            errorConsole.println("Error generating route plan: " + e.getMessage());
            e.printStackTrace(errorConsole);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "An unexpected error occurred"));
        }
    }

    private ResponseEntity<Map<String, Object>> validateRequest(CampaignRequest request) {
        if (request.getBusinessName() == null || request.getBusinessName().trim().isEmpty()) {
            return badRequest("Business name is required");
        }
        if (request.getIndustry() == null || request.getIndustry().trim().isEmpty()) {
            return badRequest("Industry is required");
        }
        if (request.getTargetAudience() == null || request.getTargetAudience().trim().isEmpty()) {
            return badRequest("Target audience is required");
        }
        // Check if objectives is null, but don't require it to be non-empty
        if (request.getObjectives() == null) {
            // Initialize with an empty list instead of returning an error
            request.setObjectives(new ArrayList<>());
        }
        if (request.getLocation() == null || request.getLocation().trim().isEmpty()) {
            return badRequest("Location is required");
        }
        if (request.getCampaignDuration() == null || request.getCampaignDuration().trim().isEmpty()) {
            return badRequest("Campaign duration is required");
        }
        if (request.getBudget() < MIN_BUDGET || request.getBudget() > MAX_BUDGET) {
            return badRequest(String.format("Budget must be between ₹%d and ₹%d", MIN_BUDGET, MAX_BUDGET));
        }
        return null;
    }

    private ResponseEntity<Map<String, Object>> badRequest(String message) {
        return ResponseEntity.badRequest().body(Collections.singletonMap("error", message));
    }

    private String generatePrompt(CampaignRequest request) {
        String objectivesStr = request.getObjectives() != null && !request.getObjectives().isEmpty() ?
                request.getObjectives().stream()
                        .map(this::mapObjective)
                        .collect(Collectors.joining(", ")) :
                "Brand Awareness";

        return String.format(
                "Generate a mobile billboard route plan with these specifications:\n\n" +
                        "Business: %s\n" +
                        "Industry: %s\n" +
                        "Target Audience: %s\n" +
                        "Campaign Objectives: %s\n" +
                        "Location: %s\n" +
                        "Duration: %s\n" +
                        "Budget: ₹%d\n\n" +
                        "Provide:\n" +
                        "1. Recommended locations with timing windows\n" +
                        "2. Optimal routes for maximum visibility\n" +
                        "3. Estimated impressions per day\n" +
                        "4. Any special considerations\n" +
                        "Format the response with clear sections and bullet points.",
                sanitize(request.getBusinessName()),
                sanitize(request.getIndustry()),
                sanitize(request.getTargetAudience()),
                objectivesStr,
                sanitize(request.getLocation()),
                sanitize(request.getCampaignDuration()),
                request.getBudget()
        );
    }

    private String mapObjective(String objective) {
        switch(objective) {
            case "brand": return "Brand Awareness";
            case "traffic": return "Store Traffic";
            case "launch": return "Product Launch";
            case "event": return "Event Promotion";
            default: return objective;
        }
    }

    private String sanitize(String text) {
        if (text == null) return "";
        return text.replaceAll("[^a-zA-Z0-9\\s]", "");
    }

    private Map<String, Object> callGeminiAPI(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        Map<String, String> part = new HashMap<>();

        part.put("text", prompt);
        content.put("parts", Collections.singletonList(part));
        requestBody.put("contents", Collections.singletonList(content));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
        return restTemplate.exchange(
                GEMINI_URL + "?key=" + geminiApiKey,
                HttpMethod.POST,
                entity,
                Map.class
        ).getBody();
    }

    private Map<String, Object> processGeminiResponse(Map<String, Object> response, CampaignRequest request) {
        if (response == null || !response.containsKey("candidates")) {
            throw new RuntimeException("Invalid response from Gemini API");
        }

        try {
            Map<String, Object> candidate = ((List<Map<String, Object>>) response.get("candidates")).get(0);
            Map<String, Object> content = (Map<String, Object>) candidate.get("content");
            Map<String, String> part = ((List<Map<String, String>>) content.get("parts")).get(0);
            String text = part.get("text");

            // Start with a customized data structure based on the request
            Map<String, Object> result = createCustomizedMockData(request);

            // Add the AI-generated route plan
            result.put("routePlan", text);

            // Parse the AI response to extract locations, timings, etc.
            Map<String, Object> parsedData = parseAIResponse(text);
            result.putAll(parsedData);

            // Add timestamp
            result.put("timestamp", new Date());

            return result;

        } catch (Exception e) {
            errorConsole.println("Error processing Gemini response: " + e.getMessage());
            e.printStackTrace(errorConsole);
            throw new RuntimeException("Failed to process Gemini response");
        }
    }

    private Map<String, Object> createCustomizedMockData(CampaignRequest request) {
        Map<String, Object> mockData = new HashMap<>();

        // Use the actual request data instead of hardcoded values
        mockData.put("businessName", request.getBusinessName());
        mockData.put("businessType", mapIndustryToBusinessType(request.getIndustry()));
        mockData.put("targetAudience", request.getTargetAudience());
        mockData.put("campaignType", getCampaignType(request.getObjectives()));
        mockData.put("location", request.getLocation());
        mockData.put("duration", mapDurationToText(request.getCampaignDuration()));
        mockData.put("budget", String.valueOf(request.getBudget()));

        // Customize locations based on the requested location
        List<Map<String, String>> locations = new ArrayList<>();
        String location = request.getLocation() != null ? request.getLocation().toLowerCase() : "";

        if (location.contains("pune")) {
            locations.add(createLocation("Koregaon Park", "High-end shopping area with affluent visitors"));
            locations.add(createLocation("FC Road", "Popular with college students and young professionals"));
            locations.add(createLocation("Aundh", "Residential area with shopping complexes"));
            locations.add(createLocation("Hinjewadi IT Park", "Tech hub with young professionals"));
        } else if (location.contains("mumbai")) {
            locations.add(createLocation("Bandra", "Upscale residential and commercial area"));
            locations.add(createLocation("Andheri", "Business hub with shopping centers"));
            locations.add(createLocation("Marine Drive", "Popular tourist destination"));
            locations.add(createLocation("Powai", "Tech and business center"));
        } else if (location.contains("delhi")) {
            locations.add(createLocation("Connaught Place", "Central business district"));
            locations.add(createLocation("South Extension", "Popular shopping area"));
            locations.add(createLocation("Hauz Khas", "Trendy area with restaurants and shops"));
            locations.add(createLocation("Cyber City", "Business hub in Gurgaon"));
        } else {
            // Default locations for any other city
            locations.add(createLocation("Main Market", "Central shopping area"));
            locations.add(createLocation("Business District", "Commercial hub with offices"));
            locations.add(createLocation("University Area", "Popular with students"));
            locations.add(createLocation("Residential Hub", "High-density residential area"));
        }
        mockData.put("locations", locations);

        // Timings - customize based on business type
        List<Map<String, String>> timings = new ArrayList<>();
        String businessType = request.getIndustry() != null ? request.getIndustry().toLowerCase() : "";

        if (businessType.contains("restaurant") || businessType.contains("food")) {
            timings.add(createTiming("11:30 AM - 2:00 PM", "Lunch rush hours"));
            timings.add(createTiming("6:00 PM - 9:00 PM", "Dinner time peak"));
            timings.add(createTiming("3:00 PM - 5:00 PM", "Afternoon coffee/snack time"));
        } else if (businessType.contains("retail")) {
            timings.add(createTiming("10:00 AM - 1:00 PM", "Morning shopping hours"));
            timings.add(createTiming("4:00 PM - 7:00 PM", "After-work shopping peak"));
            timings.add(createTiming("1:00 PM - 3:00 PM", "Lunch break shoppers"));
        } else {
            timings.add(createTiming("8:00 AM - 10:00 AM", "Morning commute hours"));
            timings.add(createTiming("12:00 PM - 2:00 PM", "Lunch break period"));
            timings.add(createTiming("5:00 PM - 8:00 PM", "Evening rush hour and leisure time"));
        }
        mockData.put("timings", timings);

        // Visibility heatmap - customize based on business type
        List<Map<String, Object>> visibilityHeatmap = new ArrayList<>();
        if (businessType.contains("restaurant") || businessType.contains("food")) {
            visibilityHeatmap.add(createHeatmapEntry("Morning (8-11 AM)", 40));
            visibilityHeatmap.add(createHeatmapEntry("Lunch (11 AM-2 PM)", 85));
            visibilityHeatmap.add(createHeatmapEntry("Afternoon (2-5 PM)", 50));
            visibilityHeatmap.add(createHeatmapEntry("Evening (5-8 PM)", 90));
            visibilityHeatmap.add(createHeatmapEntry("Night (8-11 PM)", 75));
        } else if (businessType.contains("retail")) {
            visibilityHeatmap.add(createHeatmapEntry("Morning (8-11 AM)", 60));
            visibilityHeatmap.add(createHeatmapEntry("Midday (11 AM-2 PM)", 75));
            visibilityHeatmap.add(createHeatmapEntry("Afternoon (2-5 PM)", 70));
            visibilityHeatmap.add(createHeatmapEntry("Evening (5-8 PM)", 85));
            visibilityHeatmap.add(createHeatmapEntry("Night (8-11 PM)", 40));
        } else {
            visibilityHeatmap.add(createHeatmapEntry("Morning (8-11 AM)", 75));
            visibilityHeatmap.add(createHeatmapEntry("Midday (11 AM-2 PM)", 60));
            visibilityHeatmap.add(createHeatmapEntry("Afternoon (2-5 PM)", 50));
            visibilityHeatmap.add(createHeatmapEntry("Evening (5-8 PM)", 85));
            visibilityHeatmap.add(createHeatmapEntry("Night (8-11 PM)", 70));
        }
        mockData.put("visibilityHeatmap", visibilityHeatmap);

        // Route plans - customize based on the locations
        mockData.put("routePlanDays13", createCustomRoutePlan1(locations, request));
        mockData.put("routePlanDays45", createCustomRoutePlan2(locations, request));
        mockData.put("routePlanDays67", createCustomRoutePlan3(locations, request));

        // Generate a mock route plan text
        String routePlanText = generateMockRoutePlanText(request, locations);
        mockData.put("routePlan", routePlanText);

        return mockData;
    }

    private String generateMockRoutePlanText(CampaignRequest request, List<Map<String, String>> locations) {
        StringBuilder sb = new StringBuilder();
        sb.append("# Mobile Billboard Campaign Plan\n\n");
        sb.append("## Business: ").append(request.getBusinessName()).append("\n");
        sb.append("## Industry: ").append(request.getIndustry()).append("\n");
        sb.append("## Location: ").append(request.getLocation()).append("\n");
        sb.append("## Budget: ₹").append(request.getBudget()).append("\n");
        sb.append("## Target Audience: ").append(request.getTargetAudience()).append("\n\n");

        sb.append("### Recommended Locations:\n");
        for (Map<String, String> location : locations) {
            sb.append("- ").append(location.get("name")).append(": ").append(location.get("description")).append("\n");
        }

        sb.append("\n### Optimal Timing:\n");
        String businessType = request.getIndustry() != null ? request.getIndustry().toLowerCase() : "";
        if (businessType.contains("restaurant") || businessType.contains("food")) {
            sb.append("- 11:30 AM - 2:00 PM: Lunch rush hours\n");
            sb.append("- 6:00 PM - 9:00 PM: Dinner time peak\n");
            sb.append("- 3:00 PM - 5:00 PM: Afternoon coffee/snack time\n");
        } else {
            sb.append("- 8:00 AM - 10:00 AM: Morning commute hours\n");
            sb.append("- 12:00 PM - 2:00 PM: Lunch break period\n");
            sb.append("- 5:00 PM - 8:00 PM: Evening rush hour and leisure time\n");
        }

        sb.append("\n### Route Plan:\n");
        sb.append("#### Days 1-3:\n");
        sb.append("- Start at ").append(locations.get(0).get("name")).append(" (8:00 AM)\n");
        sb.append("- Move to ").append(locations.get(1).get("name")).append(" (10:30 AM)\n");
        sb.append("- Lunch break (12:00 PM)\n");
        sb.append("- Continue to ").append(locations.get(2).get("name")).append(" (2:00 PM)\n");
        sb.append("- End at ").append(locations.get(3).get("name")).append(" (5:00 PM)\n");

        sb.append("\n#### Days 4-5:\n");
        sb.append("- Start at ").append(locations.get(3).get("name")).append(" (12:00 PM)\n");
        sb.append("- Move to ").append(locations.get(2).get("name")).append(" (2:30 PM)\n");
        sb.append("- Continue to ").append(locations.get(1).get("name")).append(" (4:00 PM)\n");
        sb.append("- End at ").append(locations.get(0).get("name")).append(" (6:00 PM)\n");

        sb.append("\n#### Days 6-7:\n");
        sb.append("- Start at ").append(locations.get(1).get("name")).append(" (5:00 PM)\n");
        sb.append("- Move to ").append(locations.get(2).get("name")).append(" (6:30 PM)\n");
        sb.append("- Continue to ").append(locations.get(0).get("name")).append(" (8:00 PM)\n");
        sb.append("- End route at ").append(locations.get(3).get("name")).append(" (10:00 PM)\n");

        sb.append("\n### Estimated Impressions:\n");
        sb.append("- Daily Average: 5,000-7,000 impressions\n");
        sb.append("- Total Campaign: 35,000-49,000 impressions\n");

        sb.append("\n### Special Considerations:\n");
        sb.append("- Focus on ").append(locations.get(0).get("name")).append(" during evening hours for maximum visibility\n");
        sb.append("- Consider weekend special routes around shopping areas\n");
        sb.append("- Adjust timing during local events or festivals for increased exposure\n");

        return sb.toString();
    }

    private String mapIndustryToBusinessType(String industry) {
        if (industry == null) return "Business";

        switch(industry) {
            case "retail": return "Retail";
            case "restaurant": return "Food & Beverage";
            case "entertainment": return "Entertainment";
            case "healthcare": return "Healthcare";
            case "education": return "Education";
            case "technology": return "Technology";
            case "automotive": return "Automotive";
            case "financial": return "Financial Services";
            default: return industry.substring(0, 1).toUpperCase() + industry.substring(1);
        }
    }

    private String getCampaignType(List<String> objectives) {
        if (objectives == null || objectives.isEmpty()) {
            return "Brand Awareness";
        }

        // Return the first objective as the primary campaign type
        return mapObjective(objectives.get(0));
    }

    private String mapDurationToText(String duration) {
        if (duration == null) return "7 days";

        switch(duration) {
            case "1-day": return "1 day";
            case "1-week": return "7 days";
            case "2-weeks": return "14 days";
            case "1-month": return "30 days";
            case "3-months": return "90 days";
            default: return duration;
        }
    }

    private Map<String, Object> parseAIResponse(String text) {
        Map<String, Object> result = new HashMap<>();

        try {
            // Look for location sections in the text
            if (text.contains("Recommended Locations") || text.contains("recommended locations")) {
                List<Map<String, String>> extractedLocations = new ArrayList<>();
                String[] lines = text.split("\n");
                boolean inLocationSection = false;

                for (String line : lines) {
                    if (line.contains("Recommended Locations") || line.contains("recommended locations")) {
                        inLocationSection = true;
                        continue;
                    }

                    if (inLocationSection && line.trim().startsWith("-") && line.contains(":")) {
                        String[] parts = line.substring(line.indexOf("-") + 1).split(":", 2);
                        if (parts.length == 2) {
                            String name = parts[0].trim();
                            String description = parts[1].trim();
                            extractedLocations.add(createLocation(name, description));
                        }
                    }

                    // Exit location section when we hit another section
                    if (inLocationSection && (line.contains("Optimal Timing") || line.contains("Route Plan"))) {
                        inLocationSection = false;
                    }
                }

                if (!extractedLocations.isEmpty()) {
                    result.put("locations", extractedLocations);
                }
            }

            // Extract timing information
            if (text.contains("Optimal Timing") || text.contains("optimal timing")) {
                List<Map<String, String>> extractedTimings = new ArrayList<>();
                String[] lines = text.split("\n");
                boolean inTimingSection = false;

                for (String line : lines) {
                    if (line.contains("Optimal Timing") || line.contains("optimal timing")) {
                        inTimingSection = true;
                        continue;
                    }

                    if (inTimingSection && line.trim().startsWith("-") && line.contains(":")) {
                        String[] parts = line.substring(line.indexOf("-") + 1).split(":", 2);
                        if (parts.length == 2) {
                            String time = parts[0].trim();
                            String description = parts[1].trim();
                            extractedTimings.add(createTiming(time, description));
                        }
                    }

                    // Exit timing section when we hit another section
                    if (inTimingSection && (line.contains("Route Plan") || line.contains("Estimated"))) {
                        inTimingSection = false;
                    }
                }

                if (!extractedTimings.isEmpty()) {
                    result.put("timings", extractedTimings);
                }
            }

        } catch (Exception e) {
            console.println("Warning: Error parsing AI response: " + e.getMessage());
            // Continue with default values
        }

        return result;
    }

    private Map<String, String> createLocation(String name, String description) {
        Map<String, String> location = new HashMap<>();
        location.put("name", name);
        location.put("description", description);
        return location;
    }

    private Map<String, String> createTiming(String time, String description) {
        Map<String, String> timing = new HashMap<>();
        timing.put("time", time);
        timing.put("description", description);
        return timing;
    }

    private Map<String, Object> createHeatmapEntry(String time, int visibility) {
        Map<String, Object> entry = new HashMap<>();
        entry.put("time", time);
        entry.put("visibility", visibility);
        return entry;
    }

    private List<Map<String, String>> createCustomRoutePlan1(List<Map<String, String>> locations, CampaignRequest request) {
        List<Map<String, String>> routes = new ArrayList<>();
        String businessType = request.getIndustry() != null ? request.getIndustry().toLowerCase() : "";

        // Customize start time based on business type
        String startTime = "8:00 AM";
        if (businessType.contains("restaurant") || businessType.contains("food")) {
            startTime = "11:00 AM";
        } else if (businessType.contains("entertainment")) {
            startTime = "10:00 AM";
        }

        if (locations.size() >= 1) {
            routes.add(createRouteStep(startTime, "Start at " + locations.get(0).get("name")));
        } else {
            routes.add(createRouteStep(startTime, "Start at City Center"));
        }

        if (locations.size() >= 2) {
            routes.add(createRouteStep("9:30 AM", "Move to " + locations.get(1).get("name")));
        } else {
            routes.add(createRouteStep("9:30 AM", "Move to Main Market"));
        }

        routes.add(createRouteStep("12:00 PM", "Lunch break"));

        if (locations.size() >= 3) {
            routes.add(createRouteStep("1:30 PM", "Continue to " + locations.get(2).get("name")));
        } else {
            routes.add(createRouteStep("1:30 PM", "Continue to Business District"));
        }

        return routes;
    }

    private List<Map<String, String>> createCustomRoutePlan2(List<Map<String, String>> locations, CampaignRequest request) {
        List<Map<String, String>> routes = new ArrayList<>();
        String businessType = request.getIndustry() != null ? request.getIndustry().toLowerCase() : "";

        // Customize start time based on business type
        String startTime = "12:00 PM";
        if (businessType.contains("restaurant") || businessType.contains("food")) {
            startTime = "1:00 PM";
        } else if (businessType.contains("entertainment")) {
            startTime = "2:00 PM";
        }

        if (locations.size() >= 3) {
            routes.add(createRouteStep(startTime, "Start at " + locations.get(2).get("name")));
        } else {
            routes.add(createRouteStep(startTime, "Start at Business District"));
        }

        if (locations.size() >= 4) {
            routes.add(createRouteStep("2:30 PM", "Move to " + locations.get(3).get("name")));
        } else if (locations.size() >= 1) {
            routes.add(createRouteStep("2:30 PM", "Move to " + locations.get(0).get("name")));
        } else {
            routes.add(createRouteStep("2:30 PM", "Move to University Area"));
        }

        if (locations.size() >= 1) {
            routes.add(createRouteStep("4:00 PM", "Continue to " + locations.get(0).get("name")));
        } else {
            routes.add(createRouteStep("4:00 PM", "Continue to City Center"));
        }

        if (locations.size() >= 2) {
            routes.add(createRouteStep("6:00 PM", "End at " + locations.get(1).get("name")));
        } else {
            routes.add(createRouteStep("6:00 PM", "End at Main Market"));
        }

        return routes;
    }

    private List<Map<String, String>> createCustomRoutePlan3(List<Map<String, String>> locations, CampaignRequest request) {
        List<Map<String, String>> routes = new ArrayList<>();
        String businessType = request.getIndustry() != null ? request.getIndustry().toLowerCase() : "";

        // Customize start time based on business type
        String startTime = "5:00 PM";
        if (businessType.contains("restaurant") || businessType.contains("food")) {
            startTime = "6:00 PM";
        } else if (businessType.contains("entertainment")) {
            startTime = "7:00 PM";
        }

        if (locations.size() >= 2) {
            routes.add(createRouteStep(startTime, "Start at " + locations.get(1).get("name")));
        } else {
            routes.add(createRouteStep(startTime, "Start at Main Market"));
        }

        if (locations.size() >= 3) {
            routes.add(createRouteStep("6:30 PM", "Move to " + locations.get(2).get("name")));
        } else {
            routes.add(createRouteStep("6:30 PM", "Move to Business District"));
        }

        if (locations.size() >= 1) {
            routes.add(createRouteStep("8:00 PM", "Continue to " + locations.get(0).get("name")));
        } else {
            routes.add(createRouteStep("8:00 PM", "Continue to City Center"));
        }

        if (locations.size() >= 4) {
            routes.add(createRouteStep("10:00 PM", "End route at " + locations.get(3).get("name")));
        } else if (locations.size() >= 1) {
            routes.add(createRouteStep("10:00 PM", "End route at " + locations.get(0).get("name")));
        } else {
            routes.add(createRouteStep("10:00 PM", "End route at Entertainment District"));
        }

        return routes;
    }

    private Map<String, String> createRouteStep(String time, String location) {
        Map<String, String> step = new HashMap<>();
        step.put("time", time);
        step.put("location", location);
        return step;
    }

    private Map<String, Object> createMockCampaignData() {
        Map<String, Object> mockData = new HashMap<>();

        mockData.put("businessName", "Coffee House");
        mockData.put("businessType", "Food & Beverage");
        mockData.put("targetAudience", "18-40 year olds, coffee enthusiasts, students, professionals");
        mockData.put("campaignType", "Brand Awareness");
        mockData.put("location", "Pune");
        mockData.put("duration", "7 days");
        mockData.put("budget", "25,000");

        // Locations
        List<Map<String, String>> locations = new ArrayList<>();
        locations.add(createLocation("Koregaon Park", "High-end shopping area with affluent visitors"));
        locations.add(createLocation("FC Road", "Popular with college students and young professionals"));
        locations.add(createLocation("Aundh", "Residential area with shopping complexes"));
        locations.add(createLocation("Hinjewadi IT Park", "Tech hub with young professionals"));
        mockData.put("locations", locations);

        // Timings
        List<Map<String, String>> timings = new ArrayList<>();
        timings.add(createTiming("8:00 AM - 10:00 AM", "Morning commute hours"));
        timings.add(createTiming("12:00 PM - 2:00 PM", "Lunch break period"));
        timings.add(createTiming("5:00 PM - 8:00 PM", "Evening rush hour and leisure time"));
        mockData.put("timings", timings);

        // Visibility heatmap
        List<Map<String, Object>> visibilityHeatmap = new ArrayList<>();
        visibilityHeatmap.add(createHeatmapEntry("Morning (8-11 AM)", 75));
        visibilityHeatmap.add(createHeatmapEntry("Midday (11 AM-2 PM)", 60));
        visibilityHeatmap.add(createHeatmapEntry("Afternoon (2-5 PM)", 50));
        visibilityHeatmap.add(createHeatmapEntry("Evening (5-8 PM)", 85));
        visibilityHeatmap.add(createHeatmapEntry("Night (8-11 PM)", 70));
        mockData.put("visibilityHeatmap", visibilityHeatmap);

        // Route plans
        mockData.put("routePlanDays13", createDefaultRoutePlan1());
        mockData.put("routePlanDays45", createDefaultRoutePlan2());
        mockData.put("routePlanDays67", createDefaultRoutePlan3());

        return mockData;
    }

    private List<Map<String, String>> createDefaultRoutePlan1() {
        List<Map<String, String>> routes = new ArrayList<>();
        routes.add(createRouteStep("8:00 AM", "Start at Koregaon Park"));
        routes.add(createRouteStep("9:30 AM", "Move to FC Road"));
        routes.add(createRouteStep("12:00 PM", "Lunch break at JM Road"));
        routes.add(createRouteStep("1:30 PM", "Continue to Aundh"));
        return routes;
    }

    private List<Map<String, String>> createDefaultRoutePlan2() {
        List<Map<String, String>> routes = new ArrayList<>();
        routes.add(createRouteStep("12:00 PM", "Start at Hinjewadi IT Park"));
        routes.add(createRouteStep("2:30 PM", "Move to University Circle"));
        routes.add(createRouteStep("4:00 PM", "Continue to Baner Road"));
        routes.add(createRouteStep("6:00 PM", "End at Aundh"));
        return routes;
    }

    private List<Map<String, String>> createDefaultRoutePlan3() {
        List<Map<String, String>> routes = new ArrayList<>();
        routes.add(createRouteStep("5:00 PM", "Start at Phoenix Mall"));
        routes.add(createRouteStep("6:30 PM", "Move to FC Road"));
        routes.add(createRouteStep("8:00 PM", "Continue to Koregaon Park"));
        routes.add(createRouteStep("10:00 PM", "End route at E-Square"));
        return routes;
    }

    // DTO for request body
    public static class CampaignRequest {
        private String businessName;
        private String industry;
        private String targetAudience;
        private List<String> objectives;
        private String location;
        private String campaignDuration;
        private int budget;
        private String startDate;
        private String additionalInfo;

        // Getters and Setters
        public String getBusinessName() { return businessName; }
        public void setBusinessName(String businessName) { this.businessName = businessName; }

        public String getIndustry() { return industry; }
        public void setIndustry(String industry) { this.industry = industry; }

        public String getTargetAudience() { return targetAudience; }
        public void setTargetAudience(String targetAudience) { this.targetAudience = targetAudience; }

        public List<String> getObjectives() { return objectives; }
        public void setObjectives(List<String> objectives) { this.objectives = objectives; }

        public String getLocation() { return location; }
        public void setLocation(String location) { this.location = location; }

        public String getCampaignDuration() { return campaignDuration; }
        public void setCampaignDuration(String campaignDuration) { this.campaignDuration = campaignDuration; }

        public int getBudget() { return budget; }
        public void setBudget(int budget) { this.budget = budget; }

        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }

        public String getAdditionalInfo() { return additionalInfo; }
        public void setAdditionalInfo(String additionalInfo) { this.additionalInfo = additionalInfo; }
    }
}

