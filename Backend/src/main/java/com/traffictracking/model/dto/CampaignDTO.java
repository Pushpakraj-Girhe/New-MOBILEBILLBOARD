package com.traffictracking.model.dto;

//public class CampaignDTO {
//}

import java.time.LocalDate;
import java.util.List;

/**
 * Data Transfer Object for Campaign data
 * This can be used for API responses or requests if needed
 */
public class CampaignDTO {
    private Long id;
    private String businessName;
    private String industry;
    private String targetAudience;
    private String location;
    private String campaignDuration;
    private double budget;
    private LocalDate startDate;
    private String additionalInfo;
    private List<String> objectives;

    // Constructors, getters, and setters
    public CampaignDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getTargetAudience() {
        return targetAudience;
    }

    public void setTargetAudience(String targetAudience) {
        this.targetAudience = targetAudience;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCampaignDuration() {
        return campaignDuration;
    }

    public void setCampaignDuration(String campaignDuration) {
        this.campaignDuration = campaignDuration;
    }

    public double getBudget() {
        return budget;
    }

    public void setBudget(double budget) {
        this.budget = budget;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public String getAdditionalInfo() {
        return additionalInfo;
    }

    public void setAdditionalInfo(String additionalInfo) {
        this.additionalInfo = additionalInfo;
    }

    public List<String> getObjectives() {
        return objectives;
    }

    public void setObjectives(List<String> objectives) {
        this.objectives = objectives;
    }
}
