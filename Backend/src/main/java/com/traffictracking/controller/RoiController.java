package com.traffictracking.controller;

import com.traffictracking.service.AiPredictionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/roi")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class RoiController {

    private final AiPredictionService aiPredictionService;

    @Autowired
    public RoiController(AiPredictionService aiPredictionService) {
        this.aiPredictionService = aiPredictionService;
    }

    @PostMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateRoi(@RequestBody RoiRequest request) {
        try {
            Map<String, Object> predictions = aiPredictionService.generateRoiPredictions(
                    request.getBusinessName(),
                    request.getIndustry(),
                    request.getTargetAudience(),
                    request.getLocation(),
                    request.getCampaignDuration(),
                    request.getBudget(),
                    request.getObjectives()
            );
            
            // Check if there was an error in the prediction service
            if (predictions.containsKey("error")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", predictions.get("error"));
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
            }
    
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", predictions);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // Log the error
            System.err.println("Controller error calculating ROI: " + e.getMessage());
            e.printStackTrace();
            
            // Return error response
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to calculate ROI: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Request DTO
    public static class RoiRequest {
        private String businessName;
        private String industry;
        private String targetAudience;
        private String location;
        private String campaignDuration;
        private double budget;
        private List<String> objectives;

        // Getters and setters
        public String getBusinessName() {
            return businessName;
        }

        public void setBusinessName(String businessName) {
            this.businessName = businessName;
        }

        public String getIndustry() {
            return industry;
        }

        public void setIndustry(String industry) {
            this.industry = industry;
        }

        public String getTargetAudience() {
            return targetAudience;
        }

        public void setTargetAudience(String targetAudience) {
            this.targetAudience = targetAudience;
        }

        public String getLocation() {
            return location;
        }

        public void setLocation(String location) {
            this.location = location;
        }

        public String getCampaignDuration() {
            return campaignDuration;
        }

        public void setCampaignDuration(String campaignDuration) {
            this.campaignDuration = campaignDuration;
        }

        public double getBudget() {
            return budget;
        }

        public void setBudget(double budget) {
            this.budget = budget;
        }

        public List<String> getObjectives() {
            return objectives;
        }

        public void setObjectives(List<String> objectives) {
            this.objectives = objectives;
        }
    }
} 