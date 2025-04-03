package com.traffictracking.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

//import javax.persistence.*;
//import java.time.LocalDate;
//import java.util.List;
//
//@Data
//@Entity
//@Table(name = "campaigns")
//public class Campaign {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(nullable = false)
//    private String name;
//
//    @Column(nullable = false)
//    private LocalDate startDate;
//
//    @Column(nullable = false)
//    private LocalDate endDate;
//
//    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL)
//    private List<Advertisement> advertisements;
//
//    // Getters and setters
//}

@Data
@Entity
@Table(name = "campaigns")
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_name", nullable = false)
    private String businessName;
    
    @Column(nullable = false)
    private String industry;
    
    @Column(name = "target_audience", nullable = false)
    private String targetAudience;
    
    @Column(nullable = false)
    private String location;
    
    @Column(name = "campaign_duration", nullable = false)
    private String campaignDuration;
    
    @Column(nullable = false)
    private Double budget;
    
    @Column(name = "start_date")
    private LocalDate startDate;
    
    @Column(name = "additional_info")
    private String additionalInfo;
    
    @Column(name = "objectives_string")
    private String objectivesString;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Transient
    private List<String> objectives = new ArrayList<>();

    public Campaign() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.budget = 0.0;
    }
    
    @PrePersist
    public void beforeCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        // Handle objectives
        if (objectives != null && !objectives.isEmpty()) {
            this.objectivesString = String.join(",", objectives);
        }
    }
    
    @PreUpdate
    public void beforeUpdate() {
        updatedAt = LocalDateTime.now();
        
        // Handle objectives
        if (objectives != null && !objectives.isEmpty()) {
            this.objectivesString = String.join(",", objectives);
        }
    }
    
    @PostLoad
    public void afterLoad() {
        if (objectivesString != null && !objectivesString.isEmpty()) {
            this.objectives = new ArrayList<>(List.of(objectivesString.split(",")));
        }
    }

    @Override
    public String toString() {
        return "Campaign{" +
                "id=" + id +
                ", businessName='" + businessName + '\'' +
                ", industry='" + industry + '\'' +
                ", location='" + location + '\'' +
                ", campaignDuration='" + campaignDuration + '\'' +
                ", budget=" + budget +
                ", startDate=" + startDate +
                ", objectives=" + objectives +
                '}';
    }
}