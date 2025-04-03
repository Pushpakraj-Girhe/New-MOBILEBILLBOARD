package com.traffictracking.service;

import com.traffictracking.model.Campaign;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.text.DecimalFormat;
import java.util.List;
import java.util.ArrayList;

@Service
public class AiPredictionService {
    
    private final Random random = new Random();
    private final DecimalFormat df = new DecimalFormat("#.##");
    
    /**
     * Generates AI-powered predictions for a mobile billboard campaign
     * @param campaign The campaign to generate predictions for
     * @return Map containing prediction metrics
     */
    public Map<String, Object> generateCampaignPredictions(Campaign campaign) {
        Map<String, Object> predictions = new HashMap<>();
        
        // Basic campaign information
        String location = campaign.getLocation();
        String industry = campaign.getIndustry();
        Double budget = campaign.getBudget();
        
        // Calculate impressions based on location, industry and budget
        int baseImpressions = calculateBaseImpressions(location);
        double industryMultiplier = getIndustryMultiplier(industry);
        double budgetEffect = Math.log10(budget + 1000) / 2; // Logarithmic scale for budget impact
        
        int totalImpressions = (int) (baseImpressions * industryMultiplier * budgetEffect);
        
        // Calculate engagement metrics
        double engagementRate = calculateEngagementRate(industry, location);
        int engagements = (int) (totalImpressions * engagementRate);
        
        // Calculate conversion metrics
        double conversionRate = 0.05; // Average 5% conversion rate
        int conversions = (int) (engagements * conversionRate);
        
        // Calculate financial metrics
        double costPerImpression = budget / totalImpressions;
        double costPerEngagement = budget / engagements;
        double costPerConversion = budget / conversions;
        
        // Calculate estimated revenue and ROI
        double averageConversionValue = getAverageConversionValue(industry);
        double estimatedRevenue = conversions * averageConversionValue;
        double roi = ((estimatedRevenue - budget) / budget) * 100;
        
        // Add all predictions to the result map
        predictions.put("totalImpressions", totalImpressions);
        predictions.put("impressionsPerDay", totalImpressions / 30); // Assuming a 30-day campaign
        predictions.put("engagementRate", Double.parseDouble(df.format(engagementRate * 100)) + "%");
        predictions.put("engagements", engagements);
        predictions.put("conversionRate", "5%");
        predictions.put("conversions", conversions);
        predictions.put("costPerImpression", Double.parseDouble(df.format(costPerImpression)));
        predictions.put("costPerEngagement", Double.parseDouble(df.format(costPerEngagement)));
        predictions.put("costPerConversion", Double.parseDouble(df.format(costPerConversion)));
        predictions.put("estimatedRevenue", Double.parseDouble(df.format(estimatedRevenue)));
        predictions.put("roi", Double.parseDouble(df.format(roi)) + "%");
        
        // Add best performing times and areas
        predictions.put("bestPerformingTimes", getBestPerformingTimes(location));
        predictions.put("bestPerformingAreas", getBestPerformingAreas(location));
        
        return predictions;
    }
    
    private int calculateBaseImpressions(String location) {
        // Base impressions vary by location due to population density
        Map<String, Integer> locationImpressions = new HashMap<>();
        locationImpressions.put("Mumbai", 250000);
        locationImpressions.put("Delhi", 230000);
        locationImpressions.put("Bangalore", 200000);
        locationImpressions.put("Hyderabad", 180000);
        locationImpressions.put("Chennai", 170000);
        
        // Get base impression or use default for other locations
        return locationImpressions.getOrDefault(location, 130000);
    }
    
    private double getIndustryMultiplier(String industry) {
        // Different industries have different effectiveness with billboard advertising
        Map<String, Double> industryMultipliers = new HashMap<>();
        industryMultipliers.put("Retail", 1.2);
        industryMultipliers.put("Food & Beverage", 1.3);
        industryMultipliers.put("Entertainment", 1.4);
        industryMultipliers.put("Real Estate", 1.1);
        industryMultipliers.put("Automotive", 1.25);
        
        // Get multiplier or use default for other industries
        return industryMultipliers.getOrDefault(industry, 1.0);
    }
    
    private double calculateEngagementRate(String industry, String location) {
        // Base engagement rate varies by industry
        double baseRate = 0.02; // 2% base engagement rate
        
        // Add slight random variation (±0.5%)
        double randomVariation = (random.nextDouble() - 0.5) * 0.01;
        
        return Math.max(0.005, Math.min(0.05, baseRate + randomVariation));
    }
    
    private double getAverageConversionValue(String industry) {
        // Different industries have different average values per conversion
        Map<String, Double> conversionValues = new HashMap<>();
        conversionValues.put("Retail", 1200.0);
        conversionValues.put("Food & Beverage", 600.0);
        conversionValues.put("Entertainment", 800.0);
        conversionValues.put("Real Estate", 15000.0);
        conversionValues.put("Automotive", 25000.0);
        
        return conversionValues.getOrDefault(industry, 1500.0);
    }
    
    private Map<String, String> getBestPerformingTimes(String location) {
        Map<String, String> bestTimes = new HashMap<>();
        
        // Default times that work well for most locations
        bestTimes.put("weekday_morning", "8:00 AM - 10:00 AM");
        bestTimes.put("weekday_evening", "5:00 PM - 8:00 PM");
        bestTimes.put("weekend", "11:00 AM - 7:00 PM");
        
        return bestTimes;
    }
    
    private Map<String, String> getBestPerformingAreas(String location) {
        Map<String, String> bestAreas = new HashMap<>();
        
        if (location.equalsIgnoreCase("Mumbai")) {
            bestAreas.put("high_traffic", "Marine Drive, Bandra, Andheri West");
            bestAreas.put("shopping", "Linking Road, Phoenix Mall vicinity");
            bestAreas.put("business", "BKC, Lower Parel");
        } else if (location.equalsIgnoreCase("Delhi")) {
            bestAreas.put("high_traffic", "Connaught Place, India Gate, Karol Bagh");
            bestAreas.put("shopping", "South Extension, Saket Mall vicinity");
            bestAreas.put("business", "Nehru Place, Gurgaon Cyber City");
        } else {
            bestAreas.put("high_traffic", "City Center, Main Market Areas");
            bestAreas.put("shopping", "Major Shopping Malls and Markets");
            bestAreas.put("business", "Business Districts and IT Parks");
        }
        
        return bestAreas;
    }
    
    /**
     * Generate AI-powered ROI predictions for a mobile billboard campaign
     * 
     * @param businessName The name of the business
     * @param industry The industry of the business
     * @param targetAudience Description of target audience
     * @param location Campaign location
     * @param campaignDuration Duration of the campaign
     * @param budget Campaign budget in INR
     * @param objectives Campaign objectives (brand, traffic, launch, event)
     * @return Map containing ROI predictions and related metrics
     */
    public Map<String, Object> generateRoiPredictions(
            String businessName, 
            String industry, 
            String targetAudience, 
            String location, 
            String campaignDuration, 
            double budget,
            List<String> objectives) {
        
        try {
            Map<String, Object> predictions = new HashMap<>();
            
            // Get industry-specific metrics
            Map<String, Double> industryMetrics = getIndustryMetrics(industry);
            double baseImpressionRate = industryMetrics.get("impressionRate");
            double baseConversionRate = industryMetrics.get("conversionRate");
            double baseTransactionValue = industryMetrics.get("avgTransactionValue");
            
            // Calculate campaign days based on duration
            int campaignDays = calculateCampaignDays(campaignDuration);
            if (campaignDays <= 0) campaignDays = 30; // Default to 30 days if invalid
            
            // Calculate impression and audience metrics
            double dailyImpressions = (budget / campaignDays) * baseImpressionRate;
            double totalImpressions = dailyImpressions * campaignDays;
            if (totalImpressions <= 0) totalImpressions = 1000; // Ensure minimum impressions
            
            // Apply audience multiplier
            double audienceMultiplier = calculateAudienceMultiplier(targetAudience);
            double adjustedConversionRate = baseConversionRate * audienceMultiplier;
            
            // Calculate conversions and revenue
            double conversions = totalImpressions * adjustedConversionRate;
            if (conversions <= 0) conversions = 10; // Ensure minimum conversions
            double estimatedRevenue = conversions * baseTransactionValue;
            
            // Adjust based on objectives
            double objectiveMultiplier = calculateObjectiveMultiplier(objectives);
            estimatedRevenue *= objectiveMultiplier;
            
            // Calculate ROI
            double roi = ((estimatedRevenue - budget) / budget) * 100;
            
            // Apply location factor
            double locationFactor = calculateLocationFactor(location);
            roi *= locationFactor;
            
            // Calculate cost metrics - prevent division by zero
            double costPerImpression = totalImpressions > 0 ? budget / totalImpressions : 0;
            double costPerEngagement = totalImpressions > 0 ? budget / (totalImpressions * 0.05) : 0;
            double costPerConversion = conversions > 0 ? budget / conversions : 0;
            
            // Create best performing areas based on location and industry
            Map<String, String> bestAreas = generateBestAreas(location, industry);
            
            // Create best performing times based on industry
            Map<String, String> bestTimes = generateBestTimes(industry);
            
            // Build the prediction response
            predictions.put("totalImpressions", Math.round(totalImpressions));
            predictions.put("impressionsPerDay", Math.round(dailyImpressions));
            predictions.put("conversionRate", String.format("%.1f%%", adjustedConversionRate * 100));
            predictions.put("conversions", Math.round(conversions));
            predictions.put("costPerImpression", String.format("%.2f", costPerImpression));
            predictions.put("costPerEngagement", String.format("%.2f", costPerEngagement));
            predictions.put("costPerConversion", Math.round(costPerConversion));
            predictions.put("estimatedRevenue", Math.round(estimatedRevenue));
            predictions.put("roi", String.format("%.0f%%", roi));
            predictions.put("bestPerformingAreas", bestAreas);
            predictions.put("bestPerformingTimes", bestTimes);
            predictions.put("confidenceScore", 85 + random.nextInt(10));
            
            // ROI breakdown - additional details
            Map<String, Object> roiBreakdown = new HashMap<>();
            roiBreakdown.put("campaignCost", Math.round(budget));
            roiBreakdown.put("estimatedRevenue", Math.round(estimatedRevenue));
            roiBreakdown.put("netProfit", Math.round(estimatedRevenue - budget));
            roiBreakdown.put("returnOnInvestment", String.format("%.0f%%", roi));
            roiBreakdown.put("breakEvenDays", calculateBreakEvenDays(budget, estimatedRevenue, campaignDays));
            roiBreakdown.put("paybackPeriod", String.format("%.1f days", calculatePaybackPeriod(budget, estimatedRevenue, campaignDays)));
            
            // Calculate and normalize ROI factors
            Map<String, Double> roiFactors = new HashMap<>();
           // double locationFactor = locationFactor * 100;
            double audienceFactor = audienceMultiplier * 100;
            double objectiveFactor = objectiveMultiplier * 100;
            double industryFactor = baseImpressionRate * 100;
            
            // Calculate total for normalization
            double total = locationFactor + audienceFactor + objectiveFactor + industryFactor;
            
            // Normalize each factor to sum up to 100%
            roiFactors.put("location", (double) Math.round((locationFactor / total) * 100));
            roiFactors.put("targetAudience", (double) Math.round((audienceFactor / total) * 100));
            roiFactors.put("campaignObjectives", (double) Math.round((objectiveFactor / total) * 100));
            roiFactors.put("industryStandard", (double) Math.round((industryFactor / total) * 100));
            
            roiBreakdown.put("contributingFactors", roiFactors);
            
            predictions.put("roiBreakdown", roiBreakdown);
            
            return predictions;
        } catch (Exception e) {
            // Log the error
            System.err.println("Error calculating ROI: " + e.getMessage());
            e.printStackTrace();
            
            // Return a basic response with an error message
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to calculate ROI: " + e.getMessage());
            return errorResponse;
        }
    }
    
    private Map<String, Double> getIndustryMetrics(String industry) {
        Map<String, Double> metrics = new HashMap<>();
        
        // Default values for null or empty industry
        if (industry == null || industry.isEmpty()) {
            metrics.put("impressionRate", 1.0);
            metrics.put("conversionRate", 0.04);
            metrics.put("avgTransactionValue", 2000.0);
            return metrics;
        }
        
        switch (industry.toLowerCase()) {
            case "retail":
                metrics.put("impressionRate", 1.2);
                metrics.put("conversionRate", 0.045);
                metrics.put("avgTransactionValue", 1500.0);
                break;
            case "restaurant":
            case "food & beverage":
                metrics.put("impressionRate", 1.4);
                metrics.put("conversionRate", 0.055);
                metrics.put("avgTransactionValue", 800.0);
                break;
            case "technology":
                metrics.put("impressionRate", 0.9);
                metrics.put("conversionRate", 0.035);
                metrics.put("avgTransactionValue", 5000.0);
                break;
            case "healthcare":
                metrics.put("impressionRate", 0.8);
                metrics.put("conversionRate", 0.03);
                metrics.put("avgTransactionValue", 3500.0);
                break;
            case "education":
                metrics.put("impressionRate", 1.1);
                metrics.put("conversionRate", 0.04);
                metrics.put("avgTransactionValue", 2500.0);
                break;
            case "entertainment":
                metrics.put("impressionRate", 1.5);
                metrics.put("conversionRate", 0.06);
                metrics.put("avgTransactionValue", 1200.0);
                break;
            default:
                metrics.put("impressionRate", 1.0);
                metrics.put("conversionRate", 0.04);
                metrics.put("avgTransactionValue", 2000.0);
        }
        
        // Add small variance for more realistic predictions
        double variance = 0.1; // 10% variance
        for (Map.Entry<String, Double> entry : metrics.entrySet()) {
            double value = entry.getValue();
            double adjustment = 1.0 + (random.nextDouble() * variance * 2 - variance);
            metrics.put(entry.getKey(), value * adjustment);
        }
        
        return metrics;
    }
    
    private int calculateCampaignDays(String duration) {
        switch (duration.toLowerCase()) {
            case "1-day":
                return 1;
            case "1-week":
                return 7;
            case "2-weeks":
                return 14;
            case "1-month":
                return 30;
            case "3-months":
                return 90;
            default:
                return 30;
        }
    }
    
    private double calculateAudienceMultiplier(String targetAudience) {
        if (targetAudience == null) return 1.0;
        
        String audience = targetAudience.toLowerCase();
        
        if (audience.contains("high income") || audience.contains("affluent")) {
            return 1.5;
        } else if (audience.contains("middle") && audience.contains("income")) {
            return 1.2;
        } else if (audience.contains("specific") || audience.contains("niche")) {
            return 1.3;
        } else if (audience.contains("professional") || audience.contains("business")) {
            return 1.4;
        } else if (audience.contains("student") || audience.contains("young")) {
            return 1.1;
        }
        
        return 1.0;
    }
    
    private double calculateObjectiveMultiplier(List<String> objectives) {
        if (objectives == null || objectives.isEmpty()) {
            return 1.0;
        }
        
        double multiplier = 1.0;
        
        // Brand awareness has slower but longer-term ROI
        if (objectives.contains("brand")) {
            multiplier *= 0.9;
        }
        
        // Store traffic and event promotion have more immediate ROI
        if (objectives.contains("traffic") || objectives.contains("event")) {
            multiplier *= 1.2;
        }
        
        // Product launch can go either way
        if (objectives.contains("launch")) {
            multiplier *= 1.1;
        }
        
        return multiplier;
    }
    
    private double calculateLocationFactor(String location) {
        if (location == null) return 1.0;
        
        String loc = location.toLowerCase();
        
        // Major cities have higher potential ROI due to population density
        if (loc.contains("mumbai") || loc.contains("delhi") || loc.contains("bangalore") || 
            loc.contains("kolkata") || loc.contains("chennai") || loc.contains("hyderabad")) {
            return 1.3;
        } else if (loc.contains("pune") || loc.contains("ahmedabad") || loc.contains("jaipur") || 
                   loc.contains("lucknow") || loc.contains("kochi")) {
            return 1.2;
        }
        
        return 1.0;
    }
    
    private Map<String, String> generateBestAreas(String location, String industry) {
        Map<String, String> areas = new HashMap<>();
        
        // Base areas that will be customized
        String[] highTrafficBase = {"Main Street", "City Center", "Transport Hub", "Market Area"};
        String[] shoppingBase = {"Shopping Mall", "Retail District", "Commercial Zone", "Market Place"};
        String[] businessBase = {"Business District", "Office Park", "Corporate Hub", "Tech Park"};
        
        // Location-specific customization
        String prefix = "";
        if (location != null) {
            String loc = location.toLowerCase();
            if (loc.contains("mumbai")) {
                prefix = "Mumbai ";
                highTrafficBase = new String[]{"Marine Drive", "Linking Road", "Juhu Beach", "Andheri Station Area"};
                shoppingBase = new String[]{"Phoenix Mall", "Inorbit Mall", "Linking Road", "Colaba Causeway"};
                businessBase = new String[]{"BKC", "Lower Parel", "Nariman Point", "Andheri East"};
            } else if (loc.contains("delhi")) {
                prefix = "Delhi ";
                highTrafficBase = new String[]{"Connaught Place", "India Gate", "Karol Bagh", "Chandni Chowk"};
                shoppingBase = new String[]{"Saket Select Citywalk", "DLF Promenade", "Khan Market", "Lajpat Nagar"};
                businessBase = new String[]{"Nehru Place", "Connaught Place", "Gurgaon Cyber City", "Noida Sector 62"};
            } else if (loc.contains("bangalore")) {
                prefix = "Bangalore ";
                highTrafficBase = new String[]{"MG Road", "Brigade Road", "Indiranagar", "Koramangala"};
                shoppingBase = new String[]{"Phoenix Marketcity", "UB City", "Commercial Street", "Jayanagar 4th Block"};
                businessBase = new String[]{"Whitefield", "Electronic City", "Manyata Tech Park", "Outer Ring Road"};
            }
        }
        
        // Industry-specific customization
        if (industry != null) {
            String ind = industry.toLowerCase();
            if (ind.contains("retail")) {
                shoppingBase = new String[]{"Premium Mall", "Fashion Street", "Main Market", "Shopping Hub"};
            } else if (ind.contains("restaurant") || ind.contains("food")) {
                highTrafficBase = new String[]{"Food Street", "Restaurant Row", "Cafe District", "Dining Hub"};
            } else if (ind.contains("tech")) {
                businessBase = new String[]{"Tech Park", "IT Hub", "Innovation Center", "Software Campus"};
            }
        }
        
        // Select random areas from each category
        areas.put("high_traffic", prefix + highTrafficBase[random.nextInt(highTrafficBase.length)]);
        areas.put("shopping", prefix + shoppingBase[random.nextInt(shoppingBase.length)]);
        areas.put("business", prefix + businessBase[random.nextInt(businessBase.length)]);
        
        return areas;
    }
    
    private Map<String, String> generateBestTimes(String industry) {
        Map<String, String> times = new HashMap<>();
        
        if (industry != null) {
            String ind = industry.toLowerCase();
            if (ind.contains("restaurant") || ind.contains("food")) {
                times.put("weekday_morning", "7 AM - 10 AM");
                times.put("weekday_evening", "6 PM - 10 PM");
                times.put("weekend", "11 AM - 9 PM");
            } else if (ind.contains("retail")) {
                times.put("weekday_morning", "10 AM - 1 PM");
                times.put("weekday_evening", "4 PM - 8 PM");
                times.put("weekend", "11 AM - 6 PM");
            } else if (ind.contains("entertainment")) {
                times.put("weekday_morning", "9 AM - 12 PM");
                times.put("weekday_evening", "6 PM - 11 PM");
                times.put("weekend", "1 PM - 9 PM");
            } else {
                times.put("weekday_morning", "8 AM - 11 AM");
                times.put("weekday_evening", "5 PM - 8 PM");
                times.put("weekend", "10 AM - 4 PM");
            }
        } else {
            times.put("weekday_morning", "8 AM - 11 AM");
            times.put("weekday_evening", "5 PM - 8 PM");
            times.put("weekend", "10 AM - 4 PM");
        }
        
        return times;
    }
    
    private int calculateBreakEvenDays(double cost, double revenue, int campaignDays) {
        if (revenue <= cost) return campaignDays; // Won't break even within campaign period
        
        double dailyRevenue = revenue / campaignDays;
        return (int) Math.ceil(cost / dailyRevenue);
    }
    
    private double calculatePaybackPeriod(double cost, double revenue, int campaignDays) {
        if (revenue <= cost) return campaignDays; // Won't break even within campaign period

        double dailyRevenue = revenue / campaignDays;
        return cost / dailyRevenue; // Return the payback period in days
    }
}

 