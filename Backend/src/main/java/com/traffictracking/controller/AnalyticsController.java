package com.traffictracking.controller;

import com.traffictracking.model.dto.AnalyticsResponse;
import com.traffictracking.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/{campaignId}")
    public ResponseEntity<AnalyticsResponse> getAnalytics(@PathVariable Long campaignId) {
        AnalyticsResponse analytics = analyticsService.generateAnalytics(campaignId);
        return ResponseEntity.ok(analytics);
    }
}

