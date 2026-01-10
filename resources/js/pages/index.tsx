import { router, Head, Link } from "@inertiajs/react";
import { Search, MapPin, Clock, Shield, Star } from "lucide-react";
import { ChatButton } from "@/components/booking/chat-button";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/layouts/public-layout";

export default function Index() {
  return (
    <>
      <Head title="Professional Blood Collection At Your Doorstep" />

      <div className="min-h-screen bg-background">
        {/* Hero Section - Split Layout */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
              {/* Left: Text Content */}
              <div className="text-center lg:text-left mb-8 lg:mb-0">
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground mb-4 lg:mb-6">
                  Professional Blood Collection
                  <span className="block text-primary mt-2">At Your Doorstep</span>
                </h1>
                <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 lg:mb-8">
                  Book a certified mobile phlebotomist for convenient, safe, and professional blood collection services.
                </p>

                {/* CTA Button */}
                <Button
                  size="lg"
                  className="rounded-full text-base md:text-lg px-8 py-6 h-auto shadow-lg hover:scale-105 transition-transform"
                  asChild
                >
                  <Link href="/search">
                    <Search className="w-5 h-5" />
                    Find a Phlebotomist
                  </Link>
                </Button>
              </div>

              {/* Right: Hero Image/Placeholder */}
              <div className="hidden lg:block">
                <div className="relative">
                  {/* Gradient placeholder - replace with actual image when available */}
                  <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background border border-border shadow-xl flex items-center justify-center overflow-hidden">
                    <div className="text-center p-8">
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <Shield className="w-12 h-12 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Professional & Certified Care
                      </p>
                    </div>
                  </div>
                  {/* Uncomment and use this when hero image is available:
                  <img
                    src="/assets/hero-image.png"
                    alt="Professional blood collection at home"
                    className="w-full h-auto rounded-2xl shadow-xl"
                  />
                  */}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 lg:px-6 py-12 lg:py-16">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              <div className="p-6 lg:p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-2">Home Visit</h3>
                <p className="text-sm lg:text-base text-muted-foreground">
                  Our mobile phlebotomists come directly to your home, office, or preferred location.
                </p>
              </div>

              <div className="p-6 lg:p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-2">Quick Results</h3>
                <p className="text-sm lg:text-base text-muted-foreground">
                  Receive your test results within 24-48 hours directly to your email.
                </p>
              </div>

              <div className="p-6 lg:p-8 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />
                </div>
                <h3 className="text-lg lg:text-xl font-semibold text-foreground mb-2">CQC Registered</h3>
                <p className="text-sm lg:text-base text-muted-foreground">
                  All our phlebotomists are fully certified and registered with CQC.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="px-4 lg:px-6 py-12 lg:py-16 bg-muted/50">
          <div className="container mx-auto">
            <div className="max-w-5xl mx-auto text-center">
              <div className="flex items-center justify-center gap-1 mb-3 lg:mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 lg:w-6 lg:h-6 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm lg:text-base text-muted-foreground mb-8 lg:mb-12">
                Trusted by thousands of patients across the UK
              </p>
              <div className="grid grid-cols-3 gap-6 lg:gap-12">
                <div className="p-4 lg:p-6">
                  <p className="text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-2">500+</p>
                  <p className="text-xs lg:text-sm text-muted-foreground">Certified Phlebotomists</p>
                </div>
                <div className="p-4 lg:p-6">
                  <p className="text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-2">50,000+</p>
                  <p className="text-xs lg:text-sm text-muted-foreground">Successful Collections</p>
                </div>
                <div className="p-4 lg:p-6">
                  <p className="text-2xl lg:text-3xl xl:text-4xl font-bold text-foreground mb-2">4.9/5</p>
                  <p className="text-xs lg:text-sm text-muted-foreground">Average Rating</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Secondary CTA */}
        <section className="px-4 lg:px-6 py-12 lg:py-16 text-center">
          <div className="container mx-auto">
            <h2 className="text-xl lg:text-2xl xl:text-3xl font-semibold text-foreground mb-6">
              Ready to book your appointment?
            </h2>
            <Button
              size="lg"
              variant="secondary"
              className="rounded-full px-8 py-6 h-auto text-base lg:text-lg"
              asChild
            >
              <Link href="/search">Get Started</Link>
            </Button>
          </div>
        </section>

        <ChatButton />
      </div>
    </>
  );
}

Index.layout = (page: React.ReactNode) => <PublicLayout>{page}</PublicLayout>;
