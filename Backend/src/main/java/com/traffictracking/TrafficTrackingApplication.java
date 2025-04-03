package com.traffictracking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class TrafficTrackingApplication {

    public static void main(String[] args) {
        // Test database connection before starting the application
        DatabaseTest.testConnection();
        
        SpringApplication.run(TrafficTrackingApplication.class, args);
    }
    
    @Bean
    public CommandLineRunner testDatabase() {
        return args -> {
            System.out.println("Application started - testing DB connection one more time");
            DatabaseTest.testConnection();
        };
    }
}

