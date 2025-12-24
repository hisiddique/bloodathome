import { useState } from "react";
import { router, Head, Link } from "@inertiajs/react";
import { Menu, Search, MapPin, Clock, Shield, Star } from "lucide-react";
import { ChatButton } from "@/components/booking/chat-button";
import { PublicSidebar } from "@/components/public-sidebar";

export default function Index() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Head title="Professional Blood Collection At Your Doorstep" />

      <div className="min-h-screen bg-background">
        <PublicSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

        {/* Header with Menu */}
        <div className="flex items-center justify-between px-6 pt-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <img src="/assets/logo.png" alt="BloodAtHome" className="h-20 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-foreground hover:opacity-80 transition-opacity">
              Sign in
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="px-6 pt-12 pb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
            Professional Blood Collection
            <span className="block text-primary">At Your Doorstep</span>
          </h1>
          <p className="text-muted-foreground text-center text-base md:text-lg max-w-xl mx-auto mb-8">
            Book a certified mobile phlebotomist for convenient, safe, and professional blood collection services.
          </p>

          {/* CTA Button */}
          <div className="flex justify-center">
            <button
              onClick={() => router.visit("/search")}
              className="flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold text-lg shadow-lg hover:opacity-90 transition-all hover:scale-105"
            >
              <Search className="w-5 h-5" />
              Find a Phlebotomist
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Home Visit</h3>
              <p className="text-sm text-muted-foreground">
                Our mobile phlebotomists come directly to your home, office, or preferred location.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Quick Results</h3>
              <p className="text-sm text-muted-foreground">
                Receive your test results within 24-48 hours directly to your email.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">CQC Registered</h3>
              <p className="text-sm text-muted-foreground">
                All our phlebotomists are fully certified and registered with CQC.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="px-6 py-8 bg-muted/50">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by thousands of patients across the UK
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">500+</p>
                <p className="text-xs text-muted-foreground">Certified Phlebotomists</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">50,000+</p>
                <p className="text-xs text-muted-foreground">Successful Collections</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">4.9/5</p>
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary CTA */}
        <div className="px-6 py-12 text-center">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Ready to book your appointment?
          </h2>
          <button
            onClick={() => router.visit("/search")}
            className="px-6 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
          </button>
        </div>

        <ChatButton />
      </div>
    </>
  );
}
