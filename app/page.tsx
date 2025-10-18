"use client"
import HeroSection2 from "@/components/HeroSection2"
import FeaturesSection from "@/components/FeaturesSection"
import CTASection from "@/components/CTASection"

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto min-h-screen bg-background">
      {/* Hero Section */}
      <HeroSection2 />
      {/* Features Section */}
      <FeaturesSection />
      {/* CTA Section */}
      <CTASection />
    </div>
  )
}
