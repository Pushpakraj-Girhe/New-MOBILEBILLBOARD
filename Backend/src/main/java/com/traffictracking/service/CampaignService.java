package com.traffictracking.service;

//import com.traffictracking.model.Campaign;
//import com.traffictracking.repository.CampaignRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//public class CampaignManagementService {
//
//    @Autowired
//    private CampaignRepository campaignRepository;
//
//    public List<Campaign> getAllCampaigns() {
//        return campaignRepository.findAll();
//    }
//
//    public Campaign createCampaign(Campaign campaign) {
//        return campaignRepository.save(campaign);
//    }
//
//    public Campaign updateCampaign(Long id, Campaign campaignDetails) {
//        Campaign campaign = campaignRepository.findById(id)
//                .orElseThrow(() -> new RuntimeException("Campaign not found"));
//
//        campaign.setName(campaignDetails.getName());
//        campaign.setStartDate(campaignDetails.getStartDate());
//        campaign.setEndDate(campaignDetails.getEndDate());
//
//        return campaignRepository.save(campaign);
//    }
//
//    public void deleteCampaign(Long id) {
//        campaignRepository.deleteById(id);
//    }
//}


import com.traffictracking.model.Campaign;
import com.traffictracking.repository.CampaignRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CampaignService {

    private final CampaignRepository campaignRepository;

    @Autowired
    public CampaignService(CampaignRepository campaignRepository) {
        this.campaignRepository = campaignRepository;
    }

    public Campaign saveCampaign(Campaign campaign) {
        return campaignRepository.save(campaign);
    }

    public List<Campaign> getAllCampaigns() {
        return campaignRepository.findAll();
    }

    public Optional<Campaign> getCampaignById(Long id) {
        return campaignRepository.findById(id);
    }

    public List<Campaign> getCampaignsByBusinessName(String businessName) {
        return campaignRepository.findByBusinessNameContainingIgnoreCase(businessName);
    }

    public List<Campaign> getCampaignsByLocation(String location) {
        return campaignRepository.findByLocationContainingIgnoreCase(location);
    }

    public List<Campaign> getCampaignsByIndustry(String industry) {
        return campaignRepository.findByIndustry(industry);
    }

    public Campaign updateCampaign(Long id, Campaign campaignDetails) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Campaign not found with id: " + id));

        campaign.setBusinessName(campaignDetails.getBusinessName());
        campaign.setIndustry(campaignDetails.getIndustry());
        campaign.setTargetAudience(campaignDetails.getTargetAudience());
        campaign.setLocation(campaignDetails.getLocation());
        campaign.setCampaignDuration(campaignDetails.getCampaignDuration());
        campaign.setBudget(campaignDetails.getBudget());
        campaign.setStartDate(campaignDetails.getStartDate());
        campaign.setAdditionalInfo(campaignDetails.getAdditionalInfo());
        campaign.setObjectives(campaignDetails.getObjectives());

        return campaignRepository.save(campaign);
    }

    public void deleteCampaign(Long id) {
        campaignRepository.deleteById(id);
    }
}

