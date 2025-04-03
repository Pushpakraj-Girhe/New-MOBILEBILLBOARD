package com.traffictracking.controller;

import com.traffictracking.model.Route;
import com.traffictracking.service.TrafficService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@RestController
@RequestMapping("/api")
public class TrafficController {

    @Autowired
    private TrafficService trafficService;

    @GetMapping("/routes")
    public List<Route> getAllRoutes() {
        return trafficService.getAllRoutes();
    }

    @GetMapping("/optimize")
    public ResponseEntity<String> getOptimizedRoute(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam(required = false) List<String> waypoints) {
        String result = trafficService.getOptimizedRoute(origin, destination, waypoints);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/nearby")
    public ResponseEntity<String> getNearbyPlaces(
            @RequestParam String location,
            @RequestParam String radius,
            @RequestParam String type) {
        String result = trafficService.getNearbyPlaces(location, radius, type);
        return ResponseEntity.ok(result);
    }

//    @GetMapping("/places")
//    public ResponseEntity<?> getPlaces(@RequestParam double lat, @RequestParam double lng) {
//        String apiKey = "d3b4f982637b48539370523386495cbb"; // Replace with your actual API key
//        String url = "https://api.geoapify.com/v2/places?categories=busy-places&filter=circle:" + lng + "," + lat + ",5000&apiKey=" + apiKey;
//        RestTemplate restTemplate = new RestTemplate();
//        try {
//            String response = restTemplate.getForObject(url, String.class);
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            e.printStackTrace(); // Print the full stack trace
//            return ResponseEntity.status(500).body("{\"error\": \"Error fetching places: " + e.getMessage() + "\"}");
//        }
//    }
@GetMapping("/places/{lat}/{lng}")
public ResponseEntity<?> getPlaces(@PathVariable double lat, @PathVariable double lng) {
    String apiKey = "d3b4f982637b48539370523386495cbb"; // Replace with your actual API key
    String url = "https://api.geoapify.com/v2/places?categories=catering,accommodation&filter=rect:" + (lng - 0.1) + "," + (lat + 0.1) + "," + (lng + 0.1) + "," + (lat - 0.1) + "&limit=20&apiKey=" + apiKey;
    RestTemplate restTemplate = new RestTemplate();
    try {
        String response = restTemplate.getForObject(url, String.class);
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        e.printStackTrace(); // Print the full stack trace
        return ResponseEntity.status(500).body("{\"error\": \"Error fetching places: " + e.getMessage() + "\"}");
    }
}

    @GetMapping("/traffic")
    public ResponseEntity<?> getTraffic(@RequestParam String bbox, @RequestParam String locationReferencing) {
        String url = "https://api.geoapify.com/v1/traffic?bbox=" + bbox + "&locationReferencing=" + locationReferencing + "&apiKey=YOUR_API_KEY";
        RestTemplate restTemplate = new RestTemplate();
        try {
            String response = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("{\"error\": \"Error fetching traffic data\"}");
        }
    }
}