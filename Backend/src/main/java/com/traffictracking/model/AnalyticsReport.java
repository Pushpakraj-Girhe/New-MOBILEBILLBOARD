package com.traffictracking.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analytics_reports")
public class AnalyticsReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private Long impressions;

    @Column(nullable = false)
    private Double engagementRate;

    @ManyToOne
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;

    // Getters and setters
}

