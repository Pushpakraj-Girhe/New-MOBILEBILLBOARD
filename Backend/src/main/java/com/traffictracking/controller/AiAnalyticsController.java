package com.traffictracking.controller;

import com.traffictracking.model.Campaign;
import com.traffictracking.service.AiPredictionService;
import com.traffictracking.service.CampaignService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class AiAnalyticsController {

    private final AiPredictionService aiPredictionService;
    private final CampaignService campaignService;

    @Autowired
    public AiAnalyticsController(AiPredictionService aiPredictionService, CampaignService campaignService) {
        this.aiPredictionService = aiPredictionService;
        this.campaignService = campaignService;
    }

    /**
     * Get AI predictions for an existing campaign by ID
     */
    @GetMapping("/campaign/{id}")
    public ResponseEntity<?> getCampaignAnalytics(@PathVariable("id") Long id) {
        try {
            Optional<Campaign> campaignOpt = campaignService.getCampaignById(id);
            
            if (campaignOpt.isPresent()) {
                Campaign campaign = campaignOpt.get();
                Map<String, Object> predictions = aiPredictionService.generateCampaignPredictions(campaign);
                
                // Add campaign basic info to the response
                Map<String, Object> response = new HashMap<>();
                response.put("campaign", campaign);
                response.put("predictions", predictions);
                
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(
                    Map.of("error", "Campaign not found with ID: " + id), 
                    HttpStatus.NOT_FOUND
                );
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(
                Map.of("error", "Failed to generate analytics", "message", e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    
    /**
     * Generate AI predictions for a campaign preview (without saving the campaign)
     */
    @PostMapping("/preview")
    public ResponseEntity<?> previewCampaignAnalytics(@RequestBody Campaign campaign) {
        try {
            Map<String, Object> predictions = aiPredictionService.generateCampaignPredictions(campaign);
            
            return new ResponseEntity<>(predictions, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(
                Map.of("error", "Failed to generate analytics preview", "message", e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    
    /**
     * Generate optimized route suggestions based on campaign parameters
     */
    @GetMapping("/routes/{id}")
    public ResponseEntity<?> getOptimizedRoutes(@PathVariable("id") Long id) {
        try {
            Optional<Campaign> campaignOpt = campaignService.getCampaignById(id);
            
            if (campaignOpt.isPresent()) {
                Campaign campaign = campaignOpt.get();
                
                // Generate route suggestions (this would eventually use a more sophisticated algorithm)
                Map<String, Object> routeData = generateRouteData(campaign);
                
                return new ResponseEntity<>(routeData, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(
                    Map.of("error", "Campaign not found with ID: " + id), 
                    HttpStatus.NOT_FOUND
                );
            }
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(
                Map.of("error", "Failed to generate route suggestions", "message", e.getMessage()),
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
    
    /**
     * Generate mock route data (in a real app, this would use actual mapping/traffic APIs)
     */
    private Map<String, Object> generateRouteData(Campaign campaign) {
        Map<String, Object> routeData = new HashMap<>();
        String location = campaign.getLocation();
        
        // Route 1: Maximum Exposure
        Map<String, Object> route1 = new HashMap<>();
        route1.put("name", "Maximum Exposure Route");
        route1.put("description", "Prioritizes high-traffic areas and peak hours for maximum visibility");
        route1.put("estimatedImpressions", 35000);
        route1.put("drivingTime", "4.5 hours");
        route1.put("waypoints", getRouteWaypoints(location, "exposure"));
        
        // Route 2: Targeted Audience 
        Map<String, Object> route2 = new HashMap<>();
        route2.put("name", "Targeted Audience Route");
        route2.put("description", "Focuses on areas frequented by your specific target audience");
        route2.put("estimatedImpressions", 22000);
        route2.put("drivingTime", "3.8 hours");
        route2.put("waypoints", getRouteWaypoints(location, "targeted"));
        
        // Route 3: Cost Efficient
        Map<String, Object> route3 = new HashMap<>();
        route3.put("name", "Cost-Efficient Route");
        route3.put("description", "Balances exposure with reduced driving time and fuel consumption");
        route3.put("estimatedImpressions", 18000);
        route3.put("drivingTime", "2.5 hours");
        route3.put("waypoints", getRouteWaypoints(location, "efficient"));
        
        // Add all routes to the response
        routeData.put("routes", Map.of(
            "maximum_exposure", route1,
            "targeted_audience", route2,
            "cost_efficient", route3
        ));
        
        // Add recommendation
        routeData.put("recommendedRoute", determineRecommendedRoute(campaign));
        
        return routeData;
    }
    
    /**
     * Get waypoints for a route based on location and route type
     */
    private Map<String, Object>[] getRouteWaypoints(String location, String routeType) {
        // In a real application, this would come from mapping APIs
        // This is simplified mock data
        
        if (location.equalsIgnoreCase("Mumbai")) {
            if (routeType.equals("exposure")) {
                return new Map[] {
                    Map.of("name", "Marine Drive", "time", "9:00 AM - 10:30 AM"),
                    Map.of("name", "Bandra Linking Road", "time", "11:00 AM - 12:30 PM"),
                    Map.of("name", "Juhu Beach", "time", "1:00 PM - 2:30 PM"),
                    Map.of("name", "Andheri West", "time", "3:00 PM - 4:30 PM"),
                    Map.of("name", "BKC", "time", "5:00 PM - 6:30 PM")
                };
            } else if (routeType.equals("targeted")) {
                return new Map[] {
                    Map.of("name", "Phoenix Mall", "time", "10:00 AM - 11:30 AM"),
                    Map.of("name", "Corporate Park BKC", "time", "12:00 PM - 1:30 PM"),
                    Map.of("name", "Inorbit Mall", "time", "2:00 PM - 3:30 PM"),
                    Map.of("name", "Linking Road", "time", "4:00 PM - 5:30 PM")
                };
            } else {
                return new Map[] {
                    Map.of("name", "Andheri Station", "time", "9:00 AM - 10:00 AM"),
                    Map.of("name", "Bandra Station", "time", "10:30 AM - 11:30 AM"),
                    Map.of("name", "Dadar TT Circle", "time", "12:00 PM - 1:00 PM"),
                    Map.of("name", "Lower Parel", "time", "5:00 PM - 6:00 PM")
                };
            }
        } else {
            // Default waypoints for other cities
            if (routeType.equals("exposure")) {
                return new Map[] {
                    Map.of("name", "City Center", "time", "9:00 AM - 10:30 AM"),
                    Map.of("name", "Main Market", "time", "11:00 AM - 12:30 PM"),
                    Map.of("name", "Tourist Area", "time", "1:00 PM - 2:30 PM"),
                    Map.of("name", "Business District", "time", "5:00 PM - 6:30 PM")
                };
            } else if (routeType.equals("targeted")) {
                return new Map[] {
                    Map.of("name", "Shopping Mall", "time", "10:00 AM - 11:30 AM"),
                    Map.of("name", "Business Park", "time", "12:00 PM - 1:30 PM"),
                    Map.of("name", "Residential Area", "time", "4:00 PM - 5:30 PM")
                };
            } else {
                return new Map[] {
                    Map.of("name", "Transport Hub", "time", "9:00 AM - 10:00 AM"),
                    Map.of("name", "Market Area", "time", "12:00 PM - 1:00 PM"),
                    Map.of("name", "Evening Hotspot", "time", "5:00 PM - 6:00 PM")
                };
            }
        }
    }
    
    /**
     * Determine the recommended route type based on campaign parameters
     */
    private String determineRecommendedRoute(Campaign campaign) {
        String industry = campaign.getIndustry();
        Double budget = campaign.getBudget();
        
        // Recommendation logic (simplified)
        if (budget > 100000) {
            return "maximum_exposure"; // Higher budget can afford the premium route
        } else if (industry != null && 
                 (industry.equalsIgnoreCase("Luxury") || 
                  industry.equalsIgnoreCase("Real Estate") || 
                  industry.equalsIgnoreCase("Education"))) {
            return "targeted_audience"; // These industries benefit from targeting specific audiences
        } else {
            return "cost_efficient"; // Default to cost efficiency for other cases
        }
    }
} 