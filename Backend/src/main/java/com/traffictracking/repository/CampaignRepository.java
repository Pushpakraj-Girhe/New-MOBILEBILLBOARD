package com.traffictracking.repository;
//
//import com.traffictracking.model.Campaign;
//import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.stereotype.Repository;
//
//@Repository
//public interface CampaignRepository extends JpaRepository<Campaign, Long> {

//}


import com.traffictracking.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    // Find campaigns by business name
    List<Campaign> findByBusinessNameContainingIgnoreCase(String businessName);

    // Find campaigns by location
    List<Campaign> findByLocationContainingIgnoreCase(String location);

    // Find campaigns by industry
    List<Campaign> findByIndustry(String industry);
}
