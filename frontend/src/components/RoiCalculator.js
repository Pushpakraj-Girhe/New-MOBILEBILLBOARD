import {
    Calculator,
    ChevronDown,
    ChevronUp,
    Info,
    Lightbulb,
    LineChart,
    Loader2,
    PieChart,
    Target
} from "lucide-react";
import React, { useState } from 'react';
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const RoiCalculator = ({ formData, initialState = "expanded" }) => {
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(initialState === "expanded");
  const [roiData, setRoiData] = useState(null);
  const [error, setError] = useState(null);

  const calculateRoi = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8080/api/roi/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: formData.businessName || "Business",
          industry: formData.industry || "retail",
          targetAudience: formData.targetAudience || "General audience",
          location: formData.location || "Mumbai",
          campaignDuration: formData.campaignDuration || "1-month",
          budget: parseFloat(formData.budget) || 25000,
          objectives: Array.isArray(formData.objectives) ? formData.objectives : []
        }),
      });

      const result = await response.json();
      
      console.log("ROI Calculation Result:", result);

      if (result.success) {
        setRoiData(result.data);
      } else {
        console.error("ROI calculation failed:", result.message);
        setError(result.message || "Failed to calculate ROI. Please try again.");
      }
    } catch (err) {
      console.error("Error calculating ROI:", err);
      setError("An error occurred while calculating ROI. Please check your network connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format currency in INR
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format large numbers with commas
  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-IN').format(value);
  };

  return (
    <Card className="border-primary/10 overflow-hidden mb-6">
      <div 
        className="bg-primary/5 p-4 flex justify-between items-center cursor-pointer border-b"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          <h3 className="font-medium">ROI & Profitability Calculator</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-1 h-auto"
        >
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </Button>
      </div>

      {expanded && (
        <div className="p-4">
          <div className="text-sm mb-4 bg-blue-50 p-3 rounded-md border border-blue-100">
            <div className="flex items-start mb-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <p>
                Our AI-powered ROI calculator analyzes your campaign parameters to provide an estimate of your campaign's financial performance and return on investment.
              </p>
            </div>
            {!roiData && (
              <div className="flex items-start">
                <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
                <p>Click "Calculate ROI" to see predictions based on your campaign details.</p>
              </div>
            )}
          </div>

          {!roiData && !loading && (
            <div className="flex justify-center my-4">
              <Button 
                onClick={calculateRoi}
                className="bg-primary text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <LineChart className="mr-2 h-4 w-4" />
                    Calculate ROI
                  </>
                )}
              </Button>
            </div>
          )}

          {loading && (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-sm text-gray-500">
                Analyzing campaign parameters and calculating ROI predictions...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 text-red-800 rounded-md border border-red-200 mb-4">
              {error}
            </div>
          )}

          {roiData && (
            <div className="space-y-6 animate-fade-in">
              {/* ROI Summary Card */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg border border-green-100">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-primary flex items-center">
                    <Target className="h-4 w-4 mr-2" /> 
                    ROI Summary
                  </h4>
                  <div className="bg-white px-3 py-1 rounded-full border border-green-200 text-green-800 text-sm font-semibold">
                    {roiData.roi}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-white p-3 rounded-md border">
                    <div className="text-xs text-gray-500">Campaign Cost</div>
                    <div className="font-semibold text-gray-900">{formatCurrency(roiData.roiBreakdown?.campaignCost || 0)}</div>
                  </div>
                  <div className="bg-white p-3 rounded-md border">
                    <div className="text-xs text-gray-500">Estimated Revenue</div>
                    <div className="font-semibold text-green-700">{formatCurrency(roiData.roiBreakdown?.estimatedRevenue || 0)}</div>
                  </div>
                  <div className="bg-white p-3 rounded-md border">
                    <div className="text-xs text-gray-500">Net Profit</div>
                    <div className="font-semibold text-blue-700">{formatCurrency(roiData.roiBreakdown?.netProfit || 0)}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-md border">
                    <div className="text-xs text-gray-500">Break-even Point</div>
                    <div className="font-semibold flex items-center">
                      <span className="mr-1">{roiData.roiBreakdown?.breakEvenDays || "N/A"}</span>
                      <span className="text-xs text-gray-500">days</span>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-md border">
                    <div className="text-xs text-gray-500">Payback Period</div>
                    <div className="font-semibold flex items-center">
                      <span className="mr-1">{roiData.roiBreakdown?.paybackPeriod || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Campaign Performance Metrics */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <LineChart className="h-4 w-4 mr-2" />
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-lg border border-blue-200">
                    <div className="text-xs text-gray-500 mb-1">Total Impressions</div>
                    <div className="text-2xl font-bold text-blue-700">{formatNumber(roiData.totalImpressions || 0)}</div>
                    <div className="text-xs text-gray-600 mt-1">~{formatNumber(roiData.impressionsPerDay || 0)} per day</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 rounded-lg border border-purple-200">
                    <div className="text-xs text-gray-500 mb-1">Conversion Rate</div>
                    <div className="text-2xl font-bold text-purple-700">{roiData.conversionRate || "0%"}</div>
                    <div className="text-xs text-gray-600 mt-1">{formatNumber(roiData.conversions || 0)} conversions</div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 p-4 rounded-lg border border-amber-200">
                    <div className="text-xs text-gray-500 mb-1">Cost Efficiency</div>
                    <div className="text-2xl font-bold text-amber-700">₹{roiData.costPerConversion || 0}</div>
                    <div className="text-xs text-gray-600 mt-1">per conversion</div>
                  </div>
                </div>
              </div>
              
              {/* Contributing Factors */}
              {roiData.roiBreakdown?.contributingFactors && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <PieChart className="h-4 w-4 mr-2" />
                    ROI Factors
                  </h4>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(roiData.roiBreakdown.contributingFactors).map(([factor, value]) => (
                        <div key={factor} className="flex items-center">
                          <div className="w-full">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs capitalize">{factor.replace(/([A-Z])/g, ' $1')}</span>
                              <span className="text-xs font-medium">{Math.round(value)}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${Math.min(100, Math.round(value))}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex justify-between mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setRoiData(null);
                    setError(null);
                  }}
                >
                  Reset
                </Button>
                <Button 
                  onClick={calculateRoi}
                  className="bg-primary text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Recalculating...
                    </>
                  ) : (
                    <>
                      <LineChart className="mr-2 h-4 w-4" />
                      Recalculate
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default RoiCalculator; 