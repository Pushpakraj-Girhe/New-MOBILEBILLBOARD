"use client"
import {
    ArrowRight,
    Building,
    Calendar,
    CheckCircle,
    Clock,
    Loader2,
    MapPin,
    MessageSquare,
    Phone,
    Target,
    Users,
} from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import RoiCalculator from "../components/RoiCalculator"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectItem } from "../components/ui/select"
import { Slider } from "../components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Textarea } from "../components/ui/textarea"
import "../index.css"

export default function PlanPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    businessName: "",
    industry: "",
    targetAudience: "",
    location: "",
    campaignDuration: "",
    budget: 0,
    startDate: "",
    additionalInfo: "",
    objectives: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    console.log("Form Data:", formData) // Debugging log
  }

  const handleSliderChange = (value) => {
    setFormData((prev) => ({ ...prev, budget: value[0] }))
  }

  const handleObjectiveToggle = (objective) => {
    setFormData((prev) => {
      const objectives = [...prev.objectives]
      if (objectives.includes(objective)) {
        return { ...prev, objectives: objectives.filter((o) => o !== objective) }
      } else {
        return { ...prev, objectives: [...objectives, objective] }
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Format the date to ISO string
      const formattedData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : null,
        // Ensure objectives is an array
        objectives: Array.isArray(formData.objectives) ? formData.objectives : []
      }

      console.log('Sending data to server:', formattedData) // Debug log

      // Send data to Spring Boot backend
      const response = await fetch('http://localhost:8080/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formattedData),
        credentials: 'omit' // Don't send credentials to avoid CORS issues
      })

      console.log('Response status:', response.status)
      
      // Try to get the error response text even if it's not JSON
      const responseText = await response.text()
      console.log('Response text:', responseText)
      
      if (!response.ok) {
        try {
          // Try to parse JSON if possible
          const errorData = JSON.parse(responseText)
          console.error('Server error details:', errorData)
        } catch (e) {
          // If not JSON, just log the text
          console.error('Server error (raw):', responseText)
        }
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${responseText}`)
      }

      // Parse the response as JSON if it was successful
      const data = responseText ? JSON.parse(responseText) : {}
      console.log('Campaign saved successfully:', data)

      // Also store in localStorage for CampaignResults.js to use
      localStorage.setItem("campaignData", JSON.stringify({ formData }))

      setIsSubmitting(false)
      setIsComplete(true)

      // Navigate to the results page after a short delay
      setTimeout(() => {
        navigate("/campaign-results")
      }, 1500)
    } catch (error) {
      console.error("Error submitting form:", error)
      setIsSubmitting(false)
      // You might want to show an error message to the user here
    }
  }

  const handlePreviewAnalytics = async () => {
    try {
      // Format the data
      const previewData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : null,
      };

      // Store the form data in localStorage temporarily for CampaignResults.js to use
      localStorage.setItem("tempFormData", JSON.stringify(previewData));

      // Call the AI Analytics preview endpoint
      const response = await fetch('http://localhost:8080/api/analytics/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(previewData),
      });

      if (!response.ok) {
        throw new Error(`Error previewing analytics: ${response.statusText}`);
      }

      const analyticsData = await response.json();
      
      // Store the analytics data in localStorage for the CampaignResults page to use
      localStorage.setItem("previewAnalytics", JSON.stringify(analyticsData));
      
      // Navigate to a preview page or show in a modal
      window.open('/campaign-results?preview=true', '_blank');
    } catch (error) {
      console.error("Error previewing analytics:", error);
      // Show an error notification
    }
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3))
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const objectives = [
    { id: "brand", label: "Brand Awareness", icon: Building },
    { id: "traffic", label: "Store Traffic", icon: Users },
    { id: "launch", label: "Product Launch", icon: Target },
    { id: "event", label: "Event Promotion", icon: Calendar },
  ]

  return (
    <div className="py-12 bg-gradient-to-b from-primary/30 to-white min-h-screen">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Plan Your Mobile Billboard Campaign</h1>
            <p className="text-lg text-gray-600">
              Tell us about your business and goals, and our AI will create the perfect route plan
            </p>
          </div>

          {!isComplete ? (
            <>
              {/* Progress Steps */}
              <div className="mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 1 ? "bg-primary" : "bg-gray-200"}`}
                    >
                      <Building className={`h-5 w-5 ${currentStep >= 1 ? "text-white" : "text-gray-500"}`} />
                    </div>
                    <span className="text-sm mt-2">Business Info</span>
                  </div>
                  <div className={`flex-1 h-1 mx-2 ${currentStep >= 2 ? "bg-primary" : "bg-gray-200"}`}></div>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 2 ? "bg-primary" : "bg-gray-200"}`}
                    >
                      <Target className={`h-5 w-5 ${currentStep >= 2 ? "text-white" : "text-gray-500"}`} />
                    </div>
                    <span className="text-sm mt-2">Campaign Goals</span>
                  </div>
                  <div className={`flex-1 h-1 mx-2 ${currentStep >= 3 ? "bg-primary" : "bg-gray-200"}`}></div>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${currentStep >= 3 ? "bg-primary" : "bg-gray-200"}`}
                    >
                      <MapPin className={`h-5 w-5 ${currentStep >= 3 ? "text-white" : "text-gray-500"}`} />
                    </div>
                    <span className="text-sm mt-2">Location & Budget</span>
                  </div>
                </div>
              </div>

              <Card className="border-primary/20">
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit}>
                    {/* Step 1: Business Information */}
                    {currentStep === 1 && (
                      <div className="space-y-6 animate-fade-in">
                        <h2 className="text-xl font-bold mb-4">Tell us about your business</h2>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="businessName">Business Name</Label>
                            <Input
                              id="businessName"
                              name="businessName"
                              value={formData.businessName}
                              onChange={handleInputChange}
                              placeholder="Your Business Name"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="industry">Industry</Label>
                            <Select
                              value={formData.industry}
                              onValueChange={(value) => {
                                console.log("Selected Industry:", value) // Debugging log
                                setFormData((prev) => ({ ...prev, industry: value }))
                              }}
                              placeholder="Select your industry"
                            >
                              <SelectItem value="retail">Retail</SelectItem>
                              <SelectItem value="restaurant">Restaurant/Food Service</SelectItem>
                              <SelectItem value="entertainment">Entertainment</SelectItem>
                              <SelectItem value="healthcare">Healthcare</SelectItem>
                              <SelectItem value="education">Education</SelectItem>
                              <SelectItem value="technology">Technology</SelectItem>
                              <SelectItem value="automotive">Automotive</SelectItem>
                              <SelectItem value="financial">Financial Services</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="targetAudience">Target Audience</Label>
                            <Textarea
                              id="targetAudience"
                              name="targetAudience"
                              value={formData.targetAudience}
                              onChange={handleInputChange}
                              placeholder="Describe your ideal customers (age, interests, behaviors, etc.)"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button
                            type="button"
                            onClick={nextStep}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            Next Step <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: Campaign Goals */}
                    {currentStep === 2 && (
                      <div className="space-y-6 animate-fade-in">
                        <h2 className="text-xl font-bold mb-4">What are your campaign objectives?</h2>

                        <div className="space-y-4">
                          <Label>Select all that apply</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {objectives.map((objective) => {
                              const Icon = objective.icon
                              return (
                                <div
                                  key={objective.id}
                                  onClick={() => handleObjectiveToggle(objective.id)}
                                  className={`p-4 border rounded-md cursor-pointer transition-all flex items-center ${
                                    formData.objectives.includes(objective.id)
                                      ? "border-primary bg-primary/10"
                                      : "border-gray-200 hover:border-primary/50"
                                  }`}
                                >
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                                      formData.objectives.includes(objective.id) ? "bg-primary" : "bg-gray-100"
                                    }`}
                                  >
                                    <Icon
                                      className={`h-5 w-5 ${
                                        formData.objectives.includes(objective.id) ? "text-white" : "text-gray-500"
                                      }`}
                                    />
                                  </div>
                                  <span className="font-medium">{objective.label}</span>
                                  {formData.objectives.includes(objective.id) && (
                                    <CheckCircle className="ml-auto h-5 w-5 text-primary" />
                                  )}
                                </div>
                              )
                            })}
                          </div>

                          <div>
                            <Label htmlFor="additionalInfo">Additional Campaign Details</Label>
                            <Textarea
                              id="additionalInfo"
                              name="additionalInfo"
                              value={formData.additionalInfo}
                              onChange={handleInputChange}
                              placeholder="Tell us more about your campaign goals, specific messages, or any other details that would help us plan your routes"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={prevStep}
                            className="border-primary text-primary hover:bg-primary/10"
                          >
                            Previous
                          </Button>
                          <Button
                            type="button"
                            onClick={nextStep}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            Next Step <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Location & Budget */}
                    {currentStep === 3 && (
                      <div className="space-y-6 animate-fade-in">
                        <h2 className="text-xl font-bold mb-4">Where and when do you want to advertise?</h2>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="location">Target Location</Label>
                            <Input
                              id="location"
                              name="location"
                              value={formData.location}
                              onChange={handleInputChange}
                              placeholder="City, neighborhood, or specific area"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="campaignDuration">Campaign Duration</Label>
                            <Select
                              value={formData.campaignDuration}
                              onValueChange={(value) => {
                                console.log("Selected Campaign Duration:", value) // Debugging log
                                setFormData((prev) => ({ ...prev, campaignDuration: value }))
                              }}
                              placeholder="Select campaign duration"
                            >
                              <SelectItem value="1-day">1 Day (Event)</SelectItem>
                              <SelectItem value="1-week">1 Week</SelectItem>
                              <SelectItem value="2-weeks">2 Weeks</SelectItem>
                              <SelectItem value="1-month">1 Month</SelectItem>
                              <SelectItem value="3-months">3 Months</SelectItem>
                              <SelectItem value="custom">Custom Duration</SelectItem>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                              id="startDate"
                              name="startDate"
                              type="date"
                              value={formData.startDate}
                              onChange={handleInputChange}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <Label htmlFor="budget">Budget (INR)</Label>
                              <span className="font-medium">₹{formData.budget.toLocaleString()}</span>
                            </div>
                            <Slider
                              id="budget"
                              min={1000}
                              max={50000}
                              step={1000}
                              value={[formData.budget]}
                              onValueChange={handleSliderChange}
                              className="py-4"
                            />
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>₹1,000</span>
                              <span>₹50,000+</span>
                            </div>
                          </div>
                        </div>

                        {/* Add ROI Calculator here */}
                        <RoiCalculator formData={formData} initialState="collapsed" />

                        <div className="flex gap-4 justify-between mt-8">
                          <Button onClick={prevStep} type="button" variant="outline">
                            Back
                          </Button>
                          <div className="flex gap-4">
                            <Button
                              type="button"
                              variant="outline"
                              className="bg-primary/20 text-primary hover:bg-primary/30"
                              onClick={handlePreviewAnalytics}
                            >
                              <Target className="mr-2 h-4 w-4" />
                              Preview AI Analytics
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                              {isSubmitting ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing
                                </>
                              ) : (
                                <>
                                  Submit Campaign
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center py-8 space-y-6 animate-fade-in">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold">Thank You for Your Submission!</h2>
                  <p className="text-lg text-gray-600 max-w-md mx-auto">
                    Our AI is now analyzing your information to create the perfect mobile billboard route plan for your
                    campaign.
                  </p>

                  <div className="bg-primary/10 p-6 rounded-lg max-w-md mx-auto">
                    <h3 className="font-bold mb-2">What happens next?</h3>
                    <ul className="text-left space-y-2">
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                        <span>You'll be redirected to your campaign results</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                        <span>Our AI will generate your optimized route plan</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                        <span>You'll see recommended locations, timings, and routes</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                        <span>You can review and save your campaign details</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-4">
                    <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Link to="/">Return to Home</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Information */}
          {!isComplete && (
            <div className="mt-12">
              <Tabs defaultValue="how-it-works">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                  <TabsTrigger value="contact">Need Help?</TabsTrigger>
                </TabsList>
                <TabsContent value="how-it-works" className="p-4 bg-white rounded-md mt-2 border">
                  <h3 className="font-bold mb-2">Our AI-Powered Route Planning Process</h3>
                  <ol className="space-y-2 ml-5 list-decimal">
                    <li>Submit your business and campaign information through this form</li>
                    <li>Our AI analyzes traffic patterns, demographics, and points of interest</li>
                    <li>We generate optimized routes based on your specific goals</li>
                    <li>You receive a detailed plan with timing recommendations</li>
                    <li>Our team helps you implement the plan with your mobile billboard provider</li>
                  </ol>
                </TabsContent>
                <TabsContent value="faq" className="p-4 bg-white rounded-md mt-2 border">
                  <h3 className="font-bold mb-2">Frequently Asked Questions</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">How long does it take to get my route plan?</h4>
                      <p className="text-sm text-gray-600">
                        Initial recommendations are ready within seconds. Complex campaigns may take longer.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Can I make changes to the plan?</h4>
                      <p className="text-sm text-gray-600">
                        Yes, our team will work with you to refine the plan based on your feedback.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium">Do you provide the mobile billboards?</h4>
                      <p className="text-sm text-gray-600">
                        We focus on route planning but can connect you with trusted mobile billboard providers.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="contact" className="p-4 bg-white rounded-md mt-2 border">
                  <h3 className="font-bold mb-2">Need Assistance?</h3>
                  <p className="mb-4">
                    Our team is here to help with any questions about your mobile billboard campaign.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 text-primary mr-2" />
                      <span>Email: support@adroute.com</span>
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-primary mr-2" />
                      <span>Phone: (555) 123-4567</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-primary mr-2" />
                      <span>Hours: Monday-Friday, 9am-6pm EST</span>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

