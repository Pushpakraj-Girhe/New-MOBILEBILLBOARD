package com.traffictracking.service;

import com.traffictracking.model.Route;
import com.traffictracking.repository.RouteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Service
public class TrafficService {

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    @Qualifier("hereMapsRestTemplate")  // ✅ Use Here Maps RestTemplate
    private RestTemplate restTemplate;

    @Autowired
    private String hereMapsApiKey;

    private static final String DIRECTIONS_API_URL = "https://router.hereapi.com/v8/routes?";
    private static final String PLACES_API_URL = "https://places.ls.hereapi.com/places/v1/discover/search?";

    public List<Route> getAllRoutes() {
        return routeRepository.findAll();
    }

    public Route saveRoute(Route route) {

        return routeRepository.save(route);
    }

    public String getOptimizedRoute(String origin, String destination, List<String> waypoints) {
        StringBuilder urlBuilder = new StringBuilder(DIRECTIONS_API_URL);
        urlBuilder.append("origin=").append(origin);
        urlBuilder.append("&destination=").append(destination);
        
        if (waypoints != null && !waypoints.isEmpty()) {
            urlBuilder.append("&via=").append(String.join(",", waypoints));
        }
        
        urlBuilder.append("&apikey=").append(hereMapsApiKey);

        return restTemplate.getForObject(urlBuilder.toString(), String.class);
    }

    public String getNearbyPlaces(String location, String radius, String type) {
        StringBuilder urlBuilder = new StringBuilder(PLACES_API_URL);
        urlBuilder.append("at=").append(location);
        urlBuilder.append("&q=").append(type);
        urlBuilder.append("&apikey=").append(hereMapsApiKey);

        return restTemplate.getForObject(urlBuilder.toString(), String.class);
    }
}