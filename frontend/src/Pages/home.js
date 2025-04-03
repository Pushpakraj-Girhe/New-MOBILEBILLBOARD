"use client"

import { useState, useEffect } from "react"
import {Link} from "react-router-dom"
import { TrendingUp, Target, DollarSign, Users, ChevronRight, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "../components/ui/button"
import  {Card, CardContent}  from "../components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordian"

export default function Home() {
  const [isVisible, setIsVisible] = useState({
    hero: false,
    features: false,
    how: false,
    testimonials: false,
  })

  useEffect(() => {
    setIsVisible({
      hero: true,
      features: true,
      how: true,
      testimonials: true,
    })
  }, [])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section
        className={`bg-gradient-to-b from-primary to-primary/40 py-16 md:py-24 transition-opacity duration-1000 ${isVisible.hero ? "opacity-100" : "opacity-0"}`}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary-foreground">
                Smart Mobile Billboard Routing with AI
              </h1>
              <p className="text-lg mb-8 text-primary-foreground/90">
                Maximize your outdoor advertising impact with data-driven route planning. Our AI analyzes traffic
                patterns, demographics, and points of interest to create the most effective mobile billboard routes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  <Link to="/plan">Plan Your Route</Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Learn More
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="map-container bg-white shadow-lg rounded-lg border border-primary/30">
                <div className="route-animation"></div>
                <div className="billboard-icon" style={{ top: "30%", left: "30%" }}>
                  📍
                </div>
                <div className="billboard-icon" style={{ top: "50%", left: "70%" }}>
                  📍
                </div>
                <div className="billboard-icon" style={{ top: "20%", left: "50%" }}>
                  📍
                </div>
                <div className="billboard-icon" style={{ top: "70%", left: "20%" }}>
                  📍
                </div>
                <div className="absolute bottom-4 right-4 bg-white p-2 rounded-md text-xs">
                  AI-optimized route visualization
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        className={`py-16 bg-white transition-opacity duration-1000 ${isVisible.features ? "opacity-100" : "opacity-0"}`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose AdRoute?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform takes the guesswork out of mobile billboard advertising
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-primary/20 hover:border-primary transition-all duration-300 hover:shadow-md">
              <CardContent className="pt-6">
                <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Target className="text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Precision Targeting</h3>
                <p className="text-gray-600">
                  Reach your ideal audience with routes that target specific demographics, behaviors, and locations
                  based on AI analysis.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary transition-all duration-300 hover:shadow-md">
              <CardContent className="pt-6">
                <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Data-Driven Results</h3>
                <p className="text-gray-600">
                  Make decisions based on real data, not guesswork. Our AI analyzes traffic patterns, event schedules,
                  and more for optimal exposure.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20 hover:border-primary transition-all duration-300 hover:shadow-md">
              <CardContent className="pt-6">
                <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Maximize ROI</h3>
                <p className="text-gray-600">
                  Get more value from your mobile billboard investment with routes designed to maximize impressions and
                  engagement.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        className={`py-16 bg-secondary/30 transition-opacity duration-1000 ${isVisible.how ? "opacity-100" : "opacity-0"}`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How AdRoute Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Our simple process delivers powerful results</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <span className="text-xl font-bold">1</span>
                <div className="hidden md:block absolute top-1/2 -right-1/2 transform -translate-y-1/2 w-full h-0.5 bg-primary"></div>
              </div>
              <h3 className="text-xl font-bold mb-2">Share Your Goals</h3>
              <p className="text-gray-600">Tell us about your business, target audience, and campaign objectives.</p>
            </div>

            <div className="text-center">
              <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <span className="text-xl font-bold">2</span>
                <div className="hidden md:block absolute top-1/2 -right-1/2 transform -translate-y-1/2 w-full h-0.5 bg-primary"></div>
              </div>
              <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
              <p className="text-gray-600">
                Our AI analyzes traffic, demographics, and points of interest to create optimal routes.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <span className="text-xl font-bold">3</span>
                <div className="hidden md:block absolute top-1/2 -right-1/2 transform -translate-y-1/2 w-full h-0.5 bg-primary"></div>
              </div>
              <h3 className="text-xl font-bold mb-2">Route Optimization</h3>
              <p className="text-gray-600">
                Receive detailed route plans with timing recommendations for maximum impact.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Measure & Refine</h3>
              <p className="text-gray-600">
                Track performance and refine routes based on real-world results and feedback.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link to="/plan">
                Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        className={`py-16 bg-white transition-opacity duration-1000 ${isVisible.testimonials ? "opacity-100" : "opacity-0"}`}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how businesses like yours achieved remarkable results with AdRoute
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mr-4">
                    <Users className="text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold">Metro Retail</h3>
                    <p className="text-sm text-gray-500">Fashion Retailer</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "AdRoute helped us increase foot traffic to our new store location by 37% during our grand opening
                  week. The AI-optimized routes put our mobile billboards exactly where our target customers were."
                </p>
                <div className="flex items-center">
                  <span className="text-sm font-medium">Results:</span>
                  <span className="ml-2 text-sm text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" /> 37% increase in store visits
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mr-4">
                    <Users className="text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold">Urban Eats</h3>
                    <p className="text-sm text-gray-500">Restaurant Chain</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "We used AdRoute to promote our new menu launch. The AI suggested routes near office buildings during
                  lunch hours, which was genius. Our sales increased by 42% compared to our previous campaigns."
                </p>
                <div className="flex items-center">
                  <span className="text-sm font-medium">Results:</span>
                  <span className="ml-2 text-sm text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" /> 42% increase in sales
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mr-4">
                    <Users className="text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold">TechStart</h3>
                    <p className="text-sm text-gray-500">Software Company</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  "As a tech company, we were skeptical about traditional advertising, but AdRoute's data-driven
                  approach convinced us. We saw a 53% increase in app downloads in the areas where our mobile billboards
                  operated."
                </p>
                <div className="flex items-center">
                  <span className="text-sm font-medium">Results:</span>
                  <span className="ml-2 text-sm text-green-600 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" /> 53% increase in app downloads
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-primary/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get answers to common questions about our mobile billboard route planning service
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How does your AI determine the best routes?</AccordionTrigger>
                <AccordionContent>
                  Our AI analyzes multiple data points including traffic patterns, demographic information, points of
                  interest, event schedules, and historical advertising performance. It creates routes that maximize
                  visibility among your target audience while It creates routes that maximize visibility among your
                  target audience while considering factors like time of day, traffic congestion, and seasonal
                  variations to ensure optimal exposure.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>How much does the service cost?</AccordionTrigger>
                <AccordionContent>
                  We offer flexible pricing plans based on your campaign needs. Our basic package starts at $499 per
                  month, which includes route planning for one vehicle in one city. Custom enterprise solutions are
                  available for larger campaigns. Contact our sales team for a personalized quote.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>Do you provide the mobile billboards too?</AccordionTrigger>
                <AccordionContent>
                  We focus on route planning and optimization, but we have partnerships with mobile billboard providers
                  nationwide. We can connect you with trusted vendors or work with your existing provider to implement
                  our optimized routes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>How quickly can I get started?</AccordionTrigger>
                <AccordionContent>
                  Once you provide your campaign details through our planning form, our AI can generate initial route
                  recommendations within 24-48 hours. For more complex campaigns or custom requirements, our team will
                  work with you to develop a tailored solution.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>Can I track the performance of my campaigns?</AccordionTrigger>
                <AccordionContent>
                  Yes, we provide a comprehensive dashboard that shows estimated impressions, audience demographics, and
                  other key metrics. For campaigns with QR codes or specific landing pages, we can integrate with your
                  analytics tools to measure direct response.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg mb-4">Still have questions?</p>
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              Contact Our Support Team
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-secondary-foreground">
            Ready to Transform Your Mobile Billboard Strategy?
          </h2>
          <p className="text-lg text-secondary-foreground/90 max-w-2xl mx-auto mb-8">
            Get started today and see how our AI-powered route planning can maximize your advertising impact.
          </p>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/plan" className="flex items-center">
              Plan Your Route Now <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
