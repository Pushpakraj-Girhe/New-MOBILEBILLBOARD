package com.traffictracking.controller;

//import com.traffictracking.model.Campaign;
//import com.traffictracking.service.CampaignManagementService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/campaigns")
//public class CampaignController {
//
//    @Autowired
//    private CampaignManagementService campaignManagementService;
//
//    @GetMapping
//    public ResponseEntity<List<Campaign>> getAllCampaigns() {
//        List<Campaign> campaigns = campaignManagementService.getAllCampaigns();
//        return ResponseEntity.ok(campaigns);
//    }
//
//    @PostMapping
//    public ResponseEntity<Campaign> createCampaign(@RequestBody Campaign campaign) {
//        Campaign createdCampaign = campaignManagementService.createCampaign(campaign);
//        return ResponseEntity.ok(createdCampaign);
//    }
//
//    @PutMapping("/{id}")
//    public ResponseEntity<Campaign> updateCampaign(@PathVariable Long id, @RequestBody Campaign campaignDetails) {
//        Campaign updatedCampaign = campaignManagementService.updateCampaign(id, campaignDetails);
//        return ResponseEntity.ok(updatedCampaign);
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Void> deleteCampaign(@PathVariable Long id) {
//        campaignManagementService.deleteCampaign(id);
//        return ResponseEntity.noContent().build();
//    }
//}
//



import com.traffictracking.model.Campaign;
import com.traffictracking.service.CampaignService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/campaigns")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class CampaignController {

    private final CampaignService campaignService;
    private final JdbcTemplate jdbcTemplate;

    @Autowired
    public CampaignController(CampaignService campaignService, JdbcTemplate jdbcTemplate) {
        this.campaignService = campaignService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping
    public ResponseEntity<?> createCampaign(@RequestBody Map<String, Object> payload) {
        try {
            // Create a new Campaign entity
            Campaign campaign = new Campaign();
            
            // Set the values from payload with default values for NOT NULL fields
            campaign.setBusinessName(payload.get("businessName") != null ? (String) payload.get("businessName") : "Default Business");
            campaign.setIndustry(payload.get("industry") != null ? (String) payload.get("industry") : "General");
            campaign.setTargetAudience(payload.get("targetAudience") != null ? (String) payload.get("targetAudience") : "General Public");
            campaign.setLocation(payload.get("location") != null ? (String) payload.get("location") : "Not Specified");
            campaign.setCampaignDuration(payload.get("campaignDuration") != null ? (String) payload.get("campaignDuration") : "30 days");
            
            // Handle budget
            if (payload.get("budget") != null) {
                if (payload.get("budget") instanceof Number) {
                    campaign.setBudget(((Number) payload.get("budget")).doubleValue());
                } else if (payload.get("budget") instanceof String) {
                    try {
                        campaign.setBudget(Double.parseDouble((String) payload.get("budget")));
                    } catch (NumberFormatException e) {
                        campaign.setBudget(0.0);
                    }
                }
            } else {
                campaign.setBudget(0.0);
            }
            
            // Save using JPA
            Campaign savedCampaign = campaignService.saveCampaign(campaign);
            
            // Return success response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Campaign saved successfully");
            response.put("id", savedCampaign.getId());
            response.put("businessName", savedCampaign.getBusinessName());
            response.put("industry", savedCampaign.getIndustry());
            response.put("targetAudience", savedCampaign.getTargetAudience());
            response.put("location", savedCampaign.getLocation());
            response.put("campaignDuration", savedCampaign.getCampaignDuration());
            response.put("budget", savedCampaign.getBudget());
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create campaign");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("stackTrace", getStackTraceAsString(e));
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Helper method to get stack trace as string
    private String getStackTraceAsString(Exception e) {
        StringBuilder sb = new StringBuilder();
        sb.append(e.toString()).append("\n");
        for (StackTraceElement element : e.getStackTrace()) {
            sb.append(element.toString()).append("\n");
        }
        return sb.toString();
    }

    @GetMapping
    public ResponseEntity<List<Campaign>> getAllCampaigns() {
        try {
            List<Campaign> campaigns = campaignService.getAllCampaigns();
            return new ResponseEntity<>(campaigns, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Campaign> getCampaignById(@PathVariable("id") Long id) {
        return campaignService.getCampaignById(id)
                .map(campaign -> new ResponseEntity<>(campaign, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/business/{businessName}")
    public ResponseEntity<List<Campaign>> getCampaignsByBusinessName(@PathVariable("businessName") String businessName) {
        try {
            List<Campaign> campaigns = campaignService.getCampaignsByBusinessName(businessName);
            return new ResponseEntity<>(campaigns, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/location/{location}")
    public ResponseEntity<List<Campaign>> getCampaignsByLocation(@PathVariable("location") String location) {
        try {
            List<Campaign> campaigns = campaignService.getCampaignsByLocation(location);
            return new ResponseEntity<>(campaigns, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Campaign> updateCampaign(@PathVariable("id") Long id, @RequestBody Campaign campaign) {
        try {
            Campaign updatedCampaign = campaignService.updateCampaign(id, campaign);
            return new ResponseEntity<>(updatedCampaign, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteCampaign(@PathVariable("id") Long id) {
        try {
            campaignService.deleteCampaign(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}