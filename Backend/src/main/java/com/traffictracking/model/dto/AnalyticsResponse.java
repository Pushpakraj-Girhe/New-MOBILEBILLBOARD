package com.traffictracking.model.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AnalyticsResponse {

    private Long campaignId;
    private LocalDateTime timestamp;
    private Long impressions;
    private Double engagementRate;

    // Getters and setters
}

