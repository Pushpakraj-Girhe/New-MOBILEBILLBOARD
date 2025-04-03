package com.traffictracking.controller;

import com.traffictracking.model.Route;
import com.traffictracking.model.dto.RouteOptimizationRequest;
import com.traffictracking.service.RouteOptimizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    @Autowired
    private RouteOptimizationService routeOptimizationService;

    @PostMapping("/optimize")
    public ResponseEntity<Route> optimizeRoute(@RequestBody RouteOptimizationRequest request) {
        Route optimizedRoute = routeOptimizationService.optimizeRoute(request);
        return ResponseEntity.ok(optimizedRoute);
    }

    @GetMapping("/show-route/{startLat}/{startLng}/{endLat}/{endLng}")
    public ResponseEntity<String> showRoute(
            @PathVariable double startLat,
            @PathVariable double startLng,
            @PathVariable double endLat,
            @PathVariable double endLng) {
        String apiKey = "d3b4f982637b48539370523386495cbb"; // Replace with your actual API key
        String routeUrl = String.format(
                "https://api.geoapify.com/v1/routing?waypoints=%f,%f|%f,%f&mode=drive&apiKey=%s",
                startLat, startLng, endLat, endLng, apiKey);

        RestTemplate restTemplate = new RestTemplate();
        try {
            String response = restTemplate.getForObject(routeUrl, String.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\": \"Error fetching route: " + e.getMessage() + "\"}");
        }
    }
}