package com.traffictracking.service;

import com.traffictracking.model.Route;
import com.traffictracking.model.dto.RouteOptimizationRequest;
import com.traffictracking.repository.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class RouteOptimizationService {

    @Autowired
    private RouteRepository routeRepository;

//    @Autowired
//    private RestTemplate restTemplate;
    @Autowired
    @Qualifier("hereMapsRestTemplate")  // ✅ Use Here Maps RestTemplate
    private RestTemplate restTemplate;

    @Autowired
    private String hereMapsApiKey;

    public Route optimizeRoute(RouteOptimizationRequest request) {
        // Implement route optimization logic using HERE Maps API
        String apiKey = hereMapsApiKey; // Use the hereMapsApiKey field
        // This is a placeholder implementation
        Route optimizedRoute = new Route();
        optimizedRoute.setName("Optimized Route");
        optimizedRoute.setOrigin(request.getOrigin());
        optimizedRoute.setDestination(request.getDestination());
        optimizedRoute.setWaypoints(request.getWaypoints());
        return routeRepository.save(optimizedRoute);
    }
}

