//package com.traffictracking.config;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.client.RestTemplate;
//
//@Configuration
//public class HereMapsConfig {
//
//    @Value("${here.maps.api.key}")
//    private String apiKey;
//
//    @Bean
//    public RestTemplate restTemplate() {
//        return new RestTemplate();
//    }
//
//    @Bean
//    public String hereMapsApiKey() {
//        return apiKey;
//    }
//}
//
package com.traffictracking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class HereMapsConfig {

    @Value("${here.maps.api.key}")
    private String apiKey;

    @Bean(name = "hereMapsRestTemplate") // ✅ Give this bean a unique name
    public RestTemplate hereMapsRestTemplate() {
        return new RestTemplate();
    }

    @Bean
    public String hereMapsApiKey() {
        return apiKey;
    }
}
