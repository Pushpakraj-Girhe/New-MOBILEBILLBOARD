package com.traffictracking.model.dto;

import lombok.Data;

import java.util.List;

@Data
public class RouteOptimizationRequest {

    private String origin;
    private String destination;
    private List<String> waypoints;

    // Getters and setters
}

